import pg from "pg";

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
try {
  await client.query("BEGIN");

  // 1) Ensure PK on integer id (community_posts)
  const pk = await client.query(`
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema='public'
      AND table_name='community_posts'
      AND constraint_type='PRIMARY KEY'
  `);
  if (pk.rowCount === 0) {
    await client.query(`ALTER TABLE public.community_posts ADD PRIMARY KEY (id)`);
  }

  // 2) Ensure sequence + default on id
  await client.query(`CREATE SEQUENCE IF NOT EXISTS community_posts_id_seq OWNED BY public.community_posts.id;`);
  const { rows: [{ max }] } = await client.query(`SELECT MAX(id)::bigint AS max FROM public.community_posts`);
  if (max === null) {
    // empty table: nextval() should return 1
    await client.query(`SELECT setval('community_posts_id_seq', 1, false);`);
  } else {
    // table has rows: nextval() should return max+1
    await client.query(`SELECT setval('community_posts_id_seq', $1::bigint, true);`, [max]);
  }
  await client.query(`ALTER TABLE public.community_posts ALTER COLUMN id SET DEFAULT nextval('community_posts_id_seq');`);

  // 3) Drop any old FKs (safe if they don't exist)
  await client.query(`ALTER TABLE public.post_comments      DROP CONSTRAINT IF EXISTS post_comments_post_id_posts_id_fk;`);
  await client.query(`ALTER TABLE public.post_reactions     DROP CONSTRAINT IF EXISTS post_reactions_post_id_posts_id_fk;`);
  await client.query(`ALTER TABLE public.user_notifications DROP CONSTRAINT IF EXISTS user_notifications_post_id_posts_id_fk;`);
  await client.query(`ALTER TABLE public.post_comments      DROP CONSTRAINT IF EXISTS post_comments_post_id_fk;`);
  await client.query(`ALTER TABLE public.post_reactions     DROP CONSTRAINT IF EXISTS post_reactions_post_id_fk;`);
  await client.query(`ALTER TABLE public.user_notifications DROP CONSTRAINT IF EXISTS user_notifications_post_id_fk;`);

  // 4) Convert child post_id from text -> integer (non-numeric -> NULL)
  await client.query(`
    ALTER TABLE public.post_comments
    ALTER COLUMN post_id TYPE integer
    USING CASE WHEN post_id ~ '^[0-9]+$' THEN post_id::integer ELSE NULL END;
  `);
  await client.query(`
    ALTER TABLE public.post_reactions
    ALTER COLUMN post_id TYPE integer
    USING CASE WHEN post_id ~ '^[0-9]+$' THEN post_id::integer ELSE NULL END;
  `);
  await client.query(`
    ALTER TABLE public.user_notifications
    ALTER COLUMN post_id TYPE integer
    USING CASE WHEN post_id ~ '^[0-9]+$' THEN post_id::integer ELSE NULL END;
  `);

  // 5) Remove orphans (rows pointing to non-existent posts)
  await client.query(`
    DELETE FROM public.post_comments pc
    WHERE pc.post_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM public.community_posts cp WHERE cp.id = pc.post_id);
  `);
  await client.query(`
    DELETE FROM public.post_reactions pr
    WHERE pr.post_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM public.community_posts cp WHERE cp.id = pr.post_id);
  `);
  await client.query(`
    DELETE FROM public.user_notifications un
    WHERE un.post_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM public.community_posts cp WHERE cp.id = un.post_id);
  `);

  // 6) Add FKs (NOT VALID first), then VALIDATE
  await client.query(`
    ALTER TABLE public.post_comments
    ADD CONSTRAINT post_comments_post_id_fk
    FOREIGN KEY (post_id) REFERENCES public.community_posts(id) ON DELETE CASCADE NOT VALID;
  `);
  await client.query(`
    ALTER TABLE public.post_reactions
    ADD CONSTRAINT post_reactions_post_id_fk
    FOREIGN KEY (post_id) REFERENCES public.community_posts(id) ON DELETE CASCADE NOT VALID;
  `);
  await client.query(`
    ALTER TABLE public.user_notifications
    ADD CONSTRAINT user_notifications_post_id_fk
    FOREIGN KEY (post_id) REFERENCES public.community_posts(id) ON DELETE CASCADE NOT VALID;
  `);

  await client.query(`ALTER TABLE public.post_comments      VALIDATE CONSTRAINT post_comments_post_id_fk;`);
  await client.query(`ALTER TABLE public.post_reactions     VALIDATE CONSTRAINT post_reactions_post_id_fk;`);
  await client.query(`ALTER TABLE public.user_notifications VALIDATE CONSTRAINT user_notifications_post_id_fk;`);

  // 7) Helpful index for feeds
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_community_posts_user_created
    ON public.community_posts (user_id, created_at DESC, id DESC);
  `);

  await client.query("COMMIT");
  console.log("✅ Fixed: integer PK + sequence + child FKs aligned");
} catch (e) {
  await client.query("ROLLBACK");
  console.error("❌ Migration failed:", e.message);
  process.exit(1);
} finally {
  await client.end();
}
