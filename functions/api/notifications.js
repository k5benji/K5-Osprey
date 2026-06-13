import { getSessionUser, json, avatarUrl } from '../_auth.js';

export async function onRequestGet({ request, env }) {
  const me = await getSessionUser(request, env);
  if (!me) return json({ error: 'Not signed in.' }, 401);

  const { results } = await env.DB.prepare(
    `SELECT n.id, n.type, n.post_id, n.read, n.created_at,
       u.username, u.display_name, u.verified, u.engineer, u.avatar_key, u.avatar_url,
       p.content AS post_content
     FROM notifications n
     JOIN users u ON u.id = n.actor_id
     LEFT JOIN posts p ON p.id = n.post_id
     WHERE n.user_id = ?
     ORDER BY n.created_at DESC, n.id DESC
     LIMIT 50`
  )
    .bind(me.id)
    .all();

  const unread = await env.DB.prepare(
    'SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND read = 0'
  )
    .bind(me.id)
    .first();

  const notifications = (results || []).map((r) => ({
    id: r.id,
    type: r.type,
    read: !!r.read,
    createdAt: r.created_at,
    postId: r.post_id,
    postSnippet: r.post_content ? r.post_content.replace(/\s+/g, ' ').trim().slice(0, 90) : null,
    actor: {
      username: r.username,
      displayName: r.display_name,
      verified: !!r.verified,
      engineer: !!r.engineer,
      avatar: avatarUrl({ avatar_key: r.avatar_key, avatar_url: r.avatar_url }),
    },
  }));

  return json({ notifications, unreadCount: unread?.c ?? 0 });
}

// Mark all notifications read.
export async function onRequestPost({ request, env }) {
  const me = await getSessionUser(request, env);
  if (!me) return json({ error: 'Not signed in.' }, 401);
  await env.DB.prepare('UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0')
    .bind(me.id)
    .run();
  return json({ ok: true });
}
