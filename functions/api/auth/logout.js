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

import { parseCookies } from '../../_auth.js';

export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);
  const cookies = parseCookies(request.headers.get('Cookie'));
  if (cookies.session) {
    await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(cookies.session).run();
  }
  const headers = new Headers();
  headers.append('Set-Cookie', 'session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
  headers.set('Content-Type', 'application/json');
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}
