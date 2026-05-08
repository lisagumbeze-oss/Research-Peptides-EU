/**
 * Remove duplicate products while preserving PDF-imported products.
 *
 * Rule:
 * - If a normalized title has at least one PDF-marked row and one non-PDF row,
 *   delete only the non-PDF rows.
 * - Keep all non-duplicates.
 *
 * Usage:
 *   npx tsx server/scripts/dedupe-products-keep-pdf.ts --dry-run
 *   npx tsx server/scripts/dedupe-products-keep-pdf.ts --apply
 */

import { pool } from '../src/db.js';

const PDF_MARKER = 'Source: peptide-powder-price-list (PDF)';
const ARGS = process.argv.slice(2);
const APPLY = ARGS.includes('--apply');

type ProductRow = {
  id: string;
  title: string;
  specifications: string[] | null;
  created_at: string | null;
};

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\(powder list(?:[^)]*)\)/g, '')
    .replace(/\s*·\s*\d+\)\s*$/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isPdfImported(row: ProductRow): boolean {
  return Array.isArray(row.specifications) && row.specifications.includes(PDF_MARKER);
}

async function main() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query<ProductRow>(
      `SELECT id, title, specifications, created_at
       FROM products`
    );

    const groups = new Map<string, ProductRow[]>();
    for (const row of rows) {
      const key = normalizeTitle(row.title);
      const bucket = groups.get(key) ?? [];
      bucket.push(row);
      groups.set(key, bucket);
    }

    const deleteIds: string[] = [];
    let duplicateGroups = 0;

    for (const [, group] of groups) {
      if (group.length < 2) continue;
      const pdfRows = group.filter(isPdfImported);
      const nonPdfRows = group.filter((r) => !isPdfImported(r));
      if (pdfRows.length === 0 || nonPdfRows.length === 0) continue;
      duplicateGroups += 1;
      deleteIds.push(...nonPdfRows.map((r) => r.id));
    }

    console.log(`Total products scanned: ${rows.length}`);
    console.log(`Duplicate groups with PDF winners: ${duplicateGroups}`);
    console.log(`Non-PDF duplicates to delete: ${deleteIds.length}`);

    if (!APPLY) {
      console.log('Dry run only. Re-run with --apply to execute deletions.');
      return;
    }

    if (deleteIds.length === 0) {
      console.log('Nothing to delete.');
      return;
    }

    await client.query('BEGIN');
    const { rowCount } = await client.query(
      `DELETE FROM products WHERE id = ANY($1::uuid[])`,
      [deleteIds]
    );
    await client.query('COMMIT');

    console.log(`Deleted non-PDF duplicate rows: ${rowCount ?? 0}`);
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // ignore rollback errors
    }
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
