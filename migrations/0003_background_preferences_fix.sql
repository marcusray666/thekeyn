-- Background Preferences Schema Fix
-- Safe migration with proper guards for Railway deployment

-- Create user_background_preferences table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_background_preferences') THEN
    CREATE TABLE "user_background_preferences" (
      "id" SERIAL PRIMARY KEY,
      "user_id" INTEGER NOT NULL,
      "gradient_type" TEXT NOT NULL,
      "color_scheme" TEXT NOT NULL,
      "primary_colors" TEXT[] NOT NULL,
      "secondary_colors" TEXT[],
      "direction" TEXT,
      "intensity" REAL DEFAULT 1.0,
      "animation_speed" TEXT DEFAULT 'medium',
      "time_of_day_preference" TEXT,
      "mood_tag" TEXT,
      "usage_count" INTEGER DEFAULT 1,
      "last_used" TIMESTAMP DEFAULT NOW(),
      "user_rating" REAL,
      "created_at" TIMESTAMP DEFAULT NOW(),
      "updated_at" TIMESTAMP DEFAULT NOW()
    );
  END IF;
END$$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_background_preferences_user_id_users_id_fk') THEN
    ALTER TABLE "user_background_preferences"
      ADD CONSTRAINT "user_background_preferences_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION;
  END IF;
END$$;

-- Create background_interactions table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'background_interactions') THEN
    CREATE TABLE "background_interactions" (
      "id" SERIAL PRIMARY KEY,
      "user_id" INTEGER NOT NULL,
      "gradient_id" TEXT NOT NULL,
      "interaction_type" TEXT NOT NULL,
      "time_spent" INTEGER,
      "page_context" TEXT,
      "device_type" TEXT,
      "time_of_day" TEXT,
      "weather_context" TEXT,
      "session_duration" INTEGER,
      "created_at" TIMESTAMP DEFAULT NOW()
    );
  END IF;
END$$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'background_interactions_user_id_users_id_fk') THEN
    ALTER TABLE "background_interactions"
      ADD CONSTRAINT "background_interactions_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION;
  END IF;
END$$;

-- Add missing columns to existing tables if they don't exist
DO $$
BEGIN
  -- Add gradient_type column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_background_preferences' AND column_name = 'gradient_type') THEN
    ALTER TABLE "user_background_preferences" ADD COLUMN "gradient_type" TEXT NOT NULL DEFAULT 'linear';
  END IF;
  
  -- Add color_scheme column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_background_preferences' AND column_name = 'color_scheme') THEN
    ALTER TABLE "user_background_preferences" ADD COLUMN "color_scheme" TEXT NOT NULL DEFAULT 'warm';
  END IF;
  
  -- Add primary_colors column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_background_preferences' AND column_name = 'primary_colors') THEN
    ALTER TABLE "user_background_preferences" ADD COLUMN "primary_colors" TEXT[] NOT NULL DEFAULT '{}';
  END IF;
END$$;