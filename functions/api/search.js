import { getSessionUser, json, publicUser, formatPost } from '../_auth.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();
  const me = await getSessionUser(request, env);
  const uid = me ? me.id : '';

  // empty query -> discovery: trending posts + who to follow
  if (!q) {
    const trendingQ = await env.DB.prepare(
      `SELECT p.id, p.content, p.created_at, p.base_likes, p.base_reposts, p.media_key, p.media_type,
         u.username, u.display_name, u.verified, u.engineer, u.avatar_key, u.avatar_url,
         (SELECT COUNT(*) FROM post_likes l WHERE l.post_id = p.id) AS like_count,
         (SELECT COUNT(*) FROM post_reposts r WHERE r.post_id = p.id) AS repost_count,
         (SELECT COUNT(*) FROM post_comments c WHERE c.post_id = p.id) AS comment_count,
         (SELECT COUNT(*) FROM post_likes l WHERE l.post_id = p.id AND l.user_id = ?1) AS liked,
         (SELECT COUNT(*) FROM post_reposts r WHERE r.post_id = p.id AND r.user_id = ?1) AS reposted,
         (p.base_likes + p.base_reposts
           + (SELECT COUNT(*) FROM post_likes l WHERE l.post_id = p.id)
           + (SELECT COUNT(*) FROM post_reposts r WHERE r.post_id = p.id)
           + (SELECT COUNT(*) FROM post_comments c WHERE c.post_id = p.id)) AS score
       FROM posts p JOIN users u ON u.id = p.user_id
       ORDER BY score DESC, p.created_at DESC
       LIMIT 10`
    )
      .bind(uid)
      .all();

    const followQ = await env.DB.prepare(
      `SELECT id, username, display_name, bio, verified, engineer, avatar_key, avatar_url,
         (base_followers + (SELECT COUNT(*) FROM follows f WHERE f.followee_id = users.id)) AS fscore
       FROM users
       WHERE id != ?1
       ORDER BY fscore DESC, username
       LIMIT 6`
    )
      .bind(uid)
      .all();

    return json({
      trending: true,
      users: (followQ.results || []).map(publicUser),
      posts: (trendingQ.results || []).map(formatPost),
    });
  }

  // escape LIKE wildcards so user input is treated literally
  const like = '%' + q.toLowerCase().replace(/[%_\\]/g, '\\$&') + '%';

  const usersQ = await env.DB.prepare(
    `SELECT id, username, display_name, bio, verified, engineer, avatar_key, avatar_url
     FROM users
     WHERE lower(username) LIKE ?1 ESCAPE '\\' OR lower(display_name) LIKE ?1 ESCAPE '\\'
     ORDER BY username
     LIMIT 20`
  )
    .bind(like)
    .all();

  const postsQ = await env.DB.prepare(
    `SELECT p.id, p.content, p.created_at, p.base_likes, p.base_reposts, p.media_key, p.media_type,
       u.username, u.display_name, u.verified, u.engineer, u.avatar_key, u.avatar_url,
       (SELECT COUNT(*) FROM post_likes l WHERE l.post_id = p.id) AS like_count,
       (SELECT COUNT(*) FROM post_reposts r WHERE r.post_id = p.id) AS repost_count,
       (SELECT COUNT(*) FROM post_comments c WHERE c.post_id = p.id) AS comment_count,
       (SELECT COUNT(*) FROM post_likes l WHERE l.post_id = p.id AND l.user_id = ?2) AS liked,
       (SELECT COUNT(*) FROM post_reposts r WHERE r.post_id = p.id AND r.user_id = ?2) AS reposted
     FROM posts p JOIN users u ON u.id = p.user_id
     WHERE lower(p.content) LIKE ?1 ESCAPE '\\'
     ORDER BY p.created_at DESC, p.id DESC
     LIMIT 30`
  )
    .bind(like, uid)
    .all();

  return json({
    users: (usersQ.results || []).map(publicUser),
    posts: (postsQ.results || []).map(formatPost),
  });
}
