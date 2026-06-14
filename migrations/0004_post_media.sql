-- Image/video attachments on posts. Media bytes live in the R2 AVATARS
-- bucket under post_* keys; media_type is 'image' or 'video'.
-- Applied to remote D1 "notebook" on 2026-06-14.

ALTER TABLE posts ADD COLUMN media_key TEXT;
ALTER TABLE posts ADD COLUMN media_type TEXT;
