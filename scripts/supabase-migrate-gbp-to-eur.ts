/**
 * One-time GBP → EUR conversion for existing Supabase product rows.
 *
 * Usage:
 *   npx tsx scripts/supabase-migrate-gbp-to-eur.ts --dry-run
 *   npx tsx scripts/supabase-migrate-gbp-to-eur.ts --apply
 *
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 * Also run server/migrations/006_currency_eur.sql in Supabase first.
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { GBP_TO_EUR_RATE, convertGbpToEur, DEFAULT_CURRENCY } from '../src/lib/currency.ts';

function supabaseFromEnv() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, key);
}

async function main() {
  const apply = process.argv.includes('--apply');
  const dryRun = !apply;

  if (dryRun) {
    console.log(`DRY RUN — pass --apply to write changes (rate ${GBP_TO_EUR_RATE})`);
  }

  const supabase = supabaseFromEnv();
  const { data: products, error } = await supabase
    .from('products')
    .select('id, title, price, compare_at_price, currency');

  if (error) throw error;
  if (!products?.length) {
    console.log('No products found.');
    return;
  }

  const toConvert = products.filter((p) => {
    const c = String(p.currency || DEFAULT_CURRENCY).toUpperCase();
    return c === 'GBP' || !p.currency;
  });

  console.log(`Found ${products.length} products; ${toConvert.length} marked for GBP→EUR conversion.`);

  for (const p of toConvert) {
    const newPrice = convertGbpToEur(Number(p.price) || 0);
    const compare = p.compare_at_price != null ? convertGbpToEur(Number(p.compare_at_price)) : null;
    console.log(`  ${p.title}: ${p.price} GBP → ${newPrice} EUR`);
    if (!dryRun) {
      const { error: upErr } = await supabase
        .from('products')
        .update({
          price: newPrice,
          compare_at_price: compare,
          currency: DEFAULT_CURRENCY,
        })
        .eq('id', p.id);
      if (upErr) throw upErr;
    }
  }

  if (!dryRun) {
    await supabase.from('orders').update({ currency: DEFAULT_CURRENCY }).is('currency', null);
    await supabase.from('orders').update({ currency: DEFAULT_CURRENCY }).eq('currency', 'GBP');
    console.log('Orders currency set to EUR where missing or GBP.');
  }

  console.log(dryRun ? 'Dry run complete.' : 'Migration applied.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
