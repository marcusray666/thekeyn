-- Complete Railway schema compatibility fix
-- Adds all missing columns that are causing errors in production

-- Fix posts table - add missing title column
ALTER TABLE posts ADD COLUMN IF NOT EXISTS title VARCHAR(255);

-- Fix user_background_preferences table - add missing singular columns
ALTER TABLE user_background_preferences 
  ADD COLUMN IF NOT EXISTS primary_color text,
  ADD COLUMN IF NOT EXISTS secondary_color text;

-- Backfill data from array columns if they exist and singular columns are empty
DO $$
BEGIN
  -- Backfill primary_color from primary_colors array
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='user_background_preferences' AND column_name='primary_colors'
  ) THEN
    UPDATE user_background_preferences
    SET primary_color = COALESCE(primary_color, (primary_colors)[1])
    WHERE primary_color IS NULL AND primary_colors IS NOT NULL AND array_length(primary_colors, 1) > 0;
  END IF;

  -- Backfill secondary_color from secondary_colors array  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='user_background_preferences' AND column_name='secondary_colors'
  ) THEN
    UPDATE user_background_preferences
    SET secondary_color = COALESCE(secondary_color, (secondary_colors)[1])
    WHERE secondary_color IS NULL AND secondary_colors IS NOT NULL AND array_length(secondary_colors, 1) > 0;
  END IF;
END$$;

-- Ensure posts have default titles for existing records
UPDATE posts SET title = 'Untitled Post' WHERE title IS NULL OR title = '';

-- Add any other missing essential columns that might be causing errors
ALTER TABLE posts ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;