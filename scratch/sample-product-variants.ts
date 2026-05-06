import { pool } from '../server/src/db';

async function main() {
  const result = await pool.query(
    "select title, price, variants from products where variants is not null limit 3"
  );
  console.log(JSON.stringify(result.rows, null, 2));
  await pool.end();
}

main().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
