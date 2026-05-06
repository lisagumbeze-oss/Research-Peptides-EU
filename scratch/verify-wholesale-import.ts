import { pool } from '../server/src/db';

const rows = await pool.query(
  `SELECT title, price, inventory, array_length(images, 1) AS image_count
   FROM products
   WHERE title = ANY($1::text[])
   ORDER BY title`,
  [[
    'BPC 157 x 10 Vials',
    'BPC 157 + GHK-CU + TB500 x 10 Vials',
    'BPC 157 + TB500 x 10 Vials',
    'DIOSA GLOW 70mg Prefilled Pen',
    'GHK-CU x 10 Vials',
    'HCG x 10 Vials',
    'MOTS-c x 10 Vials',
    'Tirzepatide 100mg One Vial',
    'Vio Labs Retatrutide 40mg / 3ml Prefilled Pen'
  ]]
);

console.log(JSON.stringify(rows.rows, null, 2));
await pool.end();
