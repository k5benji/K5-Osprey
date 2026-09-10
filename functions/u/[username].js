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

// Serve the profile page (static /profile asset) for /u/<username>,
// keeping the /u/<username> URL so the page can read the name client-side.
export async function onRequestGet(context) {
  const target = new URL(context.request.url);
  target.pathname = '/profile/';
  const res = await context.env.ASSETS.fetch(target);
  const out = new Response(res.body, res);
  out.headers.set('Cache-Control', 'no-store, must-revalidate');
  return out;
}
