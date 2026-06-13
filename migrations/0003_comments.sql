-- Post comments (replies). Named post_comments to match post_likes/post_reposts
-- (a legacy, unused `comments` table with a different schema already exists).
-- Applied to remote D1 "notebook" on 2026-06-14.

CREATE TABLE IF NOT EXISTS post_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id, created_at);
