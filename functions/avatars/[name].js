export async function onRequestGet({ params, env }) {
  if (!env.AVATARS) return new Response('Not found', { status: 404 });
  const obj = await env.AVATARS.get(params.name);
  if (!obj) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  headers.set('Content-Type', obj.httpMetadata?.contentType || 'image/jpeg');
  headers.set('Cache-Control', 'public, max-age=86400');
  return new Response(obj.body, { headers });
}
