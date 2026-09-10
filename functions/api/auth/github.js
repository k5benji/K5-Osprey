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

// Start the GitHub OAuth flow.
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);

  if (!env.GITHUB_CLIENT_ID) {
    return Response.redirect(`${url.origin}/profile?error=config`, 302);
  }

  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: `${url.origin}/api/auth/callback`,
    scope: 'read:user',
    state,
  });

  const headers = new Headers();
  headers.append(
    'Set-Cookie',
    `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`
  );
  headers.set('Location', `https://github.com/login/oauth/authorize?${params}`);
  return new Response(null, { status: 302, headers });
}
