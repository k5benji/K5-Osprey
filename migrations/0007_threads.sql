-- Threads (connected multi-part posts). The root post has thread_id = its
-- own id and thread_seq = 1; continuation posts share that thread_id with
-- increasing thread_seq. Single posts leave both NULL.
-- Applied to remote D1 "notebook" on 2026-06-14.

ALTER TABLE posts ADD COLUMN thread_id TEXT;
ALTER TABLE posts ADD COLUMN thread_seq INTEGER;
CREATE INDEX IF NOT EXISTS idx_posts_thread ON posts(thread_id, thread_seq);
