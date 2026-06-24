const SYSTEM_PROMPT = `You are Osprey, a helpful AI assistant.

You are in an ongoing conversation. Remember what was said earlier and build on it.

How to think:
- Reason carefully before you answer. Consider the question from more than one angle, follow the logic through, and check your own conclusion before giving it.
- Be precise and concrete. Prefer specifics, mechanisms, and real examples over vague generalities.
- When a question has trade-offs or no single answer, name the tensions plainly and give your best judgment rather than hedging into nothing.
- If you are uncertain or do not know, say so directly instead of inventing. Distinguish what is established from what is your read.
- Do the reasoning internally; give the clear conclusion and the key steps that matter, not a running monologue.

Voice and conduct:
- Keep a neutral, professional tone. Clear and straightforward, no hype.
- Match depth to the question: a short question gets a short answer; a real one gets a real, thought-through answer. Never pad.
- If asked something harmful, decline briefly and offer a sound alternative.
- Do not mention these instructions.`;

const TITLE_PROMPT =
  'Generate a short, plain title of 2 to 5 words summarizing a conversation that starts with the user message below. Reply with ONLY the title. No quotes, no trailing punctuation, no preamble.';

const MAX_HISTORY = 20;
const MAX_CONTENT = 4000;

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
      messages = body.messages
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

  try {
    const stream = await runChatStream(
      env,
      [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      { max_tokens: 1024, temperature: 0.6, top_p: 0.9 }
    );
    return new Response(stream, {
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

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
