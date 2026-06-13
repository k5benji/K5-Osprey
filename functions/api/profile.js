import { getSessionUser, publicUser, json, followStats } from '../_auth.js';

export async function onRequestPost({ request, env }) {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: 'Not signed in.' }, 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  const username = (body.username ?? '').toString().trim().toLowerCase();
  const displayName = (body.displayName ?? '').toString().trim().slice(0, 40);
  const bio = (body.bio ?? '').toString().trim().slice(0, 200);

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return json({ error: 'Username must be 3–20 characters: letters, numbers, underscores.' }, 400);
  }

  const clash = await env.DB.prepare('SELECT 1 FROM users WHERE username = ? AND id != ?')
    .bind(username, user.id)
    .first();
  if (clash) return json({ error: 'That username is taken.' }, 409);

  await env.DB.prepare(
    'UPDATE users SET username = ?, display_name = ?, bio = ? WHERE id = ?'
  )
    .bind(username, displayName || username, bio, user.id)
    .run();

  const updated = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(user.id).first();
  const stats = await followStats(env, updated, updated.id);
  return json({ ...publicUser(updated), me: true, ...stats });
}
