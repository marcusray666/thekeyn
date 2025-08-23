-- Manual migration script for Railway production database
-- Run this manually in Railway's database console to add missing background tables

-- Create user_background_preferences table
CREATE TABLE IF NOT EXISTS "user_background_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"gradient_type" text NOT NULL,
	"color_scheme" text NOT NULL,
	"primary_colors" text[] NOT NULL,
	"secondary_colors" text[],
	"direction" text,
	"intensity" real DEFAULT 1,
	"animation_speed" text DEFAULT 'medium',
	"time_of_day_preference" text,
	"mood_tag" text,
	"usage_count" integer DEFAULT 1,
	"last_used" timestamp DEFAULT now(),
	"user_rating" real,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create background_interactions table
CREATE TABLE IF NOT EXISTS "background_interactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"gradient_id" text NOT NULL,
	"interaction_type" text NOT NULL,
	"time_spent" integer,
	"page_context" text,
	"device_type" text,
	"time_of_day" text,
	"weather_context" text,
	"session_duration" integer,
	"created_at" timestamp DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE "user_background_preferences" 
ADD CONSTRAINT "user_background_preferences_user_id_users_id_fk" 
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "background_interactions" 
ADD CONSTRAINT "background_interactions_user_id_users_id_fk" 
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_user_background_preferences_user_id" ON "user_background_preferences"("user_id");
CREATE INDEX IF NOT EXISTS "idx_background_interactions_user_id" ON "background_interactions"("user_id");
CREATE INDEX IF NOT EXISTS "idx_background_interactions_gradient_id" ON "background_interactions"("gradient_id");