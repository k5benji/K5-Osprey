import { parseCookies, sessionCookie } from '../../_auth.js';

const SESSION_DAYS = 30;

async function uniqueUsername(env, base) {
  let candidate = base || 'osprey';
  let n = 0;
  // try base, then base2, base3, ...
  while (true) {
    const taken = await env.DB.prepare('SELECT 1 FROM users WHERE username = ?')
      .bind(candidate)
      .first();
    if (!taken) return candidate;
    n += 1;
    candidate = `${base}${n}`;
  }
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookies = parseCookies(request.headers.get('Cookie'));

  const fail = (reason) => Response.redirect(`${url.origin}/profile?error=${reason}`, 302);

  if (!code || !state || state !== cookies.oauth_state) return fail('auth');

  // exchange code for an access token
  let accessToken;
  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${url.origin}/api/auth/callback`,
      }),
    });
    const tokenData = await tokenRes.json();
    accessToken = tokenData.access_token;
    if (!accessToken) {
      console.error('Token exchange returned no access_token:', JSON.stringify(tokenData));
    }
  } catch (e) {
    console.error('Token exchange threw:', e && e.message);
    return fail('token');
  }
  if (!accessToken) return fail('token');

  // fetch the GitHub profile
  let gh;
  try {
    const ghRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'osprey-k5systems',
        Accept: 'application/json',
      },
    });
    gh = await ghRes.json();
  } catch {
    return fail('profile');
  }
  if (!gh || !gh.id) return fail('profile');

  const providerId = String(gh.id);
  let user = await env.DB.prepare(
    'SELECT * FROM users WHERE provider = ? AND provider_id = ?'
  )
    .bind('github', providerId)
    .first();

  if (!user) {
    const id = crypto.randomUUID();
    const base =
      (gh.login || 'osprey').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20) || 'osprey';
    const username = await uniqueUsername(env, base);
    await env.DB.prepare(
      'INSERT INTO users (id, provider, provider_id, username, display_name, avatar_url) VALUES (?, ?, ?, ?, ?, ?)'
    )
      .bind(id, 'github', providerId, username, gh.name || gh.login || username, gh.avatar_url || null)
      .run();
    user = { id };
  }

  // create a session
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
