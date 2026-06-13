import { getSessionUser, formatPost, json } from '../_auth.js';

const MAX_LEN = 500;

export async function onRequestGet({ request, env }) {
  const me = await getSessionUser(request, env);
  const uid = me ? me.id : '';
  const url = new URL(request.url);
  const userFilter = (url.searchParams.get('user') || '').toLowerCase();

  const where = userFilter ? 'WHERE u.username = ?' : '';
  const binds = userFilter ? [uid, uid, userFilter] : [uid, uid];

  const { results } = await env.DB.prepare(
    `SELECT p.id, p.content, p.created_at, p.base_likes, p.base_reposts,
       u.username, u.display_name, u.verified, u.engineer, u.avatar_key, u.avatar_url,
       (SELECT COUNT(*) FROM post_likes l WHERE l.post_id = p.id) AS like_count,
       (SELECT COUNT(*) FROM post_reposts r WHERE r.post_id = p.id) AS repost_count,
       (SELECT COUNT(*) FROM post_likes l WHERE l.post_id = p.id AND l.user_id = ?) AS liked,
       (SELECT COUNT(*) FROM post_reposts r WHERE r.post_id = p.id AND r.user_id = ?) AS reposted
     FROM posts p JOIN users u ON u.id = p.user_id
     ${where}
     ORDER BY p.created_at DESC, p.id DESC LIMIT 100`
  )
    .bind(...binds)
    .all();

  return json({
    posts: results.map(formatPost),
    me: me ? { username: me.username } : null,
  });
}

export async function onRequestPost({ request, env }) {
  const me = await getSessionUser(request, env);
  if (!me) return json({ error: 'Sign in to post.' }, 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }
  const content = (body.content ?? '').toString().trim().slice(0, MAX_LEN);
  if (!content) return json({ error: 'Write something first.' }, 400);

  const id = crypto.randomUUID();
  await env.DB.prepare('INSERT INTO posts (id, user_id, content) VALUES (?, ?, ?)')
    .bind(id, me.id, content)
    .run();

  const row = await env.DB.prepare(
    `SELECT p.id, p.content, p.created_at,
       u.username, u.display_name, u.verified, u.engineer, u.avatar_key, u.avatar_url
     FROM posts p JOIN users u ON u.id = p.user_id WHERE p.id = ?`
  )
    .bind(id)
    .first();

  return json({ post: formatPost(row) });
}
