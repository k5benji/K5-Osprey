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
