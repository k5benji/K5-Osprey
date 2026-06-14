import { describe, it, expect, vi } from 'vitest';
import {
  parseCookies,
  json,
  avatarUrl,
  publicUser,
  sessionCookie,
  formatPost,
  notifyMentions,
  getOrCreateConversation,
  createNotification,
} from '../functions/_auth.js';

describe('parseCookies', () => {
  it('returns {} for missing or empty header', () => {
    expect(parseCookies(null)).toEqual({});
    expect(parseCookies('')).toEqual({});
  });

  it('parses a single cookie', () => {
    expect(parseCookies('session=abc123')).toEqual({ session: 'abc123' });
  });

  it('parses multiple cookies and trims whitespace', () => {
    expect(parseCookies('session=abc; theme=dark')).toEqual({
      session: 'abc',
      theme: 'dark',
    });
  });

  it('URL-decodes values', () => {
    expect(parseCookies('q=a%20b%26c')).toEqual({ q: 'a b&c' });
  });

  it('keeps "=" that appears inside a value', () => {
    expect(parseCookies('token=a=b=c')).toEqual({ token: 'a=b=c' });
  });

  it('skips malformed segments without "="', () => {
    expect(parseCookies('garbage; session=ok')).toEqual({ session: 'ok' });
  });
});

describe('json', () => {
  it('defaults to 200 with no-store JSON headers', async () => {
    const res = json({ ok: true });
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/json');
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect(await res.json()).toEqual({ ok: true });
  });

  it('honors a custom status', () => {
    expect(json({ error: 'nope' }, 401).status).toBe(401);
  });
});

describe('avatarUrl', () => {
  it('prefers the uploaded avatar_key', () => {
    expect(avatarUrl({ avatar_key: 'k1', avatar_url: 'http://x/y' })).toBe('/avatars/k1');
  });

  it('falls back to avatar_url', () => {
    expect(avatarUrl({ avatar_url: 'http://x/y' })).toBe('http://x/y');
  });

  it('returns null when neither is set', () => {
    expect(avatarUrl({})).toBeNull();
  });
});

describe('publicUser', () => {
  it('returns null for falsy input', () => {
    expect(publicUser(null)).toBeNull();
    expect(publicUser(undefined)).toBeNull();
  });

  it('maps DB columns to the public shape and coerces booleans', () => {
    expect(
      publicUser({
        username: 'ace',
        display_name: 'Ace',
        bio: 'hi',
        avatar_key: 'k',
        verified: 1,
        engineer: 0,
      })
    ).toEqual({
      username: 'ace',
      displayName: 'Ace',
      bio: 'hi',
      avatar: '/avatars/k',
      verified: true,
      engineer: false,
    });
  });

  it('does not leak unexpected columns', () => {
    const pub = publicUser({ username: 'ace', password_hash: 'secret', email: 'a@b.c' });
    expect(pub).not.toHaveProperty('password_hash');
    expect(pub).not.toHaveProperty('email');
  });
});

describe('sessionCookie', () => {
  it('builds a hardened cookie string', () => {
    const c = sessionCookie('sid42', 3600);
    expect(c).toContain('session=sid42');
    expect(c).toContain('HttpOnly');
    expect(c).toContain('Secure');
    expect(c).toContain('SameSite=Lax');
    expect(c).toContain('Path=/');
    expect(c).toContain('Max-Age=3600');
  });
});

describe('formatPost', () => {
  const base = {
    id: 'p1',
    content: 'hello',
    created_at: '2026-01-01T00:00:00Z',
    username: 'ace',
    display_name: 'Ace',
    verified: 1,
    engineer: 1,
    avatar_key: 'k',
  };

  it('shapes a row into the public post object', () => {
    const p = formatPost(base);
    expect(p.id).toBe('p1');
    expect(p.content).toBe('hello');
    expect(p.createdAt).toBe('2026-01-01T00:00:00Z');
    expect(p.author).toEqual({
      username: 'ace',
      displayName: 'Ace',
      verified: true,
      engineer: true,
      avatar: '/avatars/k',
    });
  });

  it('defaults counts to 0 and flags to false', () => {
    const p = formatPost(base);
    expect(p).toMatchObject({
      threadCount: 0,
      likeCount: 0,
      repostCount: 0,
      commentCount: 0,
      liked: false,
      reposted: false,
    });
  });

  it('adds base_likes / base_reposts to the live counts', () => {
    const p = formatPost({ ...base, like_count: 2, base_likes: 10, repost_count: 1, base_reposts: 5 });
    expect(p.likeCount).toBe(12);
    expect(p.repostCount).toBe(6);
  });

  it('builds media only when media_key is present', () => {
    expect(formatPost(base).media).toBeNull();
    expect(formatPost({ ...base, media_key: 'm1' }).media).toEqual({
      url: '/avatars/m1',
      type: 'image',
    });
    expect(formatPost({ ...base, media_key: 'm1', media_type: 'video' }).media.type).toBe('video');
  });

  it('coerces liked/reposted truthy values to booleans', () => {
    const p = formatPost({ ...base, liked: 1, reposted: 1 });
    expect(p.liked).toBe(true);
    expect(p.reposted).toBe(true);
  });
});
