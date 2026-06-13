import { parseCookies } from '../../_auth.js';

export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);
  const cookies = parseCookies(request.headers.get('Cookie'));
  if (cookies.session) {
    await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(cookies.session).run();
  }
  const headers = new Headers();
  headers.append('Set-Cookie', 'session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
  headers.set('Content-Type', 'application/json');
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}
