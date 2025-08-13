const fs = require("fs");
const { Client } = require("pg");

(async () => {
  const sql = fs.readFileSync("scripts/uuid_community_posts.sql", "utf8");
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
    console.log("✅ UUID migration applied");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed:", e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
