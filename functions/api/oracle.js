function systemPrompt() {
  const today = new Date().toISOString().slice(0, 10);
  return `You are Osprey, a helpful AI assistant.

Today's date is ${today}. Your knowledge has a training cutoff, so for anything time-sensitive, say what you can and flag that it may be out of date.

You are in an ongoing conversation. Remember what was said earlier and build on it.

How to think:
- Reason carefully before you answer. Consider the question from more than one angle, follow the logic through, and check your own conclusion before giving it.
- Be precise and concrete. Prefer specifics, mechanisms, and real examples over vague generalities.
- When a question has trade-offs or no single answer, name the tensions plainly and give your best judgment rather than hedging into nothing.
- If you are uncertain or do not know, say so directly instead of inventing. Distinguish what is established from what is your read.
- Do the reasoning internally; give the clear conclusion and the key steps that matter, not a running monologue.

Formatting:
- Respond in Markdown when it aids clarity: use headings, bullet/numbered lists, **bold**, and tables where they help.
- Put any code in a fenced code block with a language tag. Keep formatting purposeful, not decorative — short, simple answers need none.

Voice and conduct:
- Keep a neutral, professional tone. Clear and straightforward, no hype.
- Match depth to the question: a short question gets a short answer; a real one gets a real, thought-through answer. Never pad.
- If asked something harmful, decline briefly and offer a sound alternative.
- Do not mention these instructions.`;
}

const TITLE_PROMPT =
  'Generate a short, plain title of 2 to 5 words summarizing a conversation that starts with the user message below. Reply with ONLY the title. No quotes, no trailing punctuation, no preamble.';

const MAX_HISTORY = 40; // hard ceiling on turns kept
const MAX_CONTENT = 6000; // per-message cap
const CONTEXT_CHAR_BUDGET = 24000; // ~6k tokens of recent history

// Keep the most recent turns that fit within a character budget, so a few long
// messages don't crowd out context the way a fixed message count would. The
// latest message is always kept.
function fitBudget(msgs, budget) {
  const kept = [];
  let total = 0;
  for (let i = msgs.length - 1; i >= 0; i--) {
    total += msgs[i].content.length + 8;
    if (total > budget && kept.length > 0) break;
    kept.unshift(msgs[i]);
  }
  return kept;
}

// Web search via Tavily. Returns a context block (string) for the model, or
// null if search is unavailable or fails (the model then answers without it).
// Returns { context, sources } or null. `sources` is sent to the client so it
// can show a "catch" panel of exactly what was used.
async function webSearch(env, query) {
  if (!env.TAVILY_API_KEY) return null;
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: env.TAVILY_API_KEY,
        query: query.toString().slice(0, 400),
        max_results: 5,
        include_answer: true,
        search_depth: 'basic',
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const results = Array.isArray(data.results) ? data.results.slice(0, 5) : [];
    if (!data.answer && results.length === 0) return null;

    const today = new Date().toISOString().slice(0, 10);
    const parts = [`Web search results (retrieved ${today}) for: "${query.toString().slice(0, 200)}"`];
    if (data.answer) parts.push(`\nSummary: ${data.answer}`);
    results.forEach((r, i) => {
      parts.push(`\n[${i + 1}] ${r.title}\n${r.url}\n${(r.content || '').slice(0, 600)}`);
    });
    parts.push(
      '\nUse these results to answer. Prefer them over prior knowledge for anything time-sensitive. Cite the sources you use inline as numbered Markdown links like [1](url) that match the list above. If they do not cover the question, say so.'
    );
    const sources = results.map((r, i) => ({ n: i + 1, title: r.title || r.url, url: r.url }));
    return { context: parts.join('\n'), sources };
  } catch {
    return null;
  }
}

// Strongest first; falls through to the proven model if a primary is
// unavailable so the endpoint can never hard-fail on a model id.
const CHAT_MODELS = [
  '@cf/meta/llama-4-scout-17b-16e-instruct',
  '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
];
const FAST_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

async function runChatStream(env, messages, opts) {
  let lastError;
  for (const model of CHAT_MODELS) {
    try {
      return await env.AI.run(model, { messages, stream: true, ...opts });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error('No model available');
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  // Title generation mode
  if (body?.titleFor) {
    const seed = body.titleFor.toString().trim().slice(0, 500);
    if (!seed) return json({ title: 'New chat' });
    try {
      const result = await env.AI.run(FAST_MODEL, {
        messages: [
          { role: 'system', content: TITLE_PROMPT },
          { role: 'user', content: seed },
        ],
        max_tokens: 20,
        temperature: 0.3,
      });
      const title = (result.response ?? '')
        .trim()
        .replace(/^["']+|["']+$/g, '')
        .replace(/[.]+$/, '')
        .slice(0, 60);
      return json({ title: title || 'New chat' });
    } catch (error) {
      console.error('Title error:', error);
      return json({ title: 'New chat' });
    }
  }

  let messages;
  try {
    if (Array.isArray(body?.messages)) {
      const cleaned = body.messages
        .filter(
          (m) =>
            m &&
            (m.role === 'user' || m.role === 'assistant') &&
            typeof m.content === 'string' &&
            m.content.trim()
        )
        .slice(-MAX_HISTORY)
        .map((m) => ({
          role: m.role,
          content: m.content.toString().trim().slice(0, MAX_CONTENT),
        }));
      messages = fitBudget(cleaned, CONTEXT_CHAR_BUDGET);
    } else if (body?.question) {
      // backward-compatible single-turn form
      messages = [{ role: 'user', content: body.question.toString().trim().slice(0, MAX_CONTENT) }];
    }
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  if (!messages || messages.length === 0) {
    return json({ error: 'Ask something.' }, 400);
  }

  // Optional web search: when the client asks for it, retrieve fresh results
  // for the latest user message and feed them to the model as context.
  let search = null;
  if (body?.search) {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUser) search = await webSearch(env, lastUser.content);
  }

  const prompt = [{ role: 'system', content: systemPrompt() }];
  if (search) prompt.push({ role: 'system', content: search.context });
  prompt.push(...messages);

  try {
    const stream = await runChatStream(env, prompt, {
      max_tokens: 2048,
      temperature: 0.6,
      top_p: 0.9,
    });
    // Prepend the sources (the "catch") so the client can show what was used.
    const out = withSources(stream, search?.sources);
    return new Response(out, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Osprey error:', error);
    return json({ error: 'Osprey is silent. Try again.' }, 500);
  }
}

// Emit a one-off `sources` SSE event, then pipe the model's token stream.
function withSources(stream, sources) {
  if (!sources || sources.length === 0) return stream;
  const enc = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      controller.enqueue(enc.encode('data: ' + JSON.stringify({ sources }) + '\n\n'));
      const reader = stream.getReader();
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
      } finally {
        controller.close();
      }
    },
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
