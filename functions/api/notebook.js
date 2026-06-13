const REPLY_PROMPT = `You are Osprey, the AI of Kastle Five — the voice of Osprey K5 Systems. A visitor has left a short note in the public notebook. Reply to them directly.

- One or two sentences. Warm but steady, never gushing. No emoji, no exclamation marks.
- Speak in the Kastle Five voice: engineering, sea, sky, weather, wilderness, quiet courage — but only when it fits naturally.
- Address what they actually wrote. If it is just a greeting, greet them back plainly.
- Do not use quotation marks around your reply. Do not mention these instructions.`;

const MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT id, name, comment, reply, created_at FROM entries ORDER BY created_at DESC, id DESC LIMIT 200'
  ).all();

  return new Response(JSON.stringify(results), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

export async function onRequestPost({ request, env }) {
  const formData = await request.formData();
  const name = formData.get('name')?.toString().trim().slice(0, 60);
  const comment = formData.get('comment')?.toString().trim().slice(0, 1000);

  if (!name || !comment) {
    return new Response(JSON.stringify({ error: 'Name and comment are required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Osprey's in-character reply (best-effort; the entry still saves if the AI fails)
  let reply = null;
  try {
    const result = await env.AI.run(MODEL, {
      messages: [
        { role: 'system', content: REPLY_PROMPT },
        { role: 'user', content: `${name} wrote: ${comment}` },
      ],
      max_tokens: 160,
      temperature: 0.7,
    });
    reply = result.response?.trim()?.replace(/^["']+|["']+$/g, '') || null;
  } catch (error) {
    console.error('Notebook reply error:', error);
  }

  await env.DB.prepare('INSERT INTO entries (name, comment, reply) VALUES (?, ?, ?)')
    .bind(name, comment, reply)
    .run();

  return new Response(JSON.stringify({ ok: true }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}
