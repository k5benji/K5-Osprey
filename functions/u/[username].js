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
