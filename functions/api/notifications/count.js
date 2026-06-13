import { getSessionUser, json } from '../../_auth.js';

export async function onRequestGet({ request, env }) {
  const me = await getSessionUser(request, env);
  if (!me) return json({ count: 0 });
  const r = await env.DB.prepare(
    'SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND read = 0'
  )
    .bind(me.id)
    .first();
  return json({ count: r?.c ?? 0 });
}
