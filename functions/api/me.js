import { getSessionUser, publicUser, json } from '../_auth.js';

export async function onRequestGet({ request, env }) {
  const user = await getSessionUser(request, env);
  return json(user ? { ...publicUser(user), me: true } : null);
}
