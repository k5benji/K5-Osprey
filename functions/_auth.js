// Shared auth helpers. Underscore-prefixed: not a route.

export function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export async function getSessionUser(request, env) {
  const cookies = parseCookies(request.headers.get('Cookie'));
  const sid = cookies.session;
  if (!sid) return null;
  const row = await env.DB.prepare(
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.id = ? AND s.expires_at > datetime('now')`
  )
    .bind(sid)
    .first();
  return row || null;
}

export function avatarUrl(u) {
  if (u.avatar_key) return `/avatars/${u.avatar_key}`;
  return u.avatar_url || null;
}

export function publicUser(u) {
  if (!u) return null;
  return {
    username: u.username,
    displayName: u.display_name,
    bio: u.bio,
    avatar: avatarUrl(u),
    verified: !!u.verified,
    engineer: !!u.engineer,
  };
}

export function sessionCookie(sid, maxAgeSeconds) {
  return `session=${sid}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAgeSeconds}`;
}

export async function followStats(env, userRow, viewerId) {
  const followers = await env.DB.prepare(
    'SELECT COUNT(*) AS c FROM follows WHERE followee_id = ?'
  )
    .bind(userRow.id)
    .first();
  const following = await env.DB.prepare(
    'SELECT COUNT(*) AS c FROM follows WHERE follower_id = ?'
  )
    .bind(userRow.id)
    .first();
  let isFollowing = false;
  if (viewerId && viewerId !== userRow.id) {
    const r = await env.DB.prepare(
      'SELECT 1 FROM follows WHERE follower_id = ? AND followee_id = ?'
    )
      .bind(viewerId, userRow.id)
      .first();
    isFollowing = !!r;
  }
  return {
    followers: (followers?.c ?? 0) + (userRow.base_followers ?? 0),
    following: (following?.c ?? 0) + (userRow.base_following ?? 0),
    isFollowing,
  };
}

export async function createNotification(env, { userId, actorId, type, postId = null }) {
  // never notify yourself
  if (!userId || !actorId || userId === actorId) return;
  const id = crypto.randomUUID();
  try {
    await env.DB.prepare(
      'INSERT INTO notifications (id, user_id, actor_id, type, post_id) VALUES (?, ?, ?, ?, ?)'
    )
      .bind(id, userId, actorId, type, postId)
      .run();
  } catch {
    /* notifications are best-effort */
  }
}

// Parse @mentions from text and notify each existing, distinct user (except the actor).
export async function notifyMentions(env, { content, actorId, postId }) {
  const found = new Set();
  const re = /@([a-z0-9_]{3,20})/gi;
  let m;
  while ((m = re.exec(content || ''))) found.add(m[1].toLowerCase());
  for (const username of found) {
    const u = await env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
    if (u) await createNotification(env, { userId: u.id, actorId, type: 'mention', postId });
  }
}

export function formatPost(r) {
  return {
    id: r.id,
    content: r.content,
    createdAt: r.created_at,
    author: {
      username: r.username,
      displayName: r.display_name,
      verified: !!r.verified,
      engineer: !!r.engineer,
      avatar: avatarUrl({ avatar_key: r.avatar_key, avatar_url: r.avatar_url }),
    },
    media: r.media_key ? { url: `/avatars/${r.media_key}`, type: r.media_type || 'image' } : null,
    likeCount: (r.like_count ?? 0) + (r.base_likes ?? 0),
    repostCount: (r.repost_count ?? 0) + (r.base_reposts ?? 0),
    commentCount: r.comment_count ?? 0,
    liked: !!r.liked,
    reposted: !!r.reposted,
  };
}

export async function uniqueUsername(env, base) {
  const root = (base || 'osprey').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20) || 'osprey';
  let candidate = root;
  let n = 0;
  while (true) {
    const taken = await env.DB.prepare('SELECT 1 FROM users WHERE username = ?').bind(candidate).first();
    if (!taken) return candidate;
    n += 1;
    candidate = `${root}${n}`;
  }
}
