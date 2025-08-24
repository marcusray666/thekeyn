-- Posts Schema Standardization Migration
-- Add missing columns to posts table and ensure consistency

-- Add missing columns to posts table if they don't exist
DO $$
BEGIN
  -- Add isHidden column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'is_hidden') THEN
    ALTER TABLE "posts" ADD COLUMN "is_hidden" BOOLEAN DEFAULT false;
  END IF;

  -- Add videoUrl column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'video_url') THEN
    ALTER TABLE "posts" ADD COLUMN "video_url" TEXT;
  END IF;

  -- Add audioUrl column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'audio_url') THEN
    ALTER TABLE "posts" ADD COLUMN "audio_url" TEXT;
  END IF;

  -- Add fileUrl column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'file_url') THEN
    ALTER TABLE "posts" ADD COLUMN "file_url" TEXT;
  END IF;

  -- Add moderationStatus column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'moderation_status') THEN
    ALTER TABLE "posts" ADD COLUMN "moderation_status" TEXT;
  END IF;

  -- Add moderationFlags column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'moderation_flags') THEN
    ALTER TABLE "posts" ADD COLUMN "moderation_flags" TEXT[] DEFAULT '{}';
  END IF;

  -- Ensure all required columns exist with proper defaults
  -- Update any NULL values to proper defaults
  UPDATE "posts" SET 
    "likes" = COALESCE("likes", 0),
    "comments" = COALESCE("comments", 0), 
    "shares" = COALESCE("shares", 0),
    "views" = COALESCE("views", 0),
    "hashtags" = COALESCE("hashtags", '{}'),
    "mentioned_users" = COALESCE("mentioned_users", '{}'),
    "tags" = COALESCE("tags", '{}'),
    "is_protected" = COALESCE("is_protected", false),
    "is_hidden" = COALESCE("is_hidden", false)
  WHERE 
    "likes" IS NULL OR
    "comments" IS NULL OR 
    "shares" IS NULL OR
    "views" IS NULL OR
    "hashtags" IS NULL OR
    "mentioned_users" IS NULL OR
    "tags" IS NULL OR
    "is_protected" IS NULL OR
    "is_hidden" IS NULL;

END$$;

-- Create indexes for better performance on commonly queried columns
DO $$
BEGIN
  -- Index on user_id for user's posts
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_user_id') THEN
    CREATE INDEX "idx_posts_user_id" ON "posts" ("user_id");
  END IF;

  -- Index on created_at for chronological ordering
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_created_at') THEN
    CREATE INDEX "idx_posts_created_at" ON "posts" ("created_at");
  END IF;

  -- Index on is_hidden for filtering
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_is_hidden') THEN
    CREATE INDEX "idx_posts_is_hidden" ON "posts" ("is_hidden");
  END IF;

  -- Index on is_protected for filtering
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_is_protected') THEN
    CREATE INDEX "idx_posts_is_protected" ON "posts" ("is_protected");
  END IF;

END$$;