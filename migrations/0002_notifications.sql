-- Notifications (likes, reposts, follows, mentions).
-- Applied to remote D1 "notebook" on 2026-06-14.

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,       -- recipient
  actor_id TEXT NOT NULL,      -- who triggered it
  type TEXT NOT NULL,          -- like | repost | follow | mention
  post_id TEXT,                -- nullable (null for follow)
  read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at);
