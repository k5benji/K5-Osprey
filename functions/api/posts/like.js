import { getSessionUser, json, createNotification } from '../../_auth.js';

export async function onRequestPost({ request, env }) {
  const me = await getSessionUser(request, env);
  if (!me) return json({ error: 'Sign in to like.' }, 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }
  const postId = (body.postId ?? '').toString();
  if (!postId) return json({ error: 'Missing post.' }, 400);

  const existing = await env.DB.prepare(
    'SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?'
  )
    .bind(postId, me.id)
    .first();

  if (existing) {
    await env.DB.prepare('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?')
      .bind(postId, me.id)
      .run();
  } else {
    await env.DB.prepare('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)')
      .bind(postId, me.id)
      .run();
  }

  const row = await env.DB.prepare('SELECT COUNT(*) AS count FROM post_likes WHERE post_id = ?')
    .bind(postId)
    .first();
  const post = await env.DB.prepare('SELECT base_likes, user_id FROM posts WHERE id = ?')
    .bind(postId)
    .first();
  if (!existing && post) {
    await createNotification(env, { userId: post.user_id, actorId: me.id, type: 'like', postId });
  }
  const base = post?.base_likes ?? 0;
  return json({ liked: !existing, likeCount: row.count + base });
}
