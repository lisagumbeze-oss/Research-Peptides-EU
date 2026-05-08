import { pool } from '../src/db.js';

const ARGS = process.argv.slice(2);
const APPLY = ARGS.includes('--apply');

type ProductRow = {
  id: string;
  title: string;
  slug: string | null;
};

function slugify(input: string): string {
  const cleaned = input
    .replace(/\s*\(powder list[^)]*\)/gi, '')
    .trim();

  return cleaned
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 80) || 'product';
}

function uniqueSlug(base: string, used: Set<string>): string {
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  for (let i = 2; i < 10000; i += 1) {
    const candidate = `${base}-${i}`;
    if (!used.has(candidate)) {
      used.add(candidate);
      return candidate;
    }
  }
  throw new Error(`Unable to allocate unique slug for ${base}`);
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug TEXT`);

    const { rows } = await client.query<ProductRow>(
      `SELECT id, title, slug
       FROM public.products
       ORDER BY created_at NULLS FIRST, id`
    );

    const used = new Set<string>();
    const updates: Array<{ id: string; slug: string }> = [];

    for (const row of rows) {
      const next = uniqueSlug(slugify(row.title), used);
      if (row.slug !== next) updates.push({ id: row.id, slug: next });
    }

    console.log(`Products scanned: ${rows.length}`);
    console.log(`Slug updates needed: ${updates.length}`);

    if (!APPLY) {
      await client.query('ROLLBACK');
      console.log('Dry run only. Re-run with --apply to persist.');
      return;
    }

    for (const u of updates) {
      await client.query(`UPDATE public.products SET slug = $1 WHERE id = $2`, [u.slug, u.id]);
    }

    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique_idx ON public.products(slug)`);

    await client.query('COMMIT');
    console.log(`Updated slugs: ${updates.length}`);
  } catch (error) {
    await client.query('ROLLBACK');
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
