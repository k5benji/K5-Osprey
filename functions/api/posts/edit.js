import { getSessionUser, json } from '../../_auth.js';

const MAX_LEN = 10000;

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
  const content = (body.content ?? '').toString().trim().slice(0, MAX_LEN);
  if (!postId || !content) return json({ error: 'Nothing to save.' }, 400);

  const post = await env.DB.prepare('SELECT user_id FROM posts WHERE id = ?').bind(postId).first();
  if (!post) return json({ error: 'Not found.' }, 404);
  if (post.user_id !== me.id) return json({ error: 'Not your post.' }, 403);

  await env.DB.prepare('UPDATE posts SET content = ? WHERE id = ?').bind(content, postId).run();
  return json({ ok: true, content });
}
