-- Fix posts foreign key schema mismatch (safe to re-run)
-- posts.id is text but foreign keys were integer

-- First, drop existing foreign key constraints
ALTER TABLE post_reactions DROP CONSTRAINT IF EXISTS post_reactions_post_id_posts_id_fk;
ALTER TABLE post_comments DROP CONSTRAINT IF EXISTS post_comments_post_id_posts_id_fk;

-- Change post_reactions.post_id from integer to text
ALTER TABLE post_reactions ALTER COLUMN post_id TYPE text USING post_id::text;

-- Change post_comments.post_id from integer to text  
ALTER TABLE post_comments ALTER COLUMN post_id TYPE text USING post_id::text;

-- Recreate foreign key constraints with correct types
ALTER TABLE post_reactions ADD CONSTRAINT post_reactions_post_id_posts_id_fk 
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

ALTER TABLE post_comments ADD CONSTRAINT post_comments_post_id_posts_id_fk
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;