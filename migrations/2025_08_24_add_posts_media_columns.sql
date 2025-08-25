-- Add media / metadata columns to posts (safe to re-run)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS video_url           text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS audio_url           text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS file_url            text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS filename            text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS file_type           text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS mime_type           text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS file_size           integer;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS hashtags            text[] DEFAULT '{}'::text[];
ALTER TABLE posts ADD COLUMN IF NOT EXISTS location            text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS mentioned_users     text[] DEFAULT '{}'::text[];

ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_protected        boolean DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS protected_work_id   integer
  REFERENCES works(id) ON DELETE SET NULL;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_hidden           boolean DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags                text[] DEFAULT '{}'::text[];

ALTER TABLE posts ADD COLUMN IF NOT EXISTS likes               integer DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comments            integer DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS shares              integer DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS views               integer DEFAULT 0;

-- (optional but helpful) basic indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);