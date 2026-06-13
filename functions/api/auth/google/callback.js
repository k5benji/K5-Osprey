import { parseCookies, sessionCookie, uniqueUsername } from '../../../_auth.js';

const SESSION_DAYS = 30;

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookies = parseCookies(request.headers.get('Cookie'));

  const fail = (reason) => Response.redirect(`${url.origin}/profile?error=${reason}`, 302);

  if (!code || !state || state !== cookies.oauth_state) return fail('auth');

  // exchange code for tokens
  let accessToken;
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${url.origin}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenRes.json();
    accessToken = tokenData.access_token;
    if (!accessToken) console.error('Google token exchange:', JSON.stringify(tokenData));
  } catch (e) {
    console.error('Google token threw:', e && e.message);
    return fail('token');
  }
  if (!accessToken) return fail('token');

  // fetch the Google profile
  let g;
  try {
    const res = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    g = await res.json();
  } catch {
    return fail('profile');
  }
  if (!g || !g.sub) return fail('profile');

  const providerId = String(g.sub);
  let user = await env.DB.prepare('SELECT * FROM users WHERE provider = ? AND provider_id = ?')
    .bind('google', providerId)
    .first();

  if (!user) {
    const id = crypto.randomUUID();
    const base = (g.email ? g.email.split('@')[0] : g.name) || 'osprey';
    const username = await uniqueUsername(env, base);
    await env.DB.prepare(
      'INSERT INTO users (id, provider, provider_id, username, display_name, avatar_url) VALUES (?, ?, ?, ?, ?, ?)'
    )
      .bind(id, 'google', providerId, username, g.name || username, g.picture || null)
      .run();
    user = { id };
  }

  const sid = crypto.randomUUID() + crypto.randomUUID();
  const expires = new Date(Date.now() + SESSION_DAYS * 86400 * 1000).toISOString();
  await env.DB.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(sid, user.id, expires)
    .run();

  const headers = new Headers();
  headers.append('Set-Cookie', sessionCookie(sid, SESSION_DAYS * 86400));
  headers.append('Set-Cookie', 'oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
  headers.set('Location', `${url.origin}/profile`);
  return new Response(null, { status: 302, headers });
}
