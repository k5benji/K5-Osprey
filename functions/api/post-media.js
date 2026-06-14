import { getSessionUser, json } from '../_auth.js';

const MAX_IMAGE = 8_000_000; // 8 MB
const MAX_VIDEO = 25_000_000; // 25 MB
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export async function onRequestPost({ request, env }) {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: 'Sign in to upload.' }, 401);
  if (!env.AVATARS) return json({ error: 'Uploads are not enabled yet.' }, 503);

  const contentType = request.headers.get('Content-Type') || '';
  const isImage = IMAGE_TYPES.includes(contentType);
  const isVideo = VIDEO_TYPES.includes(contentType);
  if (!isImage && !isVideo) {
    return json({ error: 'Use a JPEG/PNG/WebP/GIF image or MP4/WebM/MOV video.' }, 400);
  }

  const bytes = await request.arrayBuffer();
  if (bytes.byteLength === 0) return json({ error: 'Empty file.' }, 400);
  const max = isVideo ? MAX_VIDEO : MAX_IMAGE;
  if (bytes.byteLength > max) {
    return json({ error: isVideo ? 'Video must be under 25 MB.' : 'Image must be under 8 MB.' }, 400);
  }

  const key = `post_${user.id}_${Date.now()}`;
  await env.AVATARS.put(key, bytes, { httpMetadata: { contentType } });

  return json({ key, type: isVideo ? 'video' : 'image', url: `/avatars/${key}` });
}
