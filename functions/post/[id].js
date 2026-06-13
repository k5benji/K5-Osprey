// Serve the post page (static /postview asset) for /post/<id>,
// keeping the /post/<id> URL so the page can read the id client-side.
export async function onRequestGet(context) {
  const target = new URL(context.request.url);
  target.pathname = '/postview/';
  const res = await context.env.ASSETS.fetch(target);
  // never cache the per-id HTML — earlier deploys cached the wrong content here
  const out = new Response(res.body, res);
  out.headers.set('Cache-Control', 'no-store, must-revalidate');
  return out;
}
