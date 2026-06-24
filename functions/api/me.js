import { getSessionUser, publicUser, json } from '../_auth.js';

export async function onRequestGet({ request, env }) {
  const user = await getSessionUser(request, env);
  if (!user) return json(null);
  return json({ ...publicUser(user), me: true });
}
