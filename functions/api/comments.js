export async function onRequestPost({ request, env }) {
  const formData = await request.formData();

  const name = formData.get('name')?.toString().trim();
  const comment = formData.get('comment')?.toString().trim();

  if (!name || !comment) {
    return new Response('Name and comment are required.', { status: 400 });
  }

  await env.DB.prepare(
    'INSERT INTO comments (name, comment) VALUES (?, ?)' 
  )
    .bind(name, comment)
    .run();

  return Response.redirect(new URL('/notebook/', request.url), 303);
}
