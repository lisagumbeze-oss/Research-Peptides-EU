/**
 * Sync ZYBIO Price.pdf catalogue into Supabase products.
 *
 *   npx tsx scripts/sync-zybio-catalog.ts --phase 1          # dry-run
 *   npx tsx scripts/sync-zybio-catalog.ts --phase 1 --apply
 *   npx tsx scripts/sync-zybio-catalog.ts --phase 2 --apply
 *   npx tsx scripts/sync-zybio-catalog.ts --phase 3 --apply
 *   npx tsx scripts/sync-zybio-catalog.ts --phase all --apply
 *
 * Optional: --usd-rate 0.92
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  ZYBIO_MARKER,
  ZYBIO_SKU_ALIASES,
  resolveZybioImage,
  zybioCatalog,
  type ZybioFamily,
  type ZybioSku,
} from '../server/data/zybioCatalog.ts';
import {
  fetchResearchPeptideShopProducts,
  resolveResearchPeptideImage,
  type ShopRefProduct,
} from '../server/src/lib/researchPeptideShopImages.ts';

const ARGS = process.argv.slice(2);
const APPLY = ARGS.includes('--apply');
const phaseArg = (() => {
  const i = ARGS.indexOf('--phase');
  return i >= 0 ? ARGS[i + 1] : 'all';
})();
const USD_RATE_CLI = (() => {
  const i = ARGS.indexOf('--usd-rate');
  return i >= 0 ? Number(ARGS[i + 1]) : NaN;
})();

type ProductRow = {
  id?: string;
  slug: string;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  inventory?: number;
  images?: string[] | null;
  categories?: string[] | null;
  specifications?: string[] | null;
  rating?: number;
  review_count?: number;
  variants?: VariantJson[] | null;
};

type VariantJson = {
  variation_id: number;
  display_name: string;
  display_price: number;
  display_regular_price: number;
  attributes: {
    attribute_pa_peptides: string;
    catalog_sku: string;
  };
};

type ChangeLog = {
  phase: number;
  action: string;
  slug: string;
  detail: string;
};

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

function skuHash(sku: string): number {
  let h = 0;
  for (let i = 0; i < sku.length; i++) h = Math.imul(31, h) + sku.charCodeAt(i)!;
  return Math.abs(h) | 0;
}

function normSku(s: string): string {
  return s.trim();
}

function skuKey(s: string): string {
  return s.trim().toUpperCase();
}

async function resolveUsdToEurRate(): Promise<number> {
  if (Number.isFinite(USD_RATE_CLI) && USD_RATE_CLI > 0.5 && USD_RATE_CLI < 1.5) {
    return USD_RATE_CLI;
  }
  const envManual = Number(process.env.USD_TO_EUR_RATE);
  if (Number.isFinite(envManual) && envManual > 0.5 && envManual < 1.5) {
    return envManual;
  }
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=EUR');
    if (res.ok) {
      const data = (await res.json()) as { rates?: { EUR?: number } };
      const rate = data.rates?.EUR;
      if (rate && rate > 0.5 && rate < 1.5) return rate;
    }
  } catch {
    /* fallback */
  }
  return 0.92;
}

function buildVariant(title: string, row: ZybioSku, priceEur: number): VariantJson {
  const label = `${row.sku} · ${row.specLabel}`;
  return {
    variation_id: skuHash(row.sku),
    display_name: `${title} — ${label}`,
    display_price: priceEur,
    display_regular_price: priceEur,
    attributes: {
      attribute_pa_peptides: label,
      catalog_sku: row.sku,
    },
  };
}

function getSku(v: VariantJson): string {
  return normSku(v.attributes?.catalog_sku || '');
}

function extractDosageKey(label: string): string {
  const m = label.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|iu|ml)/i);
  if (!m) return label.toLowerCase().replace(/[^a-z0-9]+/g, '');
  return `${m[1]}${m[2].toLowerCase()}`;
}

function priceFromExistingOrUsd(
  existing: VariantJson[],
  zybioSku: ZybioSku,
  usdRate: number,
  aliasReverse?: Record<string, string>,
): number {
  const want = skuKey(zybioSku.sku);
  const direct = existing.find((v) => skuKey(getSku(v)) === want);
  if (direct?.display_price != null) return Number(direct.display_price);

  // Match by previous alias SKU
  if (aliasReverse) {
    for (const [oldSku, newSku] of Object.entries(aliasReverse)) {
      if (skuKey(newSku) === want) {
        const hit = existing.find((v) => skuKey(getSku(v)) === skuKey(oldSku));
        if (hit?.display_price != null) return Number(hit.display_price);
      }
    }
  }

  // Match by dosage in label
  const wantDose = extractDosageKey(zybioSku.specLabel);
  const byDose = existing.find((v) => {
    const label = v.attributes?.attribute_pa_peptides || v.display_name || '';
    return extractDosageKey(label) === wantDose;
  });
  if (byDose?.display_price != null) return Number(byDose.display_price);

  return roundMoney(zybioSku.priceUsd * usdRate);
}

function mergeSpecs(existing: string[] | null | undefined, family: ZybioFamily): string[] {
  const base = (existing || []).filter((s) => s !== ZYBIO_MARKER && !s.startsWith('ZYBIO SKU:'));
  const skuLines = family.variants.map((r) => `ZYBIO SKU: ${r.sku} — ${r.specLabel}`);
  return [ZYBIO_MARKER, ...skuLines, ...base.filter((s) => !s.startsWith('ZYBIO SKU:'))];
}

function ensureScratchDir() {
  const dir = path.join(process.cwd(), 'scratch');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function loadAllProducts(supabase: SupabaseClient): Promise<Map<string, ProductRow>> {
  const map = new Map<string, ProductRow>();
  let from = 0;
  const page = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('products')
      .select(
        'id,slug,title,description,price,currency,inventory,images,categories,specifications,rating,review_count,variants',
      )
      .range(from, from + page - 1);
    if (error) throw new Error(error.message);
    if (!data?.length) break;
    for (const row of data as ProductRow[]) map.set(row.slug, row);
    if (data.length < page) break;
    from += page;
  }
  return map;
}

async function updateProduct(
  supabase: SupabaseClient,
  slug: string,
  patch: Partial<ProductRow>,
  apply: boolean,
): Promise<void> {
  if (!apply) return;
  const { error } = await supabase.from('products').update(patch).eq('slug', slug);
  if (error) throw new Error(`update ${slug}: ${error.message}`);
}

async function upsertProduct(
  supabase: SupabaseClient,
  row: ProductRow,
  apply: boolean,
): Promise<void> {
  if (!apply) return;
  const { error } = await supabase.from('products').upsert(row, { onConflict: 'slug' });
  if (error) throw new Error(`upsert ${row.slug}: ${error.message}`);
}

/** Phase 1: Adamax — strip AD5, set AX10 only */
function fixAdamax(
  row: ProductRow,
  family: ZybioFamily,
  usdRate: number,
): { variants: VariantJson[]; price: number; note: string } {
  const existing = (row.variants || []) as VariantJson[];
  const kept = existing.filter((v) => skuKey(getSku(v)) !== 'AD5');
  const variants = family.variants.map((sku) =>
    buildVariant(row.title, sku, priceFromExistingOrUsd(kept, sku, usdRate)),
  );
  return {
    variants,
    price: Math.min(...variants.map((v) => v.display_price)),
    note: `removed AD5; set ${variants.map((v) => getSku(v)).join(',')}`,
  };
}

/** Phase 1: PNC-27 — only P27 (strip PN5/PN10 that belong to Pinealon) */
function fixPnc27(
  row: ProductRow,
  family: ZybioFamily,
  usdRate: number,
): { variants: VariantJson[]; price: number; note: string } {
  const existing = (row.variants || []) as VariantJson[];
  // Drop pinealon SKUs if present; keep unrelated
  const cleaned = existing.filter((v) => {
    const s = skuKey(getSku(v));
    return s !== 'PN5' && s !== 'PN10' && s !== 'PIN5' && s !== 'PIN10';
  });
  const variants = family.variants.map((sku) =>
    buildVariant(row.title, sku, priceFromExistingOrUsd(cleaned, sku, usdRate)),
  );
  return {
    variants,
    price: Math.min(...variants.map((v) => v.display_price)),
    note: `set P27; stripped PN*/PIN* pinealon SKUs`,
  };
}

/** Phase 1: Pinealon — PN5/PN10, preserve PIN* prices by dosage */
function fixPinealon(
  row: ProductRow,
  family: ZybioFamily,
  usdRate: number,
): { variants: VariantJson[]; price: number; note: string } {
  const existing = (row.variants || []) as VariantJson[];
  const alias = { PIN5: 'PN5', PIN10: 'PN10' };
  // Prefer prices currently on pnc-27 if they incorrectly hold PN5/PN10 — caller may pass merged existing
  const variants = family.variants.map((sku) =>
    buildVariant(row.title, sku, priceFromExistingOrUsd(existing, sku, usdRate, alias)),
  );
  // Keep PIN20 if present (not in ZYBIO list but user may want it)
  for (const v of existing) {
    const s = skuKey(getSku(v));
    if (s === 'PIN20' && !variants.some((x) => skuKey(getSku(x)) === 'PIN20')) {
      variants.push(v);
    }
  }
  return {
    variants,
    price: Math.min(...variants.map((v) => v.display_price)),
    note: `aligned to PN5/PN10; kept extra non-ZYBIO variants if any`,
  };
}

/** Generic: remap alias SKUs + ensure all family variants present */
function alignFamilyVariants(
  row: ProductRow,
  family: ZybioFamily,
  usdRate: number,
  aliasMap?: Record<string, string>,
): { variants: VariantJson[]; price: number; note: string } {
  const existing = [...((row.variants || []) as VariantJson[])];

  // Remap aliases in place
  if (aliasMap) {
    for (const v of existing) {
      const s = getSku(v);
      const mapped = aliasMap[s] || aliasMap[skuKey(s)];
      if (mapped && mapped !== s) {
        const label = `${mapped} · ${(v.attributes.attribute_pa_peptides || '').replace(/^[^·]+·\s*/, '') || family.variants.find((z) => z.sku === mapped)?.specLabel || ''}`;
        v.attributes.catalog_sku = mapped;
        v.attributes.attribute_pa_peptides = label.includes('·')
          ? `${mapped} · ${label.split('·').slice(1).join('·').trim() || family.variants.find((z) => z.sku === mapped)?.specLabel || ''}`
          : `${mapped} · ${family.variants.find((z) => z.sku === mapped)?.specLabel || label}`;
        v.display_name = `${row.title} — ${v.attributes.attribute_pa_peptides}`;
        v.variation_id = skuHash(mapped);
      }
    }
  }

  const bySku = new Map<string, VariantJson>();
  for (const v of existing) {
    const s = getSku(v);
    if (s) bySku.set(skuKey(s), v);
  }

  const reverseAlias: Record<string, string> = {};
  if (aliasMap) {
    for (const [oldS, newS] of Object.entries(aliasMap)) reverseAlias[oldS] = newS;
  }

  const merged: VariantJson[] = [];
  const seen = new Set<string>();

  for (const sku of family.variants) {
    const key = skuKey(sku.sku);
    const existingVar = bySku.get(key);
    if (existingVar) {
      // Refresh label to ZYBIO spec
      const rebuilt = buildVariant(
        row.title,
        sku,
        Number(existingVar.display_price),
      );
      merged.push(rebuilt);
      seen.add(key);
    } else {
      merged.push(
        buildVariant(row.title, sku, priceFromExistingOrUsd(existing, sku, usdRate, reverseAlias)),
      );
      seen.add(key);
    }
  }

  // Keep non-ZYBIO extra variants (e.g. TR45 on tirzepatide, BA* on bac water)
  for (const [key, v] of bySku) {
    if (!seen.has(key) && !family.variants.some((z) => skuKey(z.sku) === key)) {
      // Skip known wrong SKUs that belong elsewhere
      if (family.slug === 'adamax' && key === 'AD5') continue;
      if (family.slug === 'pnc-27' && (key === 'PN5' || key === 'PN10')) continue;
      merged.push(v);
    }
  }

  return {
    variants: merged,
    price: Math.min(...merged.map((v) => v.display_price)),
    note: `aligned ${merged.length} variants (${family.variants.length} ZYBIO)`,
  };
}

async function runPhase1(
  supabase: SupabaseClient,
  products: Map<string, ProductRow>,
  usdRate: number,
  apply: boolean,
  log: ChangeLog[],
): Promise<void> {
  console.log('\n=== PHASE 1: Data integrity fixes ===');

  // Steal PN5/PN10 prices from pnc-27 for pinealon if needed
  const pnc = products.get('pnc-27');
  const pine = products.get('pinealon');
  if (pnc && pine) {
    const pncVars = (pnc.variants || []) as VariantJson[];
    const pineVars = [...((pine.variants || []) as VariantJson[])];
    for (const v of pncVars) {
      const s = skuKey(getSku(v));
      if (s === 'PN5' || s === 'PN10') {
        if (!pineVars.some((x) => skuKey(getSku(x)) === s)) pineVars.push(v);
      }
    }
    pine.variants = pineVars;
  }

  const fixSlugs = ['adamax', 'aod9604', 'adipotide', 'pnc-27', 'pinealon', 'thymalin'] as const;

  for (const slug of fixSlugs) {
    const family = zybioCatalog.find((f) => f.slug === slug);
    const row = products.get(slug);
    if (!family) {
      console.log(`SKIP ${slug}: no catalog family`);
      continue;
    }
    if (!row) {
      console.log(`SKIP ${slug}: product not in DB`);
      log.push({ phase: 1, action: 'missing', slug, detail: 'product not found' });
      continue;
    }

    let result: { variants: VariantJson[]; price: number; note: string };
    if (slug === 'adamax') result = fixAdamax(row, family, usdRate);
    else if (slug === 'pnc-27') result = fixPnc27(row, family, usdRate);
    else if (slug === 'pinealon') result = fixPinealon(row, family, usdRate);
    else {
      const alias = ZYBIO_SKU_ALIASES[slug]?.map;
      result = alignFamilyVariants(row, family, usdRate, alias);
    }

    const before = ((row.variants || []) as VariantJson[]).map((v) => `${getSku(v)}@€${v.display_price}`);
    const after = result.variants.map((v) => `${getSku(v)}@€${v.display_price}`);
    console.log(`\n${slug}`);
    console.log(`  before: ${before.join(', ') || '(none)'}`);
    console.log(`  after:  ${after.join(', ')}`);
    console.log(`  ${result.note}`);

    log.push({
      phase: 1,
      action: apply ? 'updated' : 'would-update',
      slug,
      detail: result.note,
    });

    const patch: Partial<ProductRow> = {
      variants: result.variants,
      price: result.price,
      currency: 'EUR',
      specifications: mergeSpecs(row.specifications, family),
    };
    await updateProduct(supabase, slug, patch, apply);
    products.set(slug, { ...row, ...patch });
  }

  // Alias-only normalizations for other existing products
  for (const [key, cfg] of Object.entries(ZYBIO_SKU_ALIASES)) {
    if (fixSlugs.includes(cfg.slug as (typeof fixSlugs)[number])) continue;
    const family = zybioCatalog.find((f) => f.slug === cfg.slug);
    const row = products.get(cfg.slug);
    if (!family || !row) continue;

    const result = alignFamilyVariants(row, family, usdRate, cfg.map);
    const changed = JSON.stringify(row.variants) !== JSON.stringify(result.variants);
    if (!changed) continue;

    console.log(`\n${cfg.slug} (alias normalize)`);
    console.log(`  ${result.note}`);
    log.push({
      phase: 1,
      action: apply ? 'alias-normalized' : 'would-alias-normalize',
      slug: cfg.slug,
      detail: result.note,
    });
    const patch: Partial<ProductRow> = {
      variants: result.variants,
      price: result.price,
      currency: 'EUR',
      specifications: mergeSpecs(row.specifications, family),
    };
    await updateProduct(supabase, cfg.slug, patch, apply);
    products.set(cfg.slug, { ...row, ...patch });
  }
}

async function runPhase2(
  supabase: SupabaseClient,
  products: Map<string, ProductRow>,
  usdRate: number,
  shopProducts: ShopRefProduct[],
  apply: boolean,
  log: ChangeLog[],
): Promise<void> {
  console.log('\n=== PHASE 2: New products ===');
  const creates = zybioCatalog.filter((f) => f.syncMode === 'create');

  for (const family of creates) {
    const existing = products.get(family.slug);
    if (existing) {
      // Already exists — treat as merge instead
      const result = alignFamilyVariants(existing, family, usdRate, ZYBIO_SKU_ALIASES[family.slug]?.map);
      console.log(`\n${family.slug}: exists — merging variants (${result.note})`);
      log.push({
        phase: 2,
        action: apply ? 'merged-existing' : 'would-merge-existing',
        slug: family.slug,
        detail: result.note,
      });
      const patch: Partial<ProductRow> = {
        variants: result.variants,
        price: result.price,
        currency: 'EUR',
        specifications: mergeSpecs(existing.specifications, family),
      };
      await updateProduct(supabase, family.slug, patch, apply);
      products.set(family.slug, { ...existing, ...patch });
      continue;
    }

    const variants = family.variants.map((sku) =>
      buildVariant(family.title, sku, roundMoney(sku.priceUsd * usdRate)),
    );
    const price = Math.min(...variants.map((v) => v.display_price));
    const fallback = resolveZybioImage(family.imagePhotoId);
    const image =
      shopProducts.length > 0
        ? resolveResearchPeptideImage(family.slug, family.imageHint || family.title, shopProducts, fallback)
        : fallback;

    const row: ProductRow = {
      title: family.title,
      slug: family.slug,
      description: family.description,
      price,
      currency: 'EUR',
      inventory: 500,
      images: [image],
      categories: [...family.categories],
      specifications: mergeSpecs([], family),
      rating: 4.8,
      review_count: Math.floor(Math.random() * 30) + 8,
      variants,
    };

    console.log(`\nCREATE ${family.slug}`);
    console.log(`  title=${family.title} price=€${price}`);
    console.log(`  variants=${variants.map((v) => `${getSku(v)}@€${v.display_price}`).join(', ')}`);
    console.log(`  image=${image.slice(0, 80)}...`);

    log.push({
      phase: 2,
      action: apply ? 'created' : 'would-create',
      slug: family.slug,
      detail: `${variants.length} variants, €${price}`,
    });

    await upsertProduct(supabase, row, apply);
    products.set(family.slug, row);
  }
}

async function runPhase3(
  supabase: SupabaseClient,
  products: Map<string, ProductRow>,
  usdRate: number,
  apply: boolean,
  log: ChangeLog[],
): Promise<void> {
  console.log('\n=== PHASE 3: Missing dosages / variants ===');
  const targets = zybioCatalog.filter((f) => f.syncMode === 'merge' || f.syncMode === 'fix');

  for (const family of targets) {
    const row = products.get(family.slug);
    if (!row) {
      console.log(`SKIP ${family.slug}: not in DB (create in phase 2 if needed)`);
      log.push({ phase: 3, action: 'missing-product', slug: family.slug, detail: 'not found' });
      continue;
    }

    const alias = ZYBIO_SKU_ALIASES[family.slug]?.map;
    const beforeSkus = new Set(
      ((row.variants || []) as VariantJson[]).map((v) => skuKey(getSku(v))).filter(Boolean),
    );
    const result = alignFamilyVariants(row, family, usdRate, alias);
    const added = family.variants
      .filter((z) => !beforeSkus.has(skuKey(z.sku)))
      .map((z) => z.sku);

    if (added.length === 0 && JSON.stringify(row.variants) === JSON.stringify(result.variants)) {
      console.log(`OK ${family.slug}: already complete`);
      continue;
    }

    console.log(`\n${family.slug}`);
    if (added.length) console.log(`  + added: ${added.join(', ')}`);
    console.log(`  variants: ${result.variants.map((v) => `${getSku(v)}@€${v.display_price}`).join(', ')}`);

    log.push({
      phase: 3,
      action: apply ? 'merged' : 'would-merge',
      slug: family.slug,
      detail: added.length ? `added ${added.join(',')}` : result.note,
    });

    const patch: Partial<ProductRow> = {
      variants: result.variants,
      price: result.price,
      currency: 'EUR',
      specifications: mergeSpecs(row.specifications, family),
    };
    await updateProduct(supabase, family.slug, patch, apply);
    products.set(family.slug, { ...row, ...patch });
  }
}

async function main() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials');

  const phase = phaseArg === 'all' ? 'all' : Number(phaseArg);
  if (phase !== 'all' && ![1, 2, 3].includes(phase as number)) {
    throw new Error('Usage: --phase 1|2|3|all [--apply] [--usd-rate 0.92]');
  }

  const usdRate = await resolveUsdToEurRate();
  console.log(`USD→EUR rate: ${usdRate}`);
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'} | phase=${phase}`);

  const supabase = createClient(url, key);
  const products = await loadAllProducts(supabase);
  console.log(`Loaded ${products.size} products from Supabase`);

  let shopProducts: ShopRefProduct[] = [];
  if (phase === 'all' || phase === 2) {
    try {
      shopProducts = await fetchResearchPeptideShopProducts();
      console.log(`Loaded ${shopProducts.length} UK shop images for reference`);
    } catch (e) {
      console.warn('UK shop images unavailable; using Unsplash fallbacks', e);
    }
  }

  const log: ChangeLog[] = [];

  if (phase === 'all' || phase === 1) await runPhase1(supabase, products, usdRate, APPLY, log);
  if (phase === 'all' || phase === 2)
    await runPhase2(supabase, products, usdRate, shopProducts, APPLY, log);
  if (phase === 'all' || phase === 3) await runPhase3(supabase, products, usdRate, APPLY, log);

  const report = {
    at: new Date().toISOString(),
    phase,
    apply: APPLY,
    usdRate,
    changes: log,
  };
  const dir = ensureScratchDir();
  const out = path.join(dir, 'zybio-sync-report.json');
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(`\nWrote ${out} (${log.length} change entries)`);
  if (!APPLY) console.log('\nDry-run only. Pass --apply to write changes.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
