/*
 * Copyright 2026 Kastle Five Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
