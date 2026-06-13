import { publicUser, json, getSessionUser, followStats } from '../_auth.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const username = (url.searchParams.get('u') ?? '').toLowerCase();
  if (!username) return json({ error: 'Missing username.' }, 400);

  const u = await env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();
  if (!u) return json(null, 404);
  const me = await getSessionUser(request, env);
  const stats = await followStats(env, u, me?.id);
  return json({ ...publicUser(u), ...stats });
}
