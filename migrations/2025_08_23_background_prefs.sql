-- Background preferences schema (idempotent)

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_background_preferences (
  id                     bigserial PRIMARY KEY,
  user_id                bigint NOT NULL,
  gradient_type          text    NOT NULL DEFAULT 'linear',
  color_scheme           text    NOT NULL DEFAULT 'cool',
  primary_colors         text[]  NOT NULL DEFAULT ARRAY[]::text[],
  secondary_colors       text[]  NOT NULL DEFAULT ARRAY[]::text[],
  intensity              float8  NOT NULL DEFAULT 0.5,
  usage_count            integer NOT NULL DEFAULT 0,
  direction              text    NOT NULL DEFAULT 'to bottom right',
  animation_speed        text    NOT NULL DEFAULT 'medium',
  time_of_day_preference text,
  mood_tag               text,
  last_used              timestamptz NOT NULL DEFAULT now(),
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

-- Rename legacy columns if present
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='user_background_preferences' AND column_name='background_type')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns
                     WHERE table_name='user_background_preferences' AND column_name='gradient_type') THEN
    ALTER TABLE user_background_preferences RENAME COLUMN background_type TO gradient_type;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='user_background_preferences' AND column_name='gradient_colors')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns
                     WHERE table_name='user_background_preferences' AND column_name='primary_colors') THEN
    ALTER TABLE user_background_preferences RENAME COLUMN gradient_colors TO primary_colors;
  END IF;
END$$;

-- Ensure columns exist / have correct defaults (safe to re-run)
ALTER TABLE user_background_preferences
  ADD COLUMN IF NOT EXISTS gradient_type          text    NOT NULL DEFAULT 'linear',
  ADD COLUMN IF NOT EXISTS color_scheme           text    NOT NULL DEFAULT 'cool',
  ADD COLUMN IF NOT EXISTS primary_colors         text[]  NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS secondary_colors       text[]  NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS intensity              float8  NOT NULL DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS usage_count            integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS direction              text    NOT NULL DEFAULT 'to bottom right',
  ADD COLUMN IF NOT EXISTS animation_speed        text    NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS time_of_day_preference text,
  ADD COLUMN IF NOT EXISTS mood_tag               text,
  ADD COLUMN IF NOT EXISTS last_used              timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_at             timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at             timestamptz NOT NULL DEFAULT now();

-- Keep array defaults correct even if columns existed
ALTER TABLE user_background_preferences
  ALTER COLUMN primary_colors   SET DEFAULT ARRAY[]::text[],
  ALTER COLUMN secondary_colors SET DEFAULT ARRAY[]::text[];
-- Ensure user_rating column exists (type real is fine for a 0..5 rating)
ALTER TABLE user_background_preferences
  ADD COLUMN IF NOT EXISTS user_rating real DEFAULT 0;

-- If animation_speed is numeric from the older migration, convert it to text
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_background_preferences'
      AND column_name = 'animation_speed'
      AND data_type IN ('real','double precision','numeric')
  ) THEN
    ALTER TABLE user_background_preferences
      ALTER COLUMN animation_speed TYPE text USING animation_speed::text,
      ALTER COLUMN animation_speed SET DEFAULT 'medium';
  END IF;
END$$;

-- Normalize defaults (safe to run repeatedly)
ALTER TABLE user_background_preferences
  ALTER COLUMN primary_colors   SET DEFAULT ARRAY[]::text[],
  ALTER COLUMN secondary_colors SET DEFAULT ARRAY[]::text[],
  ALTER COLUMN color_scheme     SET DEFAULT 'cool',
  ALTER COLUMN direction        SET DEFAULT 'to bottom right',
  ALTER COLUMN intensity        SET DEFAULT 0.5;

-- Optional: if you want last_used to be timestamptz instead of timestamp
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='user_background_preferences'
      AND column_name='last_used'
      AND data_type='timestamp without time zone'
  ) THEN
    ALTER TABLE user_background_preferences
      ALTER COLUMN last_used TYPE timestamptz USING last_used AT TIME ZONE 'UTC';
  END IF;
END$$;

