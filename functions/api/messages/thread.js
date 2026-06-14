import { getSessionUser, json, publicUser, getOrCreateConversation } from '../../_auth.js';

// Get the conversation (and messages) with a given user; marks incoming read.
export async function onRequestGet({ request, env }) {
  const me = await getSessionUser(request, env);
  if (!me) return json({ error: 'Not signed in.' }, 401);

  const url = new URL(request.url);
  const withUser = (url.searchParams.get('with') || '').trim().toLowerCase();
  if (!withUser) return json({ error: 'Missing user.' }, 400);

  const other = await env.DB.prepare('SELECT * FROM users WHERE username = ?')
    .bind(withUser)
    .first();
  if (!other) return json({ error: 'No such user.' }, 404);
  if (other.id === me.id) return json({ error: 'That is you.' }, 400);

  const conversationId = await getOrCreateConversation(env, me.id, other.id);

  const { results } = await env.DB.prepare(
    `SELECT id, sender_id, body, created_at FROM messages
     WHERE conversation_id = ?
     ORDER BY created_at ASC, id ASC
     LIMIT 500`
  )
    .bind(conversationId)
    .all();

  // mark messages from the other person as read
  await env.DB.prepare(
    'UPDATE messages SET read = 1 WHERE conversation_id = ? AND sender_id = ? AND read = 0'
  )
    .bind(conversationId, other.id)
    .run();

  const messages = (results || []).map((m) => ({
    id: m.id,
    body: m.body,
    mine: m.sender_id === me.id,
    createdAt: m.created_at,
  }));

  return json({ conversationId, other: publicUser(other), messages });
}
