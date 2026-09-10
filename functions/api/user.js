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

import { publicUser, json } from '../_auth.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const username = (url.searchParams.get('u') ?? '').toLowerCase();
  if (!username) return json({ error: 'Missing username.' }, 400);

  const u = await env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();
  if (!u) return json(null, 404);
  return json(publicUser(u));
}
