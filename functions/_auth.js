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

// Shared auth helpers. Underscore-prefixed: not a route.

export function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export async function getSessionUser(request, env) {
  const cookies = parseCookies(request.headers.get('Cookie'));
  const sid = cookies.session;
  if (!sid) return null;
  const row = await env.DB.prepare(
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.id = ? AND s.expires_at > datetime('now')`
  )
    .bind(sid)
    .first();
  return row || null;
}

export function avatarUrl(u) {
  if (u.avatar_key) return `/avatars/${u.avatar_key}`;
  return u.avatar_url || null;
}

export function publicUser(u) {
  if (!u) return null;
  return {
    username: u.username,
    displayName: u.display_name,
    bio: u.bio,
    avatar: avatarUrl(u),
    verified: !!u.verified,
    engineer: !!u.engineer,
  };
}

export function sessionCookie(sid, maxAgeSeconds) {
  return `session=${sid}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAgeSeconds}`;
}

export async function uniqueUsername(env, base) {
  const root = (base || 'osprey').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20) || 'osprey';
  let candidate = root;
  let n = 0;
  while (true) {
    const taken = await env.DB.prepare('SELECT 1 FROM users WHERE username = ?').bind(candidate).first();
    if (!taken) return candidate;
    n += 1;
    candidate = `${root}${n}`;
  }
}
