import { pool } from '../server/src/db';

async function main() {
  const { rows } = await pool.query(
    "SELECT id, event_type, status, created_at FROM email_events ORDER BY created_at DESC LIMIT 5"
  );
  console.log(rows);
  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  await pool.end();
  process.exit(1);
});
