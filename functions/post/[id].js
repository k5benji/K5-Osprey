// Serve the post page (static /postview asset) for /post/<id>,
// keeping the /post/<id> URL so the page can read the id client-side.
export async function onRequestGet(context) {
  const target = new URL(context.request.url);
  target.pathname = '/postview/';
  return context.env.ASSETS.fetch(target);
}
