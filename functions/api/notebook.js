export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT id, name, comment, created_at FROM entries ORDER BY created_at DESC, id DESC LIMIT 200'
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

  await env.DB.prepare('INSERT INTO entries (name, comment) VALUES (?, ?)')
    .bind(name, comment)
    .run();

  return new Response(JSON.stringify({ ok: true }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}
