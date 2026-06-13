-- Real follow system.
-- Applied to remote D1 "notebook" on 2026-06-13.

CREATE TABLE IF NOT EXISTS follows (
  follower_id TEXT NOT NULL,
  followee_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (follower_id, followee_id)
);
CREATE INDEX IF NOT EXISTS idx_follows_followee ON follows(followee_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);

-- Seed/offset counts (mirrors posts.base_likes / base_reposts).
ALTER TABLE users ADD COLUMN base_followers INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN base_following INTEGER NOT NULL DEFAULT 0;

UPDATE users SET base_followers = 17000, base_following = 5 WHERE username = 'k5binya';
