/**
 * Seeds categories + products into Supabase with EUR as canonical currency.
 *
 * Usage (from project root):
 *   npx tsx scripts/supabase-seed-catalog.ts
 *   npx tsx scripts/supabase-seed-catalog.ts --wipe
 *
 * Requires in .env (or environment):
 *   SUPABASE_URL (or VITE_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import {
  mapSeedProductToRow,
  referenceSeedCategories,
  referenceSeedProducts,
} from '../src/data/seedCatalog.ts';
import { DEFAULT_CURRENCY } from '../src/lib/currency.ts';

function supabaseFromEnv() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, key);
}

async function main() {
  const wipe = process.argv.includes('--wipe');
  const supabase = supabaseFromEnv();

  if (wipe) {
    console.log('Deleting existing products and categories…');
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  }

  console.log(`Seeding ${referenceSeedCategories.length} categories…`);
  const { error: catError } = await supabase.from('categories').upsert(referenceSeedCategories, {
    onConflict: 'slug',
  });
  if (catError) throw catError;

  const rows = referenceSeedProducts.map(mapSeedProductToRow);
  console.log(`Seeding ${rows.length} products (${DEFAULT_CURRENCY})…`);
  const { error: prodError } = await supabase.from('products').upsert(rows, { onConflict: 'slug' });
  if (prodError) throw prodError;

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
