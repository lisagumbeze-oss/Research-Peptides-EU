/**
 * Imports the Peptide Powder price-list catalog into `public.products`.
 *
 * Prerequisites:
 * - `DATABASE_URL` in `server/.env` pointing at Supabase Postgres (same as pg Pool in src/db.ts)
 * - `products` table with jsonb `variants`, text[] `categories`, text[] `images`, etc.
 *
 * Usage (from repo root):
 *   npx tsx server/scripts/import-peptide-powder-catalog.ts
 *
 * Pricing: PDF nominal amounts are treated as USD and converted to GBP (see `--usd-rate`).
 * Imagery: main product image matched from Research Peptide UK’s public Woo Store API when available
 * ( https://researchpeptide.co.uk/shop/ ), else falls back to the Unsplash reference in the catalog.
 *
 * Flags:
 *   --replace              DELETE existing rows whose specs contain the import marker, then insert.
 *   --suffix " (powder)"   Append to every title (avoids colliding with demo/seed products).
 *   --usd-rate 0.79        Fixed USD→GBP multiplier (overrides FX_API_KEY / cache lookup).
 *   --no-shop-images       Skip Research Peptide API mapping; keep Unsplash fallback images only.
 *   --dry-run              Print conversion/import summary without writing to DB.
 */

import { pool } from '../src/db.js';
import {
  peptidePowderCatalog,
  resolveCatalogImage,
  type PeptidePowderCatalogEntry,
  type PeptidePowderVariant,
} from '../data/peptidePowderImportCatalog.js';
import { CurrencyService } from '../src/services/currency.js';
import {
  fetchResearchPeptideShopProducts,
  resolveResearchPeptideImage,
} from '../src/lib/researchPeptideShopImages.js';

const MARKER = 'Source: peptide-powder-price-list (PDF)';
const ARGS = process.argv.slice(2);
const REPLACE = ARGS.includes('--replace');
const NO_SHOP_IMAGES = ARGS.includes('--no-shop-images');
const DRY_RUN = ARGS.includes('--dry-run');
function argAfter(flag: string): string | undefined {
  const i = ARGS.indexOf(flag);
  if (i === -1) return undefined;
  return ARGS[i + 1];
}
const TITLE_SUFFIX_CLI = argAfter('--suffix'); // optional replacement for "(powder list)"
const USD_RATE_CLI = argAfter('--usd-rate');

const DEFAULT_COLLISION_SUFFIX = TITLE_SUFFIX_CLI ?? ' (powder list)';

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

async function resolveUsdToGbpRate(): Promise<number> {
  const manual = USD_RATE_CLI != null ? Number(USD_RATE_CLI) : NaN;
  if (Number.isFinite(manual) && manual > 0.3 && manual < 2.0) {
    return manual;
  }
  const envManual = Number(process.env.USD_TO_GBP_RATE);
  if (Number.isFinite(envManual) && envManual > 0.3 && envManual < 2.0) {
    return envManual;
  }
  try {
    const fx = new CurrencyService();
    const rate = await fx.getRate('USD', 'GBP');
    if (rate > 0.5 && rate < 1.35) return rate;
  } catch {
    /* use fallback */
  }
  return 0.79;
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Guaranteed-unique title (Supabase demo products often collide on the same peptide names). */
async function uniqueTitle(client: import('pg').PoolClient, base: string): Promise<string> {
  let candidate = base;
  for (let n = 0; n < 50; n++) {
    const { rows } = await client.query(`SELECT 1 FROM products WHERE title = $1 LIMIT 1`, [candidate]);
    if (rows.length === 0) return candidate;
    candidate =
      n === 0 ? `${base}${DEFAULT_COLLISION_SUFFIX}` : `${base}${DEFAULT_COLLISION_SUFFIX.replace(/\)\s*$/, '')} · ${n + 1})`;
  }
  throw new Error(`Could not uniquify title for: ${base}`);
}

function skuHash(sku: string): number {
  let h = 0;
  for (let i = 0; i < sku.length; i++) h = Math.imul(31, h) + sku.charCodeAt(i)!;
  return Math.abs(h) | 0;
}

function buildVariantJson(entry: PeptidePowderCatalogEntry, row: PeptidePowderVariant, priceGbp: number) {
  const label = `${row.sku} · ${row.specLabel}`;
  return {
    variation_id: skuHash(row.sku),
    display_name: `${entry.title} — ${label}`,
    display_price: priceGbp,
    display_regular_price: priceGbp,
    attributes: {
      attribute_pa_peptides: label,
      catalog_sku: row.sku,
    },
  };
}

async function main() {
  const usdGbpRate = await resolveUsdToGbpRate();
  console.log(`Using USD→GBP rate: ${usdGbpRate}`);

  let shopProducts: Awaited<ReturnType<typeof fetchResearchPeptideShopProducts>> = [];
  if (!NO_SHOP_IMAGES) {
    try {
      shopProducts = await fetchResearchPeptideShopProducts();
      console.log(`Loaded ${shopProducts.length} reference products from researchpeptide.co.uk store API.`);
    } catch (e) {
      console.warn('Could not load Research Peptide shop images; using catalog fallbacks only.', e);
    }
  } else {
    console.log('Skipping Research Peptide shop image mapping (--no-shop-images).');
  }

  const client = await pool.connect();
  try {
    if (DRY_RUN) {
      const totalVariants = peptidePowderCatalog.reduce((n, e) => n + e.variants.length, 0);
      const minUsd = Math.min(...peptidePowderCatalog.flatMap((e) => e.variants.map((v) => v.price)));
      const maxUsd = Math.max(...peptidePowderCatalog.flatMap((e) => e.variants.map((v) => v.price)));
      console.log(
        `Dry run: ${peptidePowderCatalog.length} products, ${totalVariants} price lines, USD range ${minUsd}-${maxUsd}, USD→GBP ${usdGbpRate}`
      );
      return;
    }

    await client.query('BEGIN');

    if (REPLACE) {
      await client.query(
        `DELETE FROM products WHERE EXISTS (
           SELECT 1 FROM unnest(specifications) s WHERE s = $1
         )`,
        [MARKER]
      );
    }

    let inserted = 0;
    let variantLines = 0;

    for (const entry of peptidePowderCatalog) {
      const storeTitle = await uniqueTitle(client, entry.title);
      const convertedVariants = entry.variants.map((row) => ({
        row,
        priceGbp: roundMoney(row.price * usdGbpRate),
      }));
      const basePrice = Math.min(...convertedVariants.map((v) => v.priceGbp));

      const fallbackImage = resolveCatalogImage(entry).replace(/^http:/, 'https:');
      const imageUrl =
        shopProducts.length > 0
          ? resolveResearchPeptideImage(entry.slug, entry.title, shopProducts, fallbackImage)
          : fallbackImage;

      const specifications = [
        MARKER,
        'Lyophilized powder catalog line (research use only).',
        `Wholesale list amounts were USD nominal; stored as GBP using rate ${usdGbpRate} (see import script / FX cache).`,
        ...entry.variants.map((r) => `${r.sku}: ${r.specLabel}`),
      ];

      const variantsJson = JSON.stringify(
        convertedVariants.map(({ row, priceGbp }) =>
          buildVariantJson({ ...entry, title: storeTitle }, row, priceGbp)
        )
      );

      await client.query(
        `INSERT INTO products (
          title,
          slug,
          description,
          price,
          inventory,
          images,
          categories,
          specifications,
          rating,
          review_count,
          variants
        ) VALUES ($1,$2,$3,$4,$5,$6::text[],$7::text[],$8::text[],$9,$10,$11::jsonb)`,
        [
          storeTitle,
          slugify(storeTitle),
          entry.description,
          basePrice,
          500,
          [imageUrl],
          entry.categories,
          specifications,
          4.8,
          Math.floor(Math.random() * 40) + 5,
          variantsJson,
        ]
      );

      inserted += 1;
      variantLines += entry.variants.length;
    }

    await client.query('COMMIT');
    console.log(`Imported ${inserted} products (${variantLines} catalog SKUs / price lines total).`);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
