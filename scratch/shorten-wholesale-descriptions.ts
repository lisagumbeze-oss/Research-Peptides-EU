import { pool } from '../server/src/db';

const updates: Array<{ title: string; description: string }> = [
  {
    title: 'BPC 157 x 10 Vials',
    description:
      'High-purity BPC-157 supplied in 10 sterile lyophilized vials for laboratory workflows.\nDesigned for controlled peptide stability and assay development studies.\nResearch use only.'
  },
  {
    title: 'BPC 157 + GHK-CU + TB500 x 10 Vials',
    description:
      'Multi-peptide blend with BPC-157, GHK-CU, and TB500 in 10 sterile lyophilized vials.\nSupports structured in-vitro testing and compound interaction research.\nResearch use only.'
  },
  {
    title: 'BPC 157 + TB500 x 10 Vials',
    description:
      'Dual blend of BPC-157 and TB500 supplied in 10 sterile lyophilized vials.\nBuilt for controlled laboratory protocols, method validation, and repeatable assay work.\nResearch use only.'
  },
  {
    title: 'DIOSA GLOW 70mg Prefilled Pen',
    description:
      'Research blend featuring BPC-157, TB500, and GHK-CU in a 70mg prefilled pen format.\nMade for precision handling and consistent experimental setup in lab environments.\nResearch use only.'
  },
  {
    title: 'GHK-CU x 10 Vials',
    description:
      'Copper tripeptide (GHK-CU) supplied as 10 lyophilized sterile vials.\nSuitable for peptide-metal interaction analysis and controlled biochemical testing.\nResearch use only.'
  },
  {
    title: 'HCG x 10 Vials',
    description:
      'HCG provided in 10 sterile lyophilized vials for structured lab applications.\nPrepared for analytical workflows, protocol validation, and reproducible handling.\nResearch use only.'
  },
  {
    title: 'MOTS-c x 10 Vials',
    description:
      'MOTS-c peptide supplied as 10 sterile lyophilized vials for laboratory research.\nOptimized for metabolic signaling studies and controlled analytical workflows.\nResearch use only.'
  },
  {
    title: 'Tirzepatide 100mg One Vial',
    description:
      'Single 100mg lyophilized Tirzepatide vial for advanced laboratory protocols.\nSupports receptor and stability-focused peptide research in controlled environments.\nResearch use only.'
  },
  {
    title: 'Vio Labs Retatrutide 40mg / 3ml Prefilled Pen',
    description:
      'Retatrutide 40mg/3ml prefilled pen designed for precision lab handling.\nDelivers consistent dosing format for structured analytical and method development workflows.\nResearch use only.'
  }
];

async function main() {
  for (const item of updates) {
    await pool.query('UPDATE products SET description = $1 WHERE title = $2', [
      item.description,
      item.title
    ]);
  }

  const verify = await pool.query(
    `SELECT title, description
     FROM products
     WHERE title = ANY($1::text[])
     ORDER BY title`,
    [updates.map((u) => u.title)]
  );

  console.log(JSON.stringify(verify.rows, null, 2));
  await pool.end();
}

main().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
