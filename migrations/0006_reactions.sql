-- Themed reactions on posts (spark, ping) in addition to likes.
-- Applied to remote D1 "notebook" on 2026-06-14.

CREATE TABLE IF NOT EXISTS post_reactions (
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,           -- 'spark' | 'ping'
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (post_id, user_id, type)
);
CREATE INDEX IF NOT EXISTS idx_post_reactions ON post_reactions(post_id, type);
