-- Background Preferences Schema Cleanup Migration
-- Ensures all environments use the canonical plural array columns
-- Safe to run multiple times

-- Step 1: Remove old singular columns and userRating if they exist
DO $$
BEGIN
  -- Remove old singular columns
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_background_preferences' AND column_name = 'primary_color') THEN
    ALTER TABLE user_background_preferences DROP COLUMN primary_color;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_background_preferences' AND column_name = 'secondary_color') THEN
    ALTER TABLE user_background_preferences DROP COLUMN secondary_color;
  END IF;
  
  -- Remove user_rating column if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_background_preferences' AND column_name = 'user_rating') THEN
    ALTER TABLE user_background_preferences DROP COLUMN user_rating;
  END IF;
END$$;

-- Step 2: Ensure canonical plural array columns exist with proper defaults
DO $$
BEGIN
  -- Add primary_colors array column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_background_preferences' AND column_name = 'primary_colors') THEN
    ALTER TABLE user_background_preferences 
    ADD COLUMN primary_colors text[] DEFAULT ARRAY[]::text[] NOT NULL;
  END IF;
  
  -- Add secondary_colors array column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_background_preferences' AND column_name = 'secondary_colors') THEN
    ALTER TABLE user_background_preferences 
    ADD COLUMN secondary_colors text[] DEFAULT ARRAY[]::text[] NOT NULL;
  END IF;
END$$;

-- Step 3: Update column defaults and types to match new schema
DO $$
BEGIN
  -- Update gradient_type default
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_background_preferences' AND column_name = 'gradient_type') THEN
    ALTER TABLE user_background_preferences ALTER COLUMN gradient_type SET DEFAULT 'linear';
    ALTER TABLE user_background_preferences ALTER COLUMN gradient_type SET NOT NULL;
  END IF;
  
  -- Update color_scheme default
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_background_preferences' AND column_name = 'color_scheme') THEN
    ALTER TABLE user_background_preferences ALTER COLUMN color_scheme SET DEFAULT 'cool';
    ALTER TABLE user_background_preferences ALTER COLUMN color_scheme SET NOT NULL;
  END IF;
  
  -- Update direction default
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_background_preferences' AND column_name = 'direction') THEN
    ALTER TABLE user_background_preferences ALTER COLUMN direction SET DEFAULT 'to bottom right';
    ALTER TABLE user_background_preferences ALTER COLUMN direction SET NOT NULL;
  END IF;
  
  -- Update intensity type and default (change from REAL to double precision)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_background_preferences' AND column_name = 'intensity') THEN
    ALTER TABLE user_background_preferences ALTER COLUMN intensity TYPE double precision;
    ALTER TABLE user_background_preferences ALTER COLUMN intensity SET DEFAULT 0.5;
    ALTER TABLE user_background_preferences ALTER COLUMN intensity SET NOT NULL;
  END IF;
  
  -- Update animation_speed default
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_background_preferences' AND column_name = 'animation_speed') THEN
    ALTER TABLE user_background_preferences ALTER COLUMN animation_speed SET DEFAULT 'medium';
    ALTER TABLE user_background_preferences ALTER COLUMN animation_speed SET NOT NULL;
  END IF;
  
  -- Update usage_count default
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_background_preferences' AND column_name = 'usage_count') THEN
    ALTER TABLE user_background_preferences ALTER COLUMN usage_count SET DEFAULT 0;
    ALTER TABLE user_background_preferences ALTER COLUMN usage_count SET NOT NULL;
  END IF;
END$$;