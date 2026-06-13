import { getSessionUser, publicUser, json, followStats } from '../_auth.js';

export async function onRequestGet({ request, env }) {
  const user = await getSessionUser(request, env);
  if (!user) return json(null);
  const stats = await followStats(env, user, user.id);
  const unread = await env.DB.prepare(
    'SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND read = 0'
  )
    .bind(user.id)
    .first();
  return json({ ...publicUser(user), me: true, ...stats, unreadNotifications: unread?.c ?? 0 });
}
