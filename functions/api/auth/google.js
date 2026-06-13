// Start the Google OAuth flow.
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);

  if (!env.GOOGLE_CLIENT_ID) {
    return Response.redirect(`${url.origin}/profile?error=config`, 302);
  }

  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: `${url.origin}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });

  const headers = new Headers();
  headers.append(
    'Set-Cookie',
    `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`
  );
  headers.set('Location', `https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  return new Response(null, { status: 302, headers });
}
