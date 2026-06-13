import { getSessionUser, json } from '../../_auth.js';

export async function onRequestPost({ request, env }) {
  const me = await getSessionUser(request, env);
  if (!me) return json({ error: 'Sign in.' }, 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }
  const postId = (body.postId ?? '').toString();
  if (!postId) return json({ error: 'Missing post.' }, 400);

  const post = await env.DB.prepare('SELECT user_id FROM posts WHERE id = ?').bind(postId).first();
  if (!post) return json({ error: 'Not found.' }, 404);
  if (post.user_id !== me.id) return json({ error: 'Not your post.' }, 403);

  await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(postId).run();
  await env.DB.prepare('DELETE FROM post_likes WHERE post_id = ?').bind(postId).run();
  await env.DB.prepare('DELETE FROM post_reposts WHERE post_id = ?').bind(postId).run();

  return json({ ok: true });
}
