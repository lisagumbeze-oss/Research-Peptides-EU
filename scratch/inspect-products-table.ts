import { pool } from '../server/src/db';

async function main() {
  const result = await pool.query(
    "select column_name, data_type from information_schema.columns where table_name='products' order by ordinal_position"
  );
  console.log(JSON.stringify(result.rows, null, 2));
  await pool.end();
}

main().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
