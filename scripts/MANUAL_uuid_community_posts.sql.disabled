-- Enable UUID generator
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Add new UUID id column only if current id is not uuid
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='community_posts'
      AND column_name='id' AND data_type <> 'uuid'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='community_posts'
      AND column_name='id_new'
  ) THEN
    EXECUTE 'ALTER TABLE public.community_posts
             ADD COLUMN id_new uuid DEFAULT gen_random_uuid() NOT NULL';
  END IF;
END$$;

-- Prepare child tables for UUID FKs
ALTER TABLE public.post_comments      ADD COLUMN IF NOT EXISTS post_id_new uuid;
ALTER TABLE public.post_reactions     ADD COLUMN IF NOT EXISTS post_id_new uuid;
ALTER TABLE public.user_notifications ADD COLUMN IF NOT EXISTS post_id_new uuid;

-- Map old text ids -> new UUIDs (runs only if id_new exists)
UPDATE public.post_comments pc
SET post_id_new = cp.id_new
FROM public.community_posts cp
WHERE pc.post_id::text = cp.id
  AND pc.post_id_new IS NULL
  AND EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_schema='public' AND table_name='community_posts' AND column_name='id_new');

UPDATE public.post_reactions pr
SET post_id_new = cp.id_new
FROM public.community_posts cp
WHERE pr.post_id::text = cp.id
  AND pr.post_id_new IS NULL
  AND EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_schema='public' AND table_name='community_posts' AND column_name='id_new');

UPDATE public.user_notifications un
SET post_id_new = cp.id_new
FROM public.community_posts cp
WHERE un.post_id::text = cp.id
  AND un.post_id_new IS NULL
  AND EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_schema='public' AND table_name='community_posts' AND column_name='id_new');

-- Drop old FKs (names from your DB; IF EXISTS makes it safe)
ALTER TABLE public.post_comments      DROP CONSTRAINT IF EXISTS post_comments_post_id_posts_id_fk;
ALTER TABLE public.post_reactions     DROP CONSTRAINT IF EXISTS post_reactions_post_id_posts_id_fk;
ALTER TABLE public.user_notifications DROP CONSTRAINT IF EXISTS user_notifications_post_id_posts_id_fk;

-- Swap columns if id_new exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='community_posts' AND column_name='id_new'
  ) THEN
    -- swap child columns
    ALTER TABLE public.post_comments      DROP COLUMN IF EXISTS post_id;
    ALTER TABLE public.post_reactions     DROP COLUMN IF EXISTS post_id;
    ALTER TABLE public.user_notifications DROP COLUMN IF EXISTS post_id;

    ALTER TABLE public.post_comments      RENAME COLUMN post_id_new TO post_id;
    ALTER TABLE public.post_reactions     RENAME COLUMN post_id_new TO post_id;
    ALTER TABLE public.user_notifications RENAME COLUMN post_id_new TO post_id;

    -- switch PK to uuid
    ALTER TABLE public.community_posts DROP CONSTRAINT IF EXISTS posts_pkey;
    ALTER TABLE public.community_posts RENAME COLUMN id TO id_old;
    ALTER TABLE public.community_posts RENAME COLUMN id_new TO id;
    ALTER TABLE public.community_posts ADD PRIMARY KEY (id);
  END IF;
END$$;

-- Recreate FKs to the new uuid id
ALTER TABLE public.post_comments
  ADD CONSTRAINT IF NOT EXISTS post_comments_post_id_fk
  FOREIGN KEY (post_id) REFERENCES public.community_posts(id) ON DELETE CASCADE;

ALTER TABLE public.post_reactions
  ADD CONSTRAINT IF NOT EXISTS post_reactions_post_id_fk
  FOREIGN KEY (post_id) REFERENCES public.community_posts(id) ON DELETE CASCADE;

ALTER TABLE public.user_notifications
  ADD CONSTRAINT IF NOT EXISTS user_notifications_post_id_fk
  FOREIGN KEY (post_id) REFERENCES public.community_posts(id) ON DELETE CASCADE;

-- Helpful index (exists already, safe to assert)
CREATE INDEX IF NOT EXISTS idx_community_posts_user_created
  ON public.community_posts (user_id, created_at DESC, id DESC);
