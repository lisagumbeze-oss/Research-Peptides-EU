/**
 * Applies buyer-intent question SEO to all product titles + descriptions.
 * Preserves existing long descriptions by prepending a short buyer-Q block.
 *
 * Usage: npx tsx scripts/apply-buyer-question-seo.ts
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

const COUNTRIES = [
  'the Netherlands',
  'the UK',
  'Germany',
  'Italy',
  'Spain',
  'France',
  'Belgium',
  'Poland',
  'Ireland',
  'Austria',
  'Portugal',
  'Sweden',
] as const;

type TitlePattern = (name: string, country: string) => string;
type DescBuilder = (name: string, c1: string, c2: string, c3: string) => string;

const TITLE_PATTERNS: TitlePattern[] = [
  (n, c) => `${n} | How to Buy ${n} in ${c}`,
  (n, c) => `${n} | Where Can I Buy ${n} in ${c}`,
  (n, c) => `${n} | How Much for ${n} in ${c}`,
  (n, c) => `${n} | Best Place to Order ${n} in ${c}`,
  (n, c) => `${n} | Can I Buy ${n} Online in ${c}`,
  (n, c) => `${n} | Price of ${n} in ${c}`,
];

const DESC_PATTERNS: DescBuilder[] = [
  (n, a, b, c) =>
    `Where can I buy ${n} in ${a}? Order research-grade material from Research Peptides EU with COA documentation and EU dispatch. How much for ${n} in ${b} and ${c}? Check live catalog pricing for research vials. How to buy ${n} in ${a}: add to cart, checkout in EUR, and we ship temperature-controlled across Europe. Research use only — not for human or veterinary use.`,
  (n, a, b, c) =>
    `How to buy ${n} in ${a}? Order from Research Peptides EU — HPLC/COA pathways, EUR pricing, Netherlands fulfillment. Where can I buy ${n} in ${b} and ${c}? Ship from our European research catalog. How much for ${n} in ${a}? See live product pricing before checkout. Research use only — not for human or veterinary use.`,
  (n, a, b, c) =>
    `How much for ${n} in ${a}? Check live EUR catalog pricing on Research Peptides EU. Where can I buy ${n} in ${b}? Best place to order ${n} in ${c} for qualified laboratory procurement with cold-chain dispatch. How to buy ${n} online in ${a}: add to cart and checkout. Research use only — not for human or veterinary use.`,
  (n, a, b, c) =>
    `Looking for ${n} in ${a}? Where can I buy ${n} in ${b} and how much for ${n} in ${c}? Research Peptides EU supplies verified research compounds with batch documentation. How to buy ${n} in ${a}: browse the catalog, select your vial strength, and checkout in EUR. Research use only — not for human or veterinary use.`,
  (n, a, b, c) =>
    `Can I order ${n} online in ${a}? Yes — Research Peptides EU ships research-grade ${n} across Europe. How to buy ${n} in ${b}: add to cart and checkout. Where can I buy ${n} in ${c}? From our Netherlands-based catalog with COA on every batch. Research use only — not for human or veterinary use.`,
  (n, a, b, c) =>
    `Best place to order ${n} in ${a}? Research Peptides EU — verified purity, EUR pricing, EU & UK dispatch. How much for ${n} in ${b}? See live listing prices. Where can I buy ${n} in ${c}? Order online for temperature-controlled laboratory delivery. Research use only — not for human or veterinary use.`,
];

/** Products already approved in the sample — keep exact copy. */
const LOCKED: Record<string, { title: string; description: string }> = {
  tirzepatide: {
    title: 'Tirzepatide | How to Buy Tirzepatide in the Netherlands',
    description:
      'Tirzepatide research peptide — dual GIP and GLP-1 receptor agonist for laboratory incretin and metabolic pathway studies. Where can I buy Tirzepatide in the Netherlands? Order from Research Peptides EU with COA documentation and EU dispatch. How much for Tirzepatide in Germany and the UK? Check live catalog pricing for research vials. How to buy Tirzepatide in Italy: add to cart, checkout in EUR, and we ship temperature-controlled across Europe. Often compared with Semaglutide GLP-1 research peptide under matched assay conditions. Research use only — not for human or veterinary use.',
  },
  semaglutide: {
    title: 'Semaglutide | Where Can I Buy Semaglutide in Germany',
    description:
      'Semaglutide GLP-1 research peptide for selective GLP-1 receptor agonist laboratory models. How to buy Semaglutide in Germany? Order research-grade vials from Research Peptides EU with HPLC/COA pathways. Where can I buy Semaglutide in the UK and Netherlands? Ship from our European catalog with EUR pricing. How much for Semaglutide in Italy and Spain? See live product pricing before checkout. Common comparator alongside Tirzepatide dual agonist research material. Research use only — not for human or veterinary use.',
  },
  'semaglutide-glp-1': {
    title: 'Semaglutide GLP-1 | How Much for Semaglutide in the UK',
    description:
      'Semaglutide GLP-1 research peptide for selective GLP-1 receptor agonist laboratory models. How much for Semaglutide in the UK? Check live EUR catalog pricing. Where can I buy Semaglutide GLP-1 in France and the Netherlands? Research Peptides EU supplies COA-verified material for laboratory procurement. How to buy Semaglutide in Italy: add to cart and checkout for temperature-controlled EU dispatch. Research use only — not for human or veterinary use.',
  },
};

const BUYER_Q_MARKERS = [
  'where can i buy',
  'how to buy',
  'how much for',
  'best place to order',
  'can i buy',
  'can i order',
  'price of ',
];

function hashIndex(slug: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h % mod;
}

function baseTitle(title: string): string {
  const pipe = title.indexOf(' | ');
  if (pipe > 0) return title.slice(0, pipe).trim();
  return title.trim();
}

function shortName(title: string): string {
  return baseTitle(title)
    .replace(/\s*\(powder list\)\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasBuyerBlock(description: string): boolean {
  const lower = description.toLowerCase();
  return BUYER_Q_MARKERS.some((m) => lower.includes(m));
}

function buildUpdate(slug: string, title: string, description: string) {
  if (LOCKED[slug]) return LOCKED[slug];

  const name = shortName(title);
  const tIdx = hashIndex(slug, TITLE_PATTERNS.length);
  const dIdx = hashIndex(slug + ':d', DESC_PATTERNS.length);
  const c0 = COUNTRIES[hashIndex(slug, COUNTRIES.length)];
  const c1 = COUNTRIES[hashIndex(slug + '1', COUNTRIES.length)];
  const c2 = COUNTRIES[hashIndex(slug + '2', COUNTRIES.length)];
  const c3 = COUNTRIES[hashIndex(slug + '3', COUNTRIES.length)];

  // Ensure secondary countries differ from primary where possible
  const countryA = c0;
  const countryB = c1 === c0 ? COUNTRIES[(hashIndex(slug, COUNTRIES.length) + 1) % COUNTRIES.length] : c1;
  const countryC =
    c2 === c0 || c2 === countryB
      ? COUNTRIES[(hashIndex(slug, COUNTRIES.length) + 3) % COUNTRIES.length]
      : c2;

  const newTitle = TITLE_PATTERNS[tIdx](name, countryA);
  const block = DESC_PATTERNS[dIdx](name, countryA, countryB, countryC);

  const existing = (description || '').trim();
  let newDescription: string;

  if (!existing) {
    newDescription = `${name} research material for qualified laboratory studies. ${block}`;
  } else if (hasBuyerBlock(existing) && existing.length < 900) {
    // Short SEO-only descriptions: refresh with a new buyer-Q block
    newDescription = `${name} research material for qualified laboratory studies. ${block}`;
  } else if (hasBuyerBlock(existing)) {
    // Long body already has buyer Q — keep body; title still updates
    newDescription = existing;
  } else {
    newDescription = `${block}\n\n${existing}`;
  }

  return { title: newTitle, description: newDescription };
}

async function main() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url!, key);

  const { data: products, error } = await supabase
    .from('products')
    .select('slug,title,description')
    .order('slug');

  if (error) throw error;
  if (!products?.length) {
    console.error('No products found');
    process.exit(1);
  }

  const report: Array<{ slug: string; title: string }> = [];
  let ok = 0;
  let fail = 0;

  for (const product of products) {
    const next = buildUpdate(product.slug, product.title || '', product.description || '');
    const { data, error: upErr } = await supabase
      .from('products')
      .update({ title: next.title, description: next.description })
      .eq('slug', product.slug)
      .select('slug,title');

    if (upErr) {
      console.error('ERR', product.slug, upErr.message);
      fail++;
    } else if (!data?.length) {
      console.warn('missing', product.slug);
      fail++;
    } else {
      ok++;
      report.push({ slug: product.slug, title: next.title });
      console.log('Updated', product.slug);
    }
  }

  writeFileSync('scratch/buyer-q-seo-report.json', JSON.stringify(report, null, 2));
  console.log(`Done. ok=${ok} fail=${fail} total=${products.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
