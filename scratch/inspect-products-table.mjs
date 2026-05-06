import { pool } from '../server/src/db.js';

const result = await pool.query(
  "select column_name, data_type from information_schema.columns where table_name='products' order by ordinal_position"
);

console.log(JSON.stringify(result.rows, null, 2));
await pool.end();
