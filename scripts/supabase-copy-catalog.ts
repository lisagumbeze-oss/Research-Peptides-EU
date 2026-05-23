/**
 * Copy categories + products from a legacy Supabase project into the EU project.
 *
 * Setup in `.env`:
 *   SOURCE_SUPABASE_URL          — old UK / previous project URL
 *   SOURCE_SUPABASE_SERVICE_ROLE_KEY
 *   SUPABASE_URL                 — new EU project (destination)
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage (from project root):
 *   npx tsx scripts/supabase-copy-catalog.ts --dry-run
 *   npx tsx scripts/supabase-copy-catalog.ts --apply
 *   npx tsx scripts/supabase-copy-catalog.ts --apply --wipe   # clears dest catalog first
 *   npx tsx scripts/supabase-copy-catalog.ts --apply --no-convert  # copy prices as-is
 */
import 'dotenv/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { convertGbpToEur, DEFAULT_CURRENCY } from '../src/lib/currency.ts';

const PAGE_SIZE = 200;

function client(url: string | undefined, key: string | undefined, label: string) {
  if (!url || !key) {
    throw new Error(`Missing ${label}: set URL and service role key in .env`);
  }
  return createClient(url, key);
}

function sourceClient() {
  return client(
    process.env.SOURCE_SUPABASE_URL,
    process.env.SOURCE_SUPABASE_SERVICE_ROLE_KEY,
    'SOURCE_SUPABASE_URL + SOURCE_SUPABASE_SERVICE_ROLE_KEY',
  );
}

function destClient() {
  return client(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    'SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (destination)',
  );
}

async function fetchAll<T>(
  supabase: SupabaseClient,
  table: 'categories' | 'products',
  select: string,
): Promise<T[]> {
  const rows: T[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    if (!data?.length) break;
    rows.push(...(data as T[]));
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return rows;
}

type LegacyCategory = {
  name: string;
  slug: string;
  description?: string | null;
};

type LegacyProduct = {
  title: string;
  slug?: string | null;
  description?: string | null;
  price: number;
  compare_at_price?: number | null;
  currency?: string | null;
  inventory?: number | null;
  images?: string[] | null;
  categories?: string[] | null;
  specifications?: string[] | null;
  rating?: number | null;
  review_count?: number | null;
  variants?: unknown;
};

function emptyArray(value: string[] | null | undefined): string[] {
  return Array.isArray(value) ? value : [];
}

function mapProduct(row: LegacyProduct, convertGbp: boolean) {
  const currency = String(row.currency || 'GBP').toUpperCase();
  const needsConvert = convertGbp && (currency === 'GBP' || !row.currency);

  const price = needsConvert ? convertGbpToEur(Number(row.price) || 0) : Number(row.price) || 0;
  const compareRaw = row.compare_at_price;
  const compare_at_price =
    compareRaw != null && Number(compareRaw) > 0
      ? needsConvert
        ? convertGbpToEur(Number(compareRaw))
        : Number(compareRaw)
      : null;

  if (!row.slug?.trim()) {
    throw new Error(`Product "${row.title}" has no slug — add slugs in source DB or run 005_products_slug.sql there first.`);
  }

  return {
    title: row.title,
    slug: row.slug.trim(),
    description: row.description ?? '',
    price,
    compare_at_price,
    currency: DEFAULT_CURRENCY,
    inventory: Number(row.inventory ?? 0),
    images: emptyArray(row.images),
    categories: emptyArray(row.categories),
    specifications: emptyArray(row.specifications),
    rating: row.rating ?? 0,
    review_count: row.review_count ?? 0,
    variants: row.variants ?? null,
  };
}

async function main() {
  const apply = process.argv.includes('--apply');
  const wipe = process.argv.includes('--wipe');
  const convertGbp = !process.argv.includes('--no-convert');
  const dryRun = !apply;

  const source = sourceClient();
  const dest = destClient();

  if (dryRun) {
    console.log('DRY RUN — pass --apply to write to the destination project.');
  }

  console.log('Reading categories from source…');
  const categories = await fetchAll<LegacyCategory>(
    source,
    'categories',
    'name, slug, description',
  );
  console.log(`  ${categories.length} categories`);

  console.log('Reading products from source…');
  const products = await fetchAll<LegacyProduct>(
    source,
    'products',
    'title, slug, description, price, compare_at_price, currency, inventory, images, categories, specifications, rating, review_count, variants',
  );
  console.log(`  ${products.length} products`);

  if (products.some((p) => !p.slug?.trim())) {
    const missing = products.filter((p) => !p.slug?.trim()).map((p) => p.title);
    throw new Error(
      `These products lack slugs (${missing.length}): ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '…' : ''}`,
    );
  }

  const productRows = products.map((p) => mapProduct(p, convertGbp));

  if (dryRun) {
    const sample = productRows[0];
    if (sample) {
      console.log('\nSample mapped product:', {
        title: sample.title,
        slug: sample.slug,
        price: sample.price,
        currency: sample.currency,
      });
    }
    console.log('\nDry run complete. No changes written.');
    return;
  }

  if (wipe) {
    console.log('Wiping destination products and categories…');
    await dest.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await dest.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  }

  if (categories.length) {
    console.log(`Upserting ${categories.length} categories…`);
    const { error } = await dest.from('categories').upsert(categories, { onConflict: 'slug' });
    if (error) throw error;
  }

  console.log(`Upserting ${productRows.length} products (onConflict: slug)…`);
  const batchSize = 50;
  for (let i = 0; i < productRows.length; i += batchSize) {
    const batch = productRows.slice(i, i + batchSize);
    const { error } = await dest.from('products').upsert(batch, { onConflict: 'slug' });
    if (error) throw error;
    console.log(`  ${Math.min(i + batchSize, productRows.length)} / ${productRows.length}`);
  }

  console.log('Done. Run npm run sitemap:generate to refresh sitemap.xml.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
