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

import { getSessionUser, publicUser, json } from '../_auth.js';

export async function onRequestPost({ request, env }) {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: 'Not signed in.' }, 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  const username = (body.username ?? '').toString().trim().toLowerCase();
  const displayName = (body.displayName ?? '').toString().trim().slice(0, 40);
  const bio = (body.bio ?? '').toString().trim().slice(0, 200);

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return json({ error: 'Username must be 3–20 characters: letters, numbers, underscores.' }, 400);
  }

  const clash = await env.DB.prepare('SELECT 1 FROM users WHERE username = ? AND id != ?')
    .bind(username, user.id)
    .first();
  if (clash) return json({ error: 'That username is taken.' }, 409);

  await env.DB.prepare(
    'UPDATE users SET username = ?, display_name = ?, bio = ? WHERE id = ?'
  )
    .bind(username, displayName || username, bio, user.id)
    .run();

  const updated = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(user.id).first();
  return json({ ...publicUser(updated), me: true });
}
