import { getSessionUser, json } from '../_auth.js';

const MAX_BYTES = 1_000_000; // 1 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function onRequestPost({ request, env }) {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: 'Not signed in.' }, 401);

  if (!env.AVATARS) {
    return json({ error: 'Image uploads are not enabled yet.' }, 503);
  }

  const contentType = request.headers.get('Content-Type') || '';
  if (!ALLOWED.includes(contentType)) {
    return json({ error: 'Use a JPEG, PNG, WebP, or GIF image.' }, 400);
  }

  const bytes = await request.arrayBuffer();
  if (bytes.byteLength === 0) return json({ error: 'Empty file.' }, 400);
  if (bytes.byteLength > MAX_BYTES) return json({ error: 'Image must be under 1 MB.' }, 400);

  const key = `${user.id}_${Date.now()}`;
  await env.AVATARS.put(key, bytes, { httpMetadata: { contentType } });

  // remove the previous object if any
  if (user.avatar_key && user.avatar_key !== key) {
    try {
      await env.AVATARS.delete(user.avatar_key);
    } catch {
      /* ignore */
    }
  }

  await env.DB.prepare('UPDATE users SET avatar_key = ? WHERE id = ?').bind(key, user.id).run();
  return json({ avatar: `/avatars/${key}` });
}
