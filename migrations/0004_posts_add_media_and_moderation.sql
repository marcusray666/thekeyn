-- Bring "posts" table up to what the code expects. Safe to run multiple times.

ALTER TABLE posts ADD COLUMN IF NOT EXISTS video_url          text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS audio_url          text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS file_url           text;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS filename           text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS file_type          text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS mime_type          text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS file_size          integer;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS hashtags           text[] DEFAULT '{}'::text[];
ALTER TABLE posts ADD COLUMN IF NOT EXISTS location           text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS mentioned_users    text[] DEFAULT '{}'::text[];

ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_protected       boolean DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS protected_work_id  integer;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_hidden          boolean DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags               text[] DEFAULT '{}'::text[];

ALTER TABLE posts ADD COLUMN IF NOT EXISTS likes              integer DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comments           integer DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS shares             integer DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS views              integer DEFAULT 0;

-- Some builds reference this; give it a default so inserts don't fail even if code doesn't set it.
ALTER TABLE posts ADD COLUMN IF NOT EXISTS moderation_status  text DEFAULT 'pending';

-- Timestamps (if you don't already have them)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS created_at         timestamp DEFAULT now();
ALTER TABLE posts ADD COLUMN IF NOT EXISTS updated_at         timestamp DEFAULT now();