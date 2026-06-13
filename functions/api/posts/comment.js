import {
  getSessionUser,
  json,
  avatarUrl,
  createNotification,
  notifyMentions,
} from '../../_auth.js';

const MAX_LEN = 500;

function formatComment(r) {
  return {
    id: r.id,
    content: r.content,
    createdAt: r.created_at,
    author: {
      username: r.username,
      displayName: r.display_name,
      verified: !!r.verified,
      engineer: !!r.engineer,
      avatar: avatarUrl({ avatar_key: r.avatar_key, avatar_url: r.avatar_url }),
    },
  };
}

// List comments for a post.
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const postId = (url.searchParams.get('postId') ?? '').toString();
  if (!postId) return json({ error: 'Missing post.' }, 400);

  const { results } = await env.DB.prepare(
    `SELECT c.id, c.content, c.created_at,
       u.username, u.display_name, u.verified, u.engineer, u.avatar_key, u.avatar_url
     FROM post_comments c JOIN users u ON u.id = c.user_id
     WHERE c.post_id = ?
     ORDER BY c.created_at ASC, c.id ASC
     LIMIT 200`
  )
    .bind(postId)
    .all();

  return json({ comments: (results || []).map(formatComment) });
}

// Create a comment.
export async function onRequestPost({ request, env }) {
  const me = await getSessionUser(request, env);
  if (!me) return json({ error: 'Sign in to comment.' }, 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }
  const postId = (body.postId ?? '').toString();
  const content = (body.content ?? '').toString().trim().slice(0, MAX_LEN);
  if (!postId) return json({ error: 'Missing post.' }, 400);
  if (!content) return json({ error: 'Write something first.' }, 400);

  const post = await env.DB.prepare('SELECT id, user_id FROM posts WHERE id = ?')
    .bind(postId)
    .first();
  if (!post) return json({ error: 'No such post.' }, 404);

  const id = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO post_comments (id, post_id, user_id, content) VALUES (?, ?, ?, ?)'
  )
    .bind(id, postId, me.id, content)
    .run();

  await createNotification(env, {
    userId: post.user_id,
    actorId: me.id,
    type: 'comment',
    postId,
  });
  await notifyMentions(env, { content, actorId: me.id, postId });

  const row = await env.DB.prepare(
    `SELECT c.id, c.content, c.created_at,
       u.username, u.display_name, u.verified, u.engineer, u.avatar_key, u.avatar_url
     FROM post_comments c JOIN users u ON u.id = c.user_id WHERE c.id = ?`
  )
    .bind(id)
    .first();

  const countRow = await env.DB.prepare(
    'SELECT COUNT(*) AS c FROM post_comments WHERE post_id = ?'
  )
    .bind(postId)
    .first();

  return json({ comment: formatComment(row), commentCount: countRow?.c ?? 0 });
}

// Delete a comment (its author, or the owner of the post it's on).
export async function onRequestDelete({ request, env }) {
  const me = await getSessionUser(request, env);
  if (!me) return json({ error: 'Not signed in.' }, 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }
  const commentId = (body.commentId ?? '').toString();
  if (!commentId) return json({ error: 'Missing comment.' }, 400);

  const c = await env.DB.prepare(
    `SELECT c.user_id, c.post_id, p.user_id AS post_owner
     FROM post_comments c JOIN posts p ON p.id = c.post_id WHERE c.id = ?`
  )
    .bind(commentId)
    .first();
  if (!c) return json({ error: 'No such comment.' }, 404);
  if (c.user_id !== me.id && c.post_owner !== me.id) {
    return json({ error: 'Not allowed.' }, 403);
  }

  await env.DB.prepare('DELETE FROM post_comments WHERE id = ?').bind(commentId).run();

  const countRow = await env.DB.prepare(
    'SELECT COUNT(*) AS c FROM post_comments WHERE post_id = ?'
  )
    .bind(c.post_id)
    .first();
  return json({ ok: true, commentCount: countRow?.c ?? 0 });
}
