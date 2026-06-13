// Serve the profile page (static /profile asset) for /u/<username>,
// keeping the /u/<username> URL so the page can read the name client-side.
export async function onRequestGet(context) {
  const target = new URL(context.request.url);
  target.pathname = '/profile/';
  return context.env.ASSETS.fetch(target);
}
