/**
 * Sync product descriptions from researchpeptide.co.uk → our Supabase products.description
 * with light UK→EU rebrand tweaks.
 *
 * Usage:
 *   npx tsx scripts/sync-uk-product-descriptions.ts            # dry-run (default)
 *   npx tsx scripts/sync-uk-product-descriptions.ts --apply    # write to Supabase
 *   npx tsx scripts/sync-uk-product-descriptions.ts --map-only # write mapping only
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const UK_STORE = 'https://researchpeptide.co.uk/wp-json/wc/store/v1/products';
const UK_WP = 'https://researchpeptide.co.uk/wp-json/wp/v2/product';
const UA = 'ResearchPeptidesUKCatalogImport/1.0 (internal price-list tooling)';
const OUT_DIR = path.resolve('scratch');

/** Explicit UK slug → our EU slug. Gaps are omitted (status: gap). */
const UK_TO_EU: Record<string, string> = {
  '5-amino-1mq': '5-amino-1mq',
  'ace-031-1mg': 'ace-031-1mg',
  adipotide: 'adipotide',
  aicar: 'aicar',
  'aod-9604-5mg': 'aod-9604-5mg',
  'bacteriostatic-water-0-9-benzyl':
    'bacteriostatic-water-0-9-benzyl-alcohol-10ml-hospira-injection-usp',
  'bacteriostatic-water-0-9-sodium-chloride':
    'bacteriostatic-water-0-9-sodium-chloride-10ml-hospira-usp-injection',
  'bpc-10mg-tb-10mg-20mg': 'bpc-10mg-tb-10mg-20mg-peptide-blend',
  'bpc-157': 'bpc-157',
  'bpc-5mg-tb-5mg': 'bpc-5mg-tb-5mg',
  'cjc-1295-no-dac-5mg': 'cjc-1295-no-dac-5mg',
  'cjc-1295-no-dac-5mg-ipamorelin-5mg':
    'cjc-1295-no-dac-5mg-ipamorelin-5mg-10mg-total-peptide-blend',
  'cjc-1295-with-dac-2mg': 'cjc-1295-with-dac-2mg',
  'dsip-delta-sleep-inducing-peptide': 'dsip-delta-sleep-inducing-peptide',
  epithalon: 'epithalon',
  'follistatin-344-1mg': 'follistatin-344-1mg',
  'gagrilintide-5mg': 'gagrilintide-5mg',
  'gdf-8': 'gdf-8',
  'ghk-cu': 'ghk-cu',
  'ghrp-2-10mg': 'ghrp-2-10mg',
  'ghrp-2-pralmorelin-5mg': 'ghrp-2-pralmorelin-5mg',
  'ghrp-6-10mg': 'ghrp-6-10mg',
  'ghrp-6-5mg': 'ghrp-6-5mg',
  'glow-blend-ghk-cu-bpc157-tb500': 'glow-blend-ghk-cu-bpc157-tb500',
  'glutathione-peptide': 'glutathione-peptide',
  'gonadorelin-acetategnrh-2mg': 'gonadorelin-acetate-gnrh-2mg',
  'hcg-human-chorionic-gonadotropin': 'hcg-human-chorionic-gonadotropin-5000iu',
  'hexarelin-2mg': 'hexarelin-2mg',
  'hexarelin-acetate': 'hexarelin-acetate',
  'hgh-191aasomatropin': 'hgh-191aa-somatropin',
  'hgh-fragment-176-191-10mg': 'hgh-fragment-176-191-10mg',
  'hgh-fragment-176-191-5mg': 'hgh-fragment-176-191-5mg',
  'igf-1-1-3-1mg': 'igf-1-1-3-1mg',
  'igf-1-des-1mg': 'igf-1-des-1mg',
  'igf-1-lr3-1mg': 'igf-1-lr3-1mg',
  'ipamorelin-5mg-10mg': 'ipamorelin',
  kisspeptin: 'kisspeptin',
  'klow-blend-ghk-cu-bpc157-tb500-kpv': 'klow-blend-ghk-cu-bpc157-tb500-kpv',
  kpv: 'kpv',
  'l-carnitine-600mg': 'l-carnitine-600mg',
  'll-37': 'll-37',
  'melatonin-10mg': 'melatonin-10mg',
  'mk-677-ibutamoren-10mg-100-tablets': 'mk-677-ibutamoren-10mg-100-tablets',
  'mots-c-mitochondrial-derived-peptide': 'mots-c-mitochondrial-derived-peptide',
  'mt-1-melanotan-1-acetate-10mg': 'mt-1-melanotan-1-acetate-10mg',
  'mt-2-melanotan-2-acetate-10mg': 'mt-2-melanotan-2-acetate-10mg',
  'myostatin-1mg': 'myostatin-1mg',
  'nad-250mg': 'nad-250mg',
  'nad-500mg': 'nad-500mg',
  'oxytocin-acetate': 'oxytocin-acetate',
  'peg-mgf-2mg': 'peg-mgf-2mg',
  'pt-141-10mg': 'pt-141-10mg',
  reta: 'retatrutide-glp-3',
  'selank-5mg': 'selank-5mg',
  sema: 'semaglutide-glp-1',
  semax: 'semax',
  'sermorelin-acetate': 'sermorelin-acetate',
  'slu-pp-332': 'slu-pp-332',
  'ss-31': 'ss-31',
  tesamorelin: 'tesamorelin',
  'tesamorelin-5mg-ipamorelin-5mg':
    'tesamorelin-5mg-ipamorelin-5mg-10mg-total-peptide-blend',
  'tesofensine-500mcg-100-tablets': 'tesofensine-500mcg-100-tablets',
  'thymalin-10mg': 'thymalin-10mg',
  'thymosin-alpha-1': 'thymosin-alpha-1',
  'thymosin-beta-4-tb500-10mg': 'thymosin-beta-4-tb500-10mg',
  'thymosin-beta-4-tb500-5mg': 'thymosin-beta-4-tb500-5mg',
  tirzepatide: 'tirzepatide',
};

const GAP_SLUGS = new Set([
  'tesamorelin-13mg-ipamorelin-3mg-16mg-blend',
  'glp-3-pen-40mg',
]);

type UkProduct = {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  description?: string;
};

type MappingRow = {
  ukSlug: string;
  ukName: string;
  ukPermalink: string;
  status: 'matched' | 'gap';
  ourSlug: string | null;
  ourTitle: string | null;
};

function decodeWpEntities(raw: string): string {
  return raw
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

/** Convert Woo HTML description to plain text suitable for whitespace-pre-line UI. */
export function htmlToPlainText(html: string): string {
  let s = html;
  s = s.replace(/<script[\s\S]*?<\/script>/gi, '');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, '');
  s = s.replace(/<\/(h[1-6]|p|div|li|tr|blockquote)>/gi, '\n\n');
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<\/?(ul|ol)>/gi, '\n');
  s = s.replace(/<li[^>]*>/gi, '• ');
  s = s.replace(/<hr[^>]*>/gi, '\n---\n');
  s = s.replace(/<[^>]+>/g, '');
  s = decodeWpEntities(s);
  s = s.replace(/\u00a0/g, ' ');
  s = s.replace(/[ \t]+\n/g, '\n');
  s = s.replace(/\n{3,}/g, '\n\n');
  return s.trim();
}

/** Light UK → EU rebrand tweaks; keep scientific content. */
export function tweakForEu(plain: string): string {
  let s = plain;
  const reps: [RegExp, string][] = [
    [/Research\s*Peptides?\s*UK/gi, 'Research Peptides EU'],
    [/ResearchPeptide\.co\.uk/gi, 'ResearchPeptides.eu'],
    [/researchpeptide\.co\.uk/gi, 'researchpeptides.eu'],
    [/Trusted UK supplier/gi, 'Trusted EU supplier'],
    [/trusted UK supplier/gi, 'trusted EU supplier'],
    [/peptides for sale UK/gi, 'peptides for sale in the EU'],
    [/peptide to buy UK/gi, 'peptide to buy in the EU'],
    [/Research Grade Peptide UK/gi, 'Research Grade Peptide'],
    [/Buy research peptides UK/gi, 'Buy research peptides in the EU'],
    [/Buy\s+([^.\n]{0,80}?)\s+UK\b/gi, 'Buy $1 in the EU'],
    [/Purchase\s+([^.\n]{0,80}?)\s+UK\b/gi, 'Purchase $1 in the EU'],
    [/Get\s+([^.\n]{0,80}?)\s+UK\b/gi, 'Get $1 in the EU'],
    [/\bUK researchers\b/gi, 'EU researchers'],
    [/\bUK research\b/gi, 'EU research'],
    [/\bUK labs?\b/gi, 'EU labs'],
    [/\bUK supplier\b/gi, 'EU supplier'],
    [/\bUK dispatch\b/gi, 'EU dispatch'],
    [/\bUK catalog(?:ue)?s?\b/gi, 'EU catalogues'],
    [/\bfor research purposes in the UK\b/gi, 'for research purposes in the EU'],
    [/\bfrom the UK\b/gi, 'from the EU'],
    [/\bin the UK\b/gi, 'in the EU'],
    [/\bacross the UK\b/gi, 'across the EU'],
    [/\bUK-wide\b/gi, 'EU-wide'],
    [/\bUnited Kingdom\b/gi, 'European Union'],
    // Trailing / standalone geo tags after product names
    [/\bPeptide Uk\b/gi, 'Peptide'],
    [/\bPeptide UK\b/gi, 'Peptide'],
    [/ GLP-1 uk\b/gi, ' GLP-1'],
    [/ GLP-2 UK\b/gi, ' GLP-2'],
    [/ GLP-3 UK\b/gi, ' GLP-3'],
    [/£(\d)/g, '€$1'],
    [/\bGBP\b/g, 'EUR'],
    [/buy Uk peptides/gi, 'buy EU peptides'],
    [/\bin uk peptides\b/gi, 'in EU peptides'],
    [/via Uk peptides/gi, 'via EU peptides'],
    // Final catch-all for leftover " UK" / " Uk" / " uk" geo tags
    [/\s+[Uu][Kk]\b/g, ' EU'],
  ];
  for (const [re, to] of reps) s = s.replace(re, to);
  // Avoid accidental "EU EU" from stacked replacements
  s = s.replace(/\bEU EU\b/g, 'EU');
  s = s.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return s;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return (await res.json()) as T;
}

async function fetchAllUkProducts(): Promise<UkProduct[]> {
  const all: UkProduct[] = [];
  for (let page = 1; page <= 10; page++) {
    const batch = await fetchJson<UkProduct[]>(
      `${UK_STORE}?per_page=100&page=${page}`,
    );
    if (!batch.length) break;
    all.push(
      ...batch.map((p) => ({
        id: p.id,
        name: decodeWpEntities(p.name),
        slug: p.slug,
        permalink: p.permalink,
        description: p.description,
      })),
    );
  }
  return all;
}

async function fetchUkDescriptionHtml(slug: string): Promise<string> {
  // Prefer store API by slug (includes full description even when list omits it)
  const store = await fetchJson<UkProduct[]>(`${UK_STORE}?slug=${encodeURIComponent(slug)}`);
  if (store[0]?.description?.trim()) return store[0].description;

  const wp = await fetchJson<{ content?: { rendered?: string }; excerpt?: { rendered?: string } }[]>(
    `${UK_WP}?slug=${encodeURIComponent(slug)}`,
  );
  if (wp[0]?.content?.rendered?.trim()) return wp[0].content.rendered;
  if (wp[0]?.excerpt?.rendered?.trim()) return wp[0].excerpt.rendered;
  return '';
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const apply = process.argv.includes('--apply');
  const mapOnly = process.argv.includes('--map-only');

  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('Fetching UK catalogue…');
  const ukProducts = await fetchAllUkProducts();
  console.log(`UK products: ${ukProducts.length}`);

  const oursManifest = JSON.parse(
    fs.readFileSync(
      path.resolve('scratch/product-rebrand-samples/bulk-local/manifest.json'),
      'utf8',
    ),
  ) as { items: { slug: string; title: string }[] };
  const ourBySlug = new Map(oursManifest.items.map((i) => [i.slug, i]));

  const mapping: MappingRow[] = [];
  const unmatchedUk: string[] = [];

  for (const uk of ukProducts) {
    if (GAP_SLUGS.has(uk.slug) || !UK_TO_EU[uk.slug]) {
      mapping.push({
        ukSlug: uk.slug,
        ukName: uk.name,
        ukPermalink: uk.permalink,
        status: 'gap',
        ourSlug: null,
        ourTitle: null,
      });
      if (!GAP_SLUGS.has(uk.slug) && !UK_TO_EU[uk.slug]) unmatchedUk.push(uk.slug);
      continue;
    }
    const ourSlug = UK_TO_EU[uk.slug];
    const our = ourBySlug.get(ourSlug);
    if (!our) {
      mapping.push({
        ukSlug: uk.slug,
        ukName: uk.name,
        ukPermalink: uk.permalink,
        status: 'gap',
        ourSlug,
        ourTitle: null,
      });
      unmatchedUk.push(`${uk.slug}→${ourSlug} (missing on ours)`);
      continue;
    }
    mapping.push({
      ukSlug: uk.slug,
      ukName: uk.name,
      ukPermalink: uk.permalink,
      status: 'matched',
      ourSlug,
      ourTitle: our.title,
    });
  }

  const mapPath = path.join(OUT_DIR, 'uk-eu-description-mapping.json');
  fs.writeFileSync(
    mapPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        ukCount: ukProducts.length,
        matched: mapping.filter((m) => m.status === 'matched').length,
        gaps: mapping.filter((m) => m.status === 'gap'),
        unmatchedUk,
        mapping,
      },
      null,
      2,
    ),
  );
  console.log(`Wrote ${mapPath}`);
  console.log(
    `Matched: ${mapping.filter((m) => m.status === 'matched').length} | Gaps: ${mapping.filter((m) => m.status === 'gap').length}`,
  );
  if (unmatchedUk.length) {
    console.warn('Unmapped UK slugs (fix UK_TO_EU):', unmatchedUk);
  }

  if (mapOnly) return;

  const matched = mapping.filter((m) => m.status === 'matched' && m.ourSlug);
  const synced: {
    ukSlug: string;
    ourSlug: string;
    ukName: string;
    ourTitle: string | null;
    sourceHtmlLen: number;
    plainLen: number;
    tweakedLen: number;
    previousLen: number | null;
    previousPreview: string | null;
    newPreview: string;
    applied: boolean;
    error?: string;
  }[] = [];

  let supabase: ReturnType<typeof createClient> | null = null;
  if (apply || true) {
    // Always read current descriptions for dry-run comparison when credentials exist
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) supabase = createClient(url, key);
    else console.warn('No Supabase credentials — dry-run without current description comparison');
  }

  for (let i = 0; i < matched.length; i++) {
    const row = matched[i]!;
    process.stdout.write(`[${i + 1}/${matched.length}] ${row.ukSlug} → ${row.ourSlug} … `);
    try {
      const html = await fetchUkDescriptionHtml(row.ukSlug);
      if (!html.trim()) {
        console.log('EMPTY description — skip');
        synced.push({
          ukSlug: row.ukSlug,
          ourSlug: row.ourSlug!,
          ukName: row.ukName,
          ourTitle: row.ourTitle,
          sourceHtmlLen: 0,
          plainLen: 0,
          tweakedLen: 0,
          previousLen: null,
          previousPreview: null,
          newPreview: '',
          applied: false,
          error: 'empty_source',
        });
        await sleep(150);
        continue;
      }
      const plain = htmlToPlainText(html);
      const tweaked = tweakForEu(plain);
      const payloadsBag = ((globalThis as { __descPayloads?: Record<string, string> }).__descPayloads ??=
        {});
      payloadsBag[row.ourSlug!] = tweaked;

      let previous: string | null = null;
      if (supabase) {
        const { data, error } = await supabase
          .from('products')
          .select('slug, description')
          .eq('slug', row.ourSlug!)
          .maybeSingle();
        if (error) throw new Error(error.message);
        previous = (data?.description as string | null) ?? null;
      }

      let applied = false;
      if (apply && supabase) {
        const { data, error } = await supabase
          .from('products')
          .update({ description: tweaked })
          .eq('slug', row.ourSlug!)
          .select('slug');
        if (error) throw new Error(error.message);
        if (!data?.length) throw new Error('product slug not found in DB');
        applied = true;
      }

      synced.push({
        ukSlug: row.ukSlug,
        ourSlug: row.ourSlug!,
        ukName: row.ukName,
        ourTitle: row.ourTitle,
        sourceHtmlLen: html.length,
        plainLen: plain.length,
        tweakedLen: tweaked.length,
        previousLen: previous?.length ?? null,
        previousPreview: previous ? previous.slice(0, 160) : null,
        newPreview: tweaked.slice(0, 220),
        applied,
      });
      console.log(
        `${applied ? 'APPLIED' : 'dry-run'} html=${html.length} → text=${tweaked.length}`,
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log('ERROR', msg);
      synced.push({
        ukSlug: row.ukSlug,
        ourSlug: row.ourSlug!,
        ukName: row.ukName,
        ourTitle: row.ourTitle,
        sourceHtmlLen: 0,
        plainLen: 0,
        tweakedLen: 0,
        previousLen: null,
        previousPreview: null,
        newPreview: '',
        applied: false,
        error: msg,
      });
    }
    await sleep(180);
  }

  const payloadsPath = path.join(OUT_DIR, 'uk-eu-description-payloads.json');
  const payloads = (globalThis as { __descPayloads?: Record<string, string> }).__descPayloads || {};
  fs.writeFileSync(payloadsPath, JSON.stringify(payloads, null, 2));

  const remnantUk = Object.entries(payloads).filter(([, text]) => /\bUK\b/i.test(text));
  const report = {
    generatedAt: new Date().toISOString(),
    mode: apply ? 'apply' : 'dry-run',
    matched: matched.length,
    updated: synced.filter((s) => s.applied).length,
    emptySource: synced.filter((s) => s.error === 'empty_source').length,
    errors: synced.filter((s) => s.error && s.error !== 'empty_source'),
    remnantUkCount: remnantUk.length,
    remnantUkSlugs: remnantUk.map(([slug]) => slug),
    samples: synced.filter((s) => s.tweakedLen > 0).slice(0, 5).map((s) => ({
      ourSlug: s.ourSlug,
      previousPreview: s.previousPreview,
      newPreview: s.newPreview,
      previousLen: s.previousLen,
      tweakedLen: s.tweakedLen,
    })),
    synced,
  };

  const reportPath = path.join(
    OUT_DIR,
    apply ? 'uk-eu-description-sync-apply.json' : 'uk-eu-description-sync-dry-run.json',
  );
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nWrote ${reportPath}`);
  console.log(`Wrote ${payloadsPath} (${Object.keys(payloads).length} payloads)`);
  if (remnantUk.length) console.warn('UK remnants still present in:', remnantUk.map(([s]) => s).join(', '));
  console.log(
    `Done. mode=${report.mode} synced_ok=${synced.filter((s) => s.tweakedLen > 0).length} applied=${report.updated} empty=${report.emptySource} errors=${report.errors.length}`,
  );
}

const isDirect =
  process.argv[1] &&
  (process.argv[1].endsWith('sync-uk-product-descriptions.ts') ||
    process.argv[1].endsWith('sync-uk-product-descriptions.js'));

if (isDirect) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}