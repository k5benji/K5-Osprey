import { getSessionUser, json } from '../../_auth.js';

const TYPES = ['spark', 'ping'];

export async function onRequestPost({ request, env }) {
  const me = await getSessionUser(request, env);
  if (!me) return json({ error: 'Sign in to react.' }, 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }
  const postId = (body.postId ?? '').toString();
  const type = (body.type ?? '').toString();
  if (!postId || !TYPES.includes(type)) return json({ error: 'Invalid request.' }, 400);

  const existing = await env.DB.prepare(
    'SELECT 1 FROM post_reactions WHERE post_id = ? AND user_id = ? AND type = ?'
  )
    .bind(postId, me.id, type)
    .first();

  if (existing) {
    await env.DB.prepare('DELETE FROM post_reactions WHERE post_id = ? AND user_id = ? AND type = ?')
      .bind(postId, me.id, type)
      .run();
  } else {
    await env.DB.prepare('INSERT INTO post_reactions (post_id, user_id, type) VALUES (?, ?, ?)')
      .bind(postId, me.id, type)
      .run();
  }

  const row = await env.DB.prepare(
    'SELECT COUNT(*) AS c FROM post_reactions WHERE post_id = ? AND type = ?'
  )
    .bind(postId, type)
    .first();
  return json({ type, on: !existing, count: row?.c ?? 0 });
}
