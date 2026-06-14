import { getSessionUser, json, avatarUrl, getOrCreateConversation } from '../_auth.js';

const MAX_LEN = 2000;

// List my conversations (most recent first).
export async function onRequestGet({ request, env }) {
  const me = await getSessionUser(request, env);
  if (!me) return json({ error: 'Not signed in.' }, 401);

  const { results } = await env.DB.prepare(
    `SELECT c.id,
       u.username, u.display_name, u.verified, u.engineer, u.avatar_key, u.avatar_url,
       (SELECT body FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC, m.id DESC LIMIT 1) AS last_body,
       (SELECT sender_id FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC, m.id DESC LIMIT 1) AS last_sender,
       COALESCE(c.last_message_at, c.created_at) AS last_at,
       (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_id != ?1 AND m.read = 0) AS unread
     FROM conversations c
     JOIN users u ON u.id = (CASE WHEN c.user_a = ?1 THEN c.user_b ELSE c.user_a END)
     WHERE c.user_a = ?1 OR c.user_b = ?1
     ORDER BY last_at DESC
     LIMIT 50`
  )
    .bind(me.id)
    .all();

  const conversations = (results || [])
    .filter((r) => r.last_body !== null)
    .map((r) => ({
      id: r.id,
      lastBody: r.last_body,
      lastFromMe: r.last_sender === me.id,
      lastAt: r.last_at,
      unread: r.unread || 0,
      user: {
        username: r.username,
        displayName: r.display_name,
        verified: !!r.verified,
        engineer: !!r.engineer,
        avatar: avatarUrl({ avatar_key: r.avatar_key, avatar_url: r.avatar_url }),
      },
    }));

  return json({ conversations });
}

// Send a message to a user (by username).
export async function onRequestPost({ request, env }) {
  const me = await getSessionUser(request, env);
  if (!me) return json({ error: 'Sign in to message.' }, 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }
  const toUsername = (body.to ?? '').toString().trim().toLowerCase();
  const text = (body.body ?? '').toString().trim().slice(0, MAX_LEN);
  if (!toUsername) return json({ error: 'Missing recipient.' }, 400);
  if (!text) return json({ error: 'Write a message.' }, 400);

  const target = await env.DB.prepare('SELECT id FROM users WHERE username = ?')
    .bind(toUsername)
    .first();
  if (!target) return json({ error: 'No such user.' }, 404);
  if (target.id === me.id) return json({ error: "You can't message yourself." }, 400);

  const conversationId = await getOrCreateConversation(env, me.id, target.id);
  const id = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO messages (id, conversation_id, sender_id, body) VALUES (?, ?, ?, ?)'
  )
    .bind(id, conversationId, me.id, text)
    .run();
  await env.DB.prepare("UPDATE conversations SET last_message_at = datetime('now') WHERE id = ?")
    .bind(conversationId)
    .run();

  return json({
    conversationId,
    message: { id, body: text, mine: true, createdAt: new Date().toISOString() },
  });
}
