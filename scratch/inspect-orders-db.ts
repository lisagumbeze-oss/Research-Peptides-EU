import { pool } from '../server/src/db';

async function main() {
  const columns = await pool.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders'
    ORDER BY ordinal_position
  `);

  const checks = await pool.query(`
    SELECT conname, pg_get_constraintdef(c.oid) AS definition
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND t.relname = 'orders'
      AND c.contype = 'c'
  `);

  const policies = await pool.query(`
    SELECT policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'orders'
  `);

  console.log('COLUMNS');
  console.log(JSON.stringify(columns.rows, null, 2));
  console.log('CHECKS');
  console.log(JSON.stringify(checks.rows, null, 2));
  console.log('POLICIES');
  console.log(JSON.stringify(policies.rows, null, 2));

  await pool.end();
}

main().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
