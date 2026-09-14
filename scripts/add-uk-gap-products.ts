/**
 * Add the 2 UK-shop gap products to our Supabase catalog.
 *
 *   npx tsx scripts/add-uk-gap-products.ts           # dry-run
 *   npx tsx scripts/add-uk-gap-products.ts --apply
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { convertGbpToEur, DEFAULT_CURRENCY } from '../src/lib/currency.ts';
import { tweakForEu } from './sync-uk-product-descriptions';

const UA = 'ResearchPeptidesUKCatalogImport/1.0 (internal price-list tooling)';
const UK_STORE = 'https://researchpeptide.co.uk/wp-json/wc/store/v1/products';

type UkProduct = {
  name: string;
  slug: string;
  permalink: string;
  description?: string;
  prices?: { price?: string; currency_minor_unit?: number };
  images?: { src?: string }[];
  is_in_stock?: boolean;
};

function decode(raw: string): string {
  return raw
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, '&')
    .replace(/&ndash;/g, '–')
    .trim();
}

function gbpMinorToMajor(priceStr: string | undefined, minor = 2): number {
  const n = Number(priceStr || 0);
  return n / 10 ** minor;
}

/** Adapt the synced 5mg/5mg blend copy for the 13mg/3mg SKU. */
function adaptTesamorelinBlendDescription(source: string): string {
  let s = source;
  s = s.replace(/Tesamorelin 5mg and Ipamorelin 5mg \(total 10mg\)/gi, 'Tesamorelin 13mg and Ipamorelin 3mg (total 16mg)');
  s = s.replace(/Tesamorelin 5mg\s*\|\s*Ipamorelin 5mg/gi, 'Tesamorelin 13mg | Ipamorelin 3mg');
  s = s.replace(/5mg\s*\|\s*5mg/gi, '13mg | 3mg');
  s = s.replace(/\(10mg Total Peptide Blend\)/gi, '(16mg Total Peptide Blend)');
  s = s.replace(/total 10mg/gi, 'total 16mg');
  s = s.replace(/\b10mg Total\b/gi, '16mg Total');
  s = s.replace(/\b5 ?mg of Tesamorelin\b/gi, '13 mg of Tesamorelin');
  s = s.replace(/\b5 ?mg of Ipamorelin\b/gi, '3 mg of Ipamorelin');
  return tweakForEu(s);
}

function penDescription(): string {
  return tweakForEu(`Retatrutide GLP-3 Pen 40mg – Research Grade

Overview

Retatrutide (often referenced as a GLP-3 / triple-agonist research compound) is supplied here in a 40mg prefilled pen format for controlled laboratory handling. This presentation is intended for research teams that require precise, repeatable dispensing in metabolic pathway and receptor-signalling studies. See also our vial-format [Retatrutide research peptide](/product/retatrutide-glp-3) for conventional lyophilized protocols.

Research Context

Retatrutide is studied as a multi-receptor agonist spanning GLP-1, GIP, and glucagon receptor pathways. Labs comparing incretin research materials often also evaluate [Semaglutide GLP-1 research peptide](/product/semaglutide-glp-1) and [Tirzepatide research peptide](/product/tirzepatide) under the same assay conditions. The pen format supports protocol designs where accurate aliquot delivery and reduced open-vial handling are preferred over conventional lyophilized vials.

Product Notes

• Strength: 40mg prefilled research pen
• Format: ready-to-dispense laboratory presentation
• Intended use: scientific research and laboratory assays only

Related Research Compounds

• [Retatrutide research peptide](/product/retatrutide-glp-3)

• [Semaglutide GLP-1 research peptide](/product/semaglutide-glp-1)

• [Tirzepatide research peptide](/product/tirzepatide)

• [Cagrilintide research peptide](/product/gagrilintide-5mg)

Important

This product is supplied strictly for scientific research and laboratory use and is not intended for human or veterinary consumption. [Buy research peptides online](/shop) from Research Peptides EU for laboratory procurement only.`);
}

async function fetchUk(slug: string): Promise<UkProduct> {
  const res = await fetch(`${UK_STORE}?slug=${encodeURIComponent(slug)}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`UK fetch ${slug}: ${res.status}`);
  const rows = (await res.json()) as UkProduct[];
  if (!rows[0]) throw new Error(`UK product not found: ${slug}`);
  return rows[0];
}

async function main() {
  const apply = process.argv.includes('--apply');
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials');
  const supabase = createClient(url, key);

  const { data: blendTemplate, error: blendErr } = await supabase
    .from('products')
    .select('description, categories, inventory')
    .eq('slug', 'tesamorelin-5mg-ipamorelin-5mg-10mg-total-peptide-blend')
    .single();
  if (blendErr) throw new Error(blendErr.message);

  const ukBlend = await fetchUk('tesamorelin-13mg-ipamorelin-3mg-16mg-blend');
  const ukPen = await fetchUk('glp-3-pen-40mg');

  const blendGbp = gbpMinorToMajor(ukBlend.prices?.price, ukBlend.prices?.currency_minor_unit ?? 2);
  const penGbp = gbpMinorToMajor(ukPen.prices?.price, ukPen.prices?.currency_minor_unit ?? 2);

  const products = [
    {
      title: decode(ukBlend.name),
      slug: 'tesamorelin-13mg-ipamorelin-3mg-16mg-blend',
      description: adaptTesamorelinBlendDescription(String(blendTemplate?.description || '')),
      price: convertGbpToEur(blendGbp),
      currency: DEFAULT_CURRENCY,
      inventory: Number(blendTemplate?.inventory) || 100,
      images: (ukBlend.images || [])
        .map((i) => (i.src || '').replace(/^http:/, 'https:'))
        .filter(Boolean),
      categories: (blendTemplate?.categories as string[]) || ['Peptides'],
      specifications: [
        'Research use only',
        'Tesamorelin 13mg + Ipamorelin 3mg (16mg total peptide blend)',
        `Imported from UK shop reference (£${blendGbp.toFixed(2)} → EUR @ 1.17)`,
      ],
      variants: [],
      rating: 0,
      review_count: 0,
    },
    {
      title: decode(ukPen.name),
      slug: 'glp-3-pen-40mg',
      description: penDescription(),
      price: convertGbpToEur(penGbp),
      currency: DEFAULT_CURRENCY,
      inventory: 100,
      images: (ukPen.images || [])
        .map((i) => (i.src || '').replace(/^http:/, 'https:'))
        .filter(Boolean),
      categories: ['Peptides', 'research-chemicals'],
      specifications: [
        'Research use only',
        'Retatrutide GLP-3 40mg prefilled pen',
        `Imported from UK shop reference (£${penGbp.toFixed(2)} → EUR @ 1.17)`,
      ],
      variants: [],
      rating: 0,
      review_count: 0,
    },
  ];

  for (const p of products) {
    console.log('---', p.slug);
    console.log('title:', p.title);
    console.log('price EUR:', p.price, '| images:', p.images.length, '| descLen:', p.description.length);
    console.log('desc preview:', p.description.slice(0, 160).replace(/\n/g, ' / '));
  }

  if (!apply) {
    console.log('\nDry-run only. Pass --apply to insert/upsert.');
    return;
  }

  for (const p of products) {
    const { data, error } = await supabase
      .from('products')
      .upsert(p, { onConflict: 'slug' })
      .select('id, slug, title, price, currency');
    if (error) {
      console.error('FAIL', p.slug, error.message);
      process.exitCode = 1;
    } else {
      console.log('UPSERTED', JSON.stringify(data?.[0]));
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
