import { getSessionUser, json, followStats } from '../_auth.js';

export async function onRequestPost({ request, env }) {
  const me = await getSessionUser(request, env);
  if (!me) return json({ error: 'Sign in to follow.' }, 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }
  const username = (body.username ?? '').toString().trim().toLowerCase();
  if (!username) return json({ error: 'Missing user.' }, 400);

  const target = await env.DB.prepare('SELECT * FROM users WHERE username = ?')
    .bind(username)
    .first();
  if (!target) return json({ error: 'No such user.' }, 404);
  if (target.id === me.id) return json({ error: "You can't follow yourself." }, 400);

  const existing = await env.DB.prepare(
    'SELECT 1 FROM follows WHERE follower_id = ? AND followee_id = ?'
  )
    .bind(me.id, target.id)
    .first();

  if (existing) {
    await env.DB.prepare('DELETE FROM follows WHERE follower_id = ? AND followee_id = ?')
      .bind(me.id, target.id)
      .run();
  } else {
    await env.DB.prepare('INSERT INTO follows (follower_id, followee_id) VALUES (?, ?)')
      .bind(me.id, target.id)
      .run();
  }

  const stats = await followStats(env, target, me.id);
  return json({ following: stats.isFollowing, followers: stats.followers });
}
