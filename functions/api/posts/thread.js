import { getSessionUser, formatPost, json, notifyMentions } from '../../_auth.js';

const MAX_LEN = 500;
const MAX_PARTS = 25;

export async function onRequestPost({ request, env }) {
  const me = await getSessionUser(request, env);
  if (!me) return json({ error: 'Sign in to post.' }, 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  const segments = Array.isArray(body.segments) ? body.segments : [];
  const parts = segments
    .map((s) => (s ?? '').toString().trim().slice(0, MAX_LEN))
    .filter((s) => s.length)
    .slice(0, MAX_PARTS);

  if (parts.length < 2) return json({ error: 'A thread needs at least two parts.' }, 400);

  const rootId = crypto.randomUUID();
  let seq = 1;
  for (const content of parts) {
    const id = seq === 1 ? rootId : crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO posts (id, user_id, content, thread_id, thread_seq) VALUES (?, ?, ?, ?, ?)'
    )
      .bind(id, me.id, content, rootId, seq)
      .run();
    await notifyMentions(env, { content, actorId: me.id, postId: id });
    seq += 1;
  }

  const row = await env.DB.prepare(
    `SELECT p.id, p.content, p.created_at, p.media_key, p.media_type,
       (SELECT COUNT(*) FROM posts t WHERE t.thread_id = p.id) AS thread_count,
       u.username, u.display_name, u.verified, u.engineer, u.avatar_key, u.avatar_url
     FROM posts p JOIN users u ON u.id = p.user_id WHERE p.id = ?`
  )
    .bind(rootId)
    .first();

  return json({ post: formatPost(row) });
}
