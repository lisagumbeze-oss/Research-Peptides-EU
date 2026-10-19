/**
 * Verify ZYBIO catalogue sync invariants.
 *
 *   npx tsx scripts/verify-zybio-sync.ts --phase 1
 *   npx tsx scripts/verify-zybio-sync.ts --phase 2
 *   npx tsx scripts/verify-zybio-sync.ts --phase 3
 *   npx tsx scripts/verify-zybio-sync.ts --phase all
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { zybioCatalog, type ZybioFamily } from '../server/data/zybioCatalog.ts';

const phaseArg = (() => {
  const i = process.argv.indexOf('--phase');
  return i >= 0 ? process.argv[i + 1] : 'all';
})();

type VariantJson = {
  attributes?: { catalog_sku?: string };
  display_price?: number;
};

function skuKey(s: string) {
  return s.trim().toUpperCase();
}

function getSkus(variants: VariantJson[] | null | undefined): Set<string> {
  const set = new Set<string>();
  for (const v of variants || []) {
    const s = v.attributes?.catalog_sku;
    if (s) set.add(skuKey(s));
  }
  return set;
}

async function main() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials');
  const supabase = createClient(url, key);

  const phase = phaseArg === 'all' ? 'all' : Number(phaseArg);
  const { data, error } = await supabase
    .from('products')
    .select('slug,title,price,currency,images,variants')
    .order('slug');
  if (error) throw new Error(error.message);

  const bySlug = new Map((data || []).map((p) => [p.slug as string, p]));
  let failures = 0;

  function fail(msg: string) {
    console.log('FAIL', msg);
    failures++;
  }
  function ok(msg: string) {
    console.log('OK  ', msg);
  }

  if (phase === 'all' || phase === 1) {
    console.log('\n--- Phase 1 invariants ---');
    const adamax = bySlug.get('adamax');
    if (!adamax) fail('adamax missing');
    else {
      const skus = getSkus(adamax.variants as VariantJson[]);
      if (skus.has('AD5')) fail('adamax still has AD5');
      else ok('adamax has no AD5');
      if (!skus.has('AX10')) fail('adamax missing AX10');
      else ok('adamax has AX10');
    }

    const aod = bySlug.get('aod9604');
    if (!aod) fail('aod9604 missing');
    else {
      const skus = getSkus(aod.variants as VariantJson[]);
      for (const s of ['AD2', 'AD5', 'AD10']) {
        if (!skus.has(s)) fail(`aod9604 missing ${s}`);
        else ok(`aod9604 has ${s}`);
      }
      if (skus.has('2AD') || skus.has('5AD') || skus.has('10AD')) fail('aod9604 still has old 2AD/5AD/10AD');
      else ok('aod9604 old aliases gone');
    }

    const adip = bySlug.get('adipotide');
    if (!adip) fail('adipotide missing');
    else {
      const skus = getSkus(adip.variants as VariantJson[]);
      for (const s of ['APE2', 'APE5', 'APE10']) {
        if (!skus.has(s)) fail(`adipotide missing ${s}`);
        else ok(`adipotide has ${s}`);
      }
    }

    const pnc = bySlug.get('pnc-27');
    if (!pnc) fail('pnc-27 missing');
    else {
      const skus = getSkus(pnc.variants as VariantJson[]);
      if (!skus.has('P27')) fail('pnc-27 missing P27');
      else ok('pnc-27 has P27');
      if (skus.has('PN5') || skus.has('PN10')) fail('pnc-27 still has pinealon PN5/PN10');
      else ok('pnc-27 has no PN5/PN10');
    }

    const pine = bySlug.get('pinealon');
    if (!pine) fail('pinealon missing');
    else {
      const skus = getSkus(pine.variants as VariantJson[]);
      if (!skus.has('PN5') || !skus.has('PN10')) fail('pinealon missing PN5/PN10');
      else ok('pinealon has PN5/PN10');
    }

    const thym = bySlug.get('thymalin');
    if (!thym) fail('thymalin missing');
    else {
      const skus = getSkus(thym.variants as VariantJson[]);
      if (!skus.has('TN10')) fail('thymalin missing TN10');
      else ok('thymalin has TN10');
    }
  }

  if (phase === 'all' || phase === 2) {
    console.log('\n--- Phase 2 new products ---');
    const creates = zybioCatalog.filter((f) => f.syncMode === 'create');
    for (const f of creates) {
      const row = bySlug.get(f.slug);
      if (!row) {
        fail(`missing product ${f.slug}`);
        continue;
      }
      const imgs = (row.images as string[]) || [];
      const skus = getSkus(row.variants as VariantJson[]);
      if (!imgs.length) fail(`${f.slug}: no images`);
      else if (![...f.variants].every((v) => skus.has(skuKey(v.sku)))) {
        fail(`${f.slug}: missing some ZYBIO skus`);
      } else if (Number(row.price) <= 0) fail(`${f.slug}: bad price`);
      else ok(`${f.slug} ok (€${row.price}, ${skus.size} skus)`);
    }
  }

  if (phase === 'all' || phase === 3) {
    console.log('\n--- Phase 3 SKU coverage ---');
    let covered = 0;
    let total = 0;
    const missing: string[] = [];
    for (const f of zybioCatalog as ZybioFamily[]) {
      const row = bySlug.get(f.slug);
      for (const v of f.variants) {
        total++;
        if (!row) {
          missing.push(`${f.slug}:${v.sku}`);
          continue;
        }
        const skus = getSkus(row.variants as VariantJson[]);
        if (skus.has(skuKey(v.sku))) covered++;
        else missing.push(`${f.slug}:${v.sku}`);
      }
    }
    console.log(`Coverage: ${covered}/${total}`);
    if (missing.length) {
      console.log('Missing SKUs:');
      for (const m of missing.slice(0, 40)) console.log(' ', m);
      if (missing.length > 40) console.log(`  ... +${missing.length - 40} more`);
      failures += missing.length;
    } else ok('all ZYBIO SKUs present on mapped products');
  }

  console.log(`\nVerify: ${failures === 0 ? 'PASS' : `FAIL (${failures})`}`);
  if (failures > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
