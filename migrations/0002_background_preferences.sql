-- Migration to add user_background_preferences and background_interactions tables
-- Created: August 23, 2025

-- Create user_background_preferences table
CREATE TABLE IF NOT EXISTS "user_background_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"gradient_type" text DEFAULT 'linear',
	"color_scheme" text DEFAULT 'warm',
	"primary_colors" text[] DEFAULT '{}',
	"secondary_colors" text[] DEFAULT '{}',
	"direction" text DEFAULT 'diagonal',
	"intensity" real DEFAULT 0.8,
	"animation_speed" real DEFAULT 1,
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
DO $$ BEGIN
 ALTER TABLE "user_background_preferences" ADD CONSTRAINT "user_background_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "background_interactions" ADD CONSTRAINT "background_interactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;