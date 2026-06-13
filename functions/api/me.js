import { getSessionUser, publicUser, json, followStats } from '../_auth.js';

export async function onRequestGet({ request, env }) {
  const user = await getSessionUser(request, env);
  if (!user) return json(null);
  const stats = await followStats(env, user, user.id);
  return json({ ...publicUser(user), me: true, ...stats });
}
