// Live RSS feed built from the D1 posts (served by a Pages Function so it
// reflects current posts, not the build-time content collection).

function xmlEscape(s) {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function rfc822(iso) {
  const d = new Date((iso || '').includes('T') ? iso : (iso || '').replace(' ', 'T') + 'Z');
  return isNaN(d.getTime()) ? new Date().toUTCString() : d.toUTCString();
}

function titleFrom(content) {
  const first = (content || '').split('\n').find((l) => l.trim()) || 'Untitled';
  return first.trim().slice(0, 100);
}

export async function onRequestGet({ request, env }) {
  const origin = new URL(request.url).origin;

  let results = [];
  try {
    const q = await env.DB.prepare(
      `SELECT p.id, p.content, p.created_at, u.username, u.display_name
       FROM posts p JOIN users u ON u.id = p.user_id
       ORDER BY p.created_at DESC, p.id DESC
       LIMIT 50`
    ).all();
    results = q.results || [];
  } catch {
    results = [];
  }

  const items = results
    .map((p) => {
      const link = `${origin}/post/${encodeURIComponent(p.id)}`;
      const author = p.display_name || p.username || 'k5binya';
      return `    <item>
      <title>${xmlEscape(titleFrom(p.content))}</title>
      <link>${xmlEscape(link)}</link>
      <guid isPermaLink="true">${xmlEscape(link)}</guid>
      <pubDate>${rfc822(p.created_at)}</pubDate>
      <dc:creator>${xmlEscape('@' + (p.username || 'k5binya'))}</dc:creator>
      <description>${xmlEscape(p.content || '')}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Osprey K5 Systems</title>
    <link>${origin}/</link>
    <description>The Osprey signal feed — engineered by Kastle Five systems.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
