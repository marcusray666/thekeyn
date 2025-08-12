CREATE TABLE "admin_audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"adminId" integer NOT NULL,
	"action" text NOT NULL,
	"targetType" text NOT NULL,
	"targetId" text NOT NULL,
	"details" text,
	"ipAddress" text,
	"userAgent" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blockchain_verifications" (
	"id" text PRIMARY KEY DEFAULT 'pGXqSPYEZaEdHlzT6fLpn' NOT NULL,
	"work_id" integer NOT NULL,
	"certificate_id" varchar NOT NULL,
	"file_hash" varchar NOT NULL,
	"merkle_root" varchar NOT NULL,
	"merkle_proof" jsonb NOT NULL,
	"timestamp_hash" varchar NOT NULL,
	"blockchain_anchor" varchar NOT NULL,
	"ipfs_hash" varchar,
	"digital_signature" varchar NOT NULL,
	"network_id" varchar DEFAULT 'ethereum' NOT NULL,
	"block_number" integer,
	"transaction_hash" varchar,
	"contract_address" varchar,
	"token_id" varchar,
	"verification_level" varchar DEFAULT 'basic' NOT NULL,
	"confidence" integer DEFAULT 100 NOT NULL,
	"verification_timestamp" timestamp DEFAULT now(),
	"last_verified" timestamp DEFAULT now(),
	"verification_count" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" serial PRIMARY KEY NOT NULL,
	"work_id" integer NOT NULL,
	"certificate_id" text NOT NULL,
	"pdf_path" text,
	"qr_code" text,
	"shareable_link" text,
	"is_downloadable" boolean DEFAULT false,
	"has_custom_branding" boolean DEFAULT false,
	"verification_proof" text,
	"verification_level" text DEFAULT 'basic',
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "certificates_certificate_id_unique" UNIQUE("certificate_id")
);
--> statement-breakpoint
CREATE TABLE "collaboration_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"owner_id" integer NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"type" text NOT NULL,
	"max_collaborators" integer DEFAULT 10,
	"deadline" timestamp,
	"budget" integer,
	"tags" text[] DEFAULT '{}',
	"requirements" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"work_id" integer NOT NULL,
	"parent_id" integer,
	"content" text NOT NULL,
	"mentioned_users" text[] DEFAULT '{}',
	"like_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"work_id" integer,
	"title" text NOT NULL,
	"description" text,
	"filename" text,
	"mime_type" text,
	"is_protected" boolean DEFAULT false,
	"likes_count" integer DEFAULT 0,
	"comments_count" integer DEFAULT 0,
	"share_count" integer DEFAULT 0,
	"view_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"color" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "content_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "content_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"reporter_id" integer NOT NULL,
	"reported_user_id" integer,
	"content_type" text NOT NULL,
	"content_id" text NOT NULL,
	"reason" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"resolution" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"user_id" integer NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp DEFAULT now(),
	"notifications_enabled" boolean DEFAULT true,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text,
	"type" text DEFAULT 'direct' NOT NULL,
	"is_archived" boolean DEFAULT false,
	"last_message_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"id" serial PRIMARY KEY NOT NULL,
	"follower_id" integer NOT NULL,
	"following_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"work_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace" (
	"id" serial PRIMARY KEY NOT NULL,
	"work_id" integer NOT NULL,
	"seller_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"currency" text DEFAULT 'USD',
	"is_active" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"license_type" text NOT NULL,
	"tags" text[] DEFAULT '{}',
	"views" integer DEFAULT 0,
	"favorites" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "message_read_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"user_id" integer NOT NULL,
	"read_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"sender_id" integer NOT NULL,
	"content" text NOT NULL,
	"message_type" text DEFAULT 'text' NOT NULL,
	"attachment_url" text,
	"attachment_metadata" text,
	"is_edited" boolean DEFAULT false,
	"edited_at" timestamp,
	"is_deleted" boolean DEFAULT false,
	"deleted_at" timestamp,
	"reply_to_message_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "nft_mints" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"work_id" integer NOT NULL,
	"certificate_id" text NOT NULL,
	"blockchain" text NOT NULL,
	"contract_address" text,
	"token_id" text,
	"transaction_hash" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"minting_cost" text,
	"royalty_percentage" integer DEFAULT 10,
	"metadata_uri" text,
	"marketplace_listings" text[] DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" text NOT NULL,
	"from_user_id" integer,
	"work_id" integer,
	"comment_id" integer,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_id" integer NOT NULL,
	"parent_id" integer,
	"content" text NOT NULL,
	"mentioned_users" text[] DEFAULT '{}',
	"likes" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "post_reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_id" integer NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"content" text NOT NULL,
	"image_url" text,
	"filename" text,
	"file_type" text,
	"mime_type" text,
	"file_size" integer,
	"hashtags" text[] DEFAULT '{}',
	"location" text,
	"mentioned_users" text[] DEFAULT '{}',
	"is_protected" boolean DEFAULT false,
	"protected_work_id" integer,
	"tags" text[] DEFAULT '{}',
	"likes" integer DEFAULT 0,
	"comments" integer DEFAULT 0,
	"shares" integer DEFAULT 0,
	"views" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_collaborators" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" text NOT NULL,
	"permissions" text[] DEFAULT '{}',
	"joined_at" timestamp DEFAULT now(),
	"contribution" text
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"buyer_id" integer NOT NULL,
	"seller_id" integer NOT NULL,
	"listing_id" integer NOT NULL,
	"work_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'USD',
	"status" text DEFAULT 'completed' NOT NULL,
	"transaction_id" text,
	"license_granted" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shares" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"work_id" integer NOT NULL,
	"share_text" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"month" text NOT NULL,
	"uploads_used" integer DEFAULT 0,
	"storage_used" integer DEFAULT 0,
	"api_calls_used" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"tier" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"stripe_subscription_id" text,
	"stripe_customer_id" text,
	"price_id" text,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false,
	"features" text DEFAULT '{}',
	"team_size" integer DEFAULT 1,
	"api_key" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "system_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"total_users" integer DEFAULT 0,
	"active_users" integer DEFAULT 0,
	"new_signups" integer DEFAULT 0,
	"total_works" integer DEFAULT 0,
	"total_posts" integer DEFAULT 0,
	"total_revenue" integer DEFAULT 0,
	"storage_used" integer DEFAULT 0,
	"blockchain_verifications" integer DEFAULT 0,
	"reports_pending" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" timestamp DEFAULT now(),
	"profile_views" integer DEFAULT 0,
	"post_views" integer DEFAULT 0,
	"work_views" integer DEFAULT 0,
	"new_followers" integer DEFAULT 0,
	"total_engagement" integer DEFAULT 0,
	"revenue" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_follows" (
	"id" serial PRIMARY KEY NOT NULL,
	"follower_id" integer NOT NULL,
	"following_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" text NOT NULL,
	"from_user_id" integer,
	"post_id" text,
	"work_id" integer,
	"comment_id" integer,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"action_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"email_notifications" boolean DEFAULT true,
	"push_notifications" boolean DEFAULT true,
	"public_profile" boolean DEFAULT true,
	"show_email" boolean DEFAULT false,
	"allow_messages" boolean DEFAULT true,
	"content_filters" text[] DEFAULT '{}',
	"preferred_categories" text[] DEFAULT '{}',
	"language" text DEFAULT 'en',
	"timezone" text DEFAULT 'UTC',
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"subscription_tier" text DEFAULT 'free' NOT NULL,
	"subscription_status" text DEFAULT 'active',
	"subscription_expires_at" timestamp,
	"monthly_uploads" integer DEFAULT 0,
	"monthly_upload_limit" integer DEFAULT 3,
	"last_upload_reset" timestamp DEFAULT now(),
	"wallet_address" text,
	"display_name" text,
	"bio" text,
	"profile_image_url" text,
	"website" text,
	"location" text,
	"is_verified" boolean DEFAULT false,
	"follower_count" integer DEFAULT 0,
	"following_count" integer DEFAULT 0,
	"total_likes" integer DEFAULT 0,
	"theme_preference" text DEFAULT 'liquid-glass',
	"settings" text DEFAULT '{}',
	"last_login_at" timestamp,
	"is_banned" boolean DEFAULT false,
	"ban_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_audit_log" (
	"id" text PRIMARY KEY DEFAULT 's_3zdzPjzmovaWE5OIFu0' NOT NULL,
	"verification_id" text NOT NULL,
	"verifier_ip" varchar,
	"verifier_user_agent" text,
	"verification_result" boolean NOT NULL,
	"confidence_score" integer NOT NULL,
	"verification_details" jsonb NOT NULL,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "works" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"filename" text NOT NULL,
	"original_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"file_hash" text NOT NULL,
	"certificate_id" text NOT NULL,
	"blockchain_hash" text,
	"creator_name" text NOT NULL,
	"collaborators" text[] DEFAULT '{}',
	"is_public" boolean DEFAULT false,
	"tags" text[] DEFAULT '{}',
	"like_count" integer DEFAULT 0,
	"comment_count" integer DEFAULT 0,
	"share_count" integer DEFAULT 0,
	"view_count" integer DEFAULT 0,
	"moderation_status" text DEFAULT 'pending',
	"moderation_flags" text[] DEFAULT '{}',
	"moderation_score" real DEFAULT 0,
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "works_certificate_id_unique" UNIQUE("certificate_id")
);
--> statement-breakpoint
CREATE TABLE "blockchain_networks" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"chain_id" integer NOT NULL,
	"rpc_url" varchar NOT NULL,
	"explorer_url" varchar NOT NULL,
	"native_currency" jsonb,
	"contract_address" varchar NOT NULL,
	"is_active" boolean DEFAULT true,
	"gas_estimate" varchar DEFAULT '0.01',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "blockchain_transactions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"work_id" integer NOT NULL,
	"metadata_id" varchar,
	"network" varchar NOT NULL,
	"contract_address" varchar NOT NULL,
	"transaction_hash" varchar,
	"token_id" varchar,
	"from_address" varchar NOT NULL,
	"to_address" varchar,
	"gas_used" varchar,
	"gas_price" varchar,
	"status" varchar DEFAULT 'pending',
	"block_number" integer,
	"created_at" timestamp DEFAULT now(),
	"confirmed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ipfs_uploads" (
	"id" varchar PRIMARY KEY NOT NULL,
	"work_id" integer NOT NULL,
	"ipfs_hash" varchar NOT NULL,
	"ipfs_url" varchar NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar NOT NULL,
	"uploaded_at" timestamp DEFAULT now(),
	"status" varchar DEFAULT 'uploading'
);
--> statement-breakpoint
CREATE TABLE "nft_metadata" (
	"id" varchar PRIMARY KEY NOT NULL,
	"work_id" integer NOT NULL,
	"metadata_uri" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text NOT NULL,
	"image" varchar NOT NULL,
	"external_url" varchar,
	"animation_url" varchar,
	"attributes" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "nft_tokens" (
	"id" varchar PRIMARY KEY NOT NULL,
	"work_id" integer NOT NULL,
	"transaction_id" varchar NOT NULL,
	"token_id" varchar NOT NULL,
	"contract_address" varchar NOT NULL,
	"network" varchar NOT NULL,
	"owner_address" varchar NOT NULL,
	"creator_address" varchar NOT NULL,
	"minted_at" timestamp DEFAULT now(),
	"transfer_count" integer DEFAULT 0,
	"last_transfer_at" timestamp,
	"is_for_sale" boolean DEFAULT false,
	"sale_price" varchar,
	"royalty_percentage" integer DEFAULT 10
);
--> statement-breakpoint
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_adminId_users_id_fk" FOREIGN KEY ("adminId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blockchain_verifications" ADD CONSTRAINT "blockchain_verifications_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_projects" ADD CONSTRAINT "collaboration_projects_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_reported_user_id_users_id_fk" FOREIGN KEY ("reported_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace" ADD CONSTRAINT "marketplace_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace" ADD CONSTRAINT "marketplace_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_read_status" ADD CONSTRAINT "message_read_status_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_read_status" ADD CONSTRAINT "message_read_status_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nft_mints" ADD CONSTRAINT "nft_mints_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nft_mints" ADD CONSTRAINT "nft_mints_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nft_mints" ADD CONSTRAINT "nft_mints_certificate_id_certificates_certificate_id_fk" FOREIGN KEY ("certificate_id") REFERENCES "public"."certificates"("certificate_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_protected_work_id_works_id_fk" FOREIGN KEY ("protected_work_id") REFERENCES "public"."works"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_collaborators" ADD CONSTRAINT "project_collaborators_project_id_collaboration_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."collaboration_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_collaborators" ADD CONSTRAINT "project_collaborators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_listing_id_marketplace_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."marketplace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shares" ADD CONSTRAINT "shares_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shares" ADD CONSTRAINT "shares_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_usage" ADD CONSTRAINT "subscription_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_analytics" ADD CONSTRAINT "user_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_comment_id_post_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."post_comments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_audit_log" ADD CONSTRAINT "verification_audit_log_verification_id_blockchain_verifications_id_fk" FOREIGN KEY ("verification_id") REFERENCES "public"."blockchain_verifications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "works" ADD CONSTRAINT "works_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;