import fs from 'fs';
import { pool } from '../server/src/db';

async function main() {
  const sql = fs.readFileSync('server/migrations/002_email_events.sql', 'utf-8');
  await pool.query(sql);
  console.log('Applied migration: 002_email_events.sql');
  await pool.end();
}

main().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
