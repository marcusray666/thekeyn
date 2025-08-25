-- Make code that uses singular columns work on DBs that have arrays.
-- Safe to re-run.

ALTER TABLE user_background_preferences
  ADD COLUMN IF NOT EXISTS primary_color text,
  ADD COLUMN IF NOT EXISTS secondary_color text;

-- If the array columns exist and have values, backfill the new columns
-- but don't overwrite anything already set.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='user_background_preferences' AND column_name='primary_colors'
  ) THEN
    EXECUTE $i$
      UPDATE user_background_preferences
      SET primary_color = COALESCE(primary_color, (primary_colors)[1]),
          secondary_color = COALESCE(secondary_color, (secondary_colors)[1])
    $i$;
  END IF;
END$$;