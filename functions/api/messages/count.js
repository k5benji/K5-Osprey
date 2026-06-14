import { getSessionUser, json } from '../../_auth.js';

export async function onRequestGet({ request, env }) {
  const me = await getSessionUser(request, env);
  if (!me) return json({ count: 0 });
  const r = await env.DB.prepare(
    `SELECT COUNT(*) AS c FROM messages m
     JOIN conversations c2 ON c2.id = m.conversation_id
     WHERE m.read = 0 AND m.sender_id != ?1 AND (c2.user_a = ?1 OR c2.user_b = ?1)`
  )
    .bind(me.id)
    .first();
  return json({ count: r?.c ?? 0 });
}
