import { getSessionUser, formatPost, json } from '../_auth.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return json({ error: 'Missing id.' }, 400);

  const me = await getSessionUser(request, env);
  const uid = me ? me.id : '';

  const row = await env.DB.prepare(
    `SELECT p.id, p.content, p.created_at, p.base_likes, p.base_reposts,
       u.username, u.display_name, u.verified, u.engineer, u.avatar_key, u.avatar_url,
       (SELECT COUNT(*) FROM post_likes l WHERE l.post_id = p.id) AS like_count,
       (SELECT COUNT(*) FROM post_reposts r WHERE r.post_id = p.id) AS repost_count,
       (SELECT COUNT(*) FROM post_comments c WHERE c.post_id = p.id) AS comment_count,
       (SELECT COUNT(*) FROM post_likes l WHERE l.post_id = p.id AND l.user_id = ?) AS liked,
       (SELECT COUNT(*) FROM post_reposts r WHERE r.post_id = p.id AND r.user_id = ?) AS reposted
     FROM posts p JOIN users u ON u.id = p.user_id WHERE p.id = ?`
  )
    .bind(uid, uid, id)
    .first();

  if (!row) return json(null, 404);
  return json(formatPost(row));
}
