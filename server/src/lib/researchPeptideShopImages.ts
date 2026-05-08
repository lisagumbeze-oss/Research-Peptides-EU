/**
 * Maps catalog slugs → product imagery from Research Peptide UK’s public WooCommerce Store API
 * (same catalogue as https://researchpeptide.co.uk/shop/). Hotlinks their CDN URLs.
 */

export type ShopRefProduct = { name: string; image: string };

const STORE_API =
  'https://researchpeptide.co.uk/wp-json/wc/store/v1/products?per_page=100';

export async function fetchResearchPeptideShopProducts(): Promise<ShopRefProduct[]> {
  const res = await fetch(STORE_API, {
    headers: { 'User-Agent': 'ResearchPeptidesUKCatalogImport/1.0 (internal price-list tooling)' },
  });
  if (!res.ok) throw new Error(`Research Peptide store API ${res.status}`);
  const data = (await res.json()) as { name: string; images: { src: string }[] }[];
  return data
    .map((p) => ({
      name: decodeWpEntities(p.name),
      image: p.images[0]?.src?.replace(/^http:/, 'https:') || '',
    }))
    .filter((p) => p.image.length > 0);
}

function decodeWpEntities(raw: string): string {
  return raw
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .trim();
}

function norm(s: string): string {
  return decodeWpEntities(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Substrings (decoded shop names contain these). Longer / more specific strings first where ambiguous.
 * Slugs without a direct listing use the closest shop product for visual continuity.
 */
const SLUG_IMAGE_HINT: Record<string, string> = {
  'hgh-191aa-somatropin': 'Tesamorelin',
  'mt-1': 'MT-1',
  'mt-2-melanotan-2-acetate': 'MT-2',
  'pt-141': 'PT 141',
  'gonadorelin-acetate': 'Gonadorelin',
  'dsip': 'DSIP',
  'selank': 'Selank',
  'oxytocin-acetate': 'Oxytocin',
  'epithalon': 'Epithalon',
  'bpc-157': 'BPC-157',
  'bpc-tb-blend-powder': 'BPC 10mg + TB 10mg',
  'ace-031': 'Ace 031',
  'aicar': 'AICAR',
  'adipotide': 'Adipotide',
  'semax': 'Semax',
  'semaglutide': 'Sema',
  'ss-31': 'SS-31',
  'tirzepatide': 'Tirze GLP-2',
  'ghrp-2-acetate': 'GHRP 2 10mg',
  'ghrp-6-acetate': 'GHRP 6 10mg',
  'cjc-1295-without-dac': 'CJC 1295 NO DAC',
  'cjc-1295-without-dac-ipamorelin-blend': 'CJC-1295 No DAC 5mg, Ipamorelin',
  'cjc-1295-with-dac': 'CJC 1295 with DAC',
  'tb500-thymosin-beta-4-acetate': 'Thymosin Beta 4 (TB500) 10mg',
  'tb500-frag': 'Thymosin Beta 4 (TB500) 10mg',
  'mgf': 'PEG MGF',
  'peg-mgf': 'PEG MGF',
  'sermorelin-acetate': 'Sermorelin',
  'hcg': 'HCG',
  'aod9604': 'AOD 9604',
  'gdf-8': 'GDF-8',
  'follistatin': 'Follistatin',
  'igf-1-lr3': 'IGF-1 LR3',
  'igf-des': 'IGF 1 DES',
  'tesamorelin': 'Tesamorelin',
  'ipamorelin': 'Ipamorelin',
  'hexarelin-acetate': 'Hexarelin Acetate',
  'ghk-cu': 'GHK-CU',
  'ahk-cu': 'GHK-CU',
  'kisspeptin-10': 'KissPeptin',
  'thymalin': 'Thymalin',
  'thymosin-alpha-1': 'Thymosin Alpha-1',
  'mots-c': 'MOTS-C',
  'foxo4-dri': 'LL-37',
  'll-37': 'LL-37',
  'retatrutide': 'Reta GLP-3',
  'melatonin': 'Melatonin',
  'hgh-fragment-176-191': 'HGH Fragment 176-191',
  'dermorphin': 'Oxytocin',
  'glp-1-5mg': 'Sema',
  'glutathione': 'Glutathione',
  'insulin-3ml': 'Bacteriostatic Water',
  'bacteriostatic-water': 'Bacteriostatic Water',
  'botulinum-toxin-100iu': 'Thymosin Alpha-1',
  '5-amino-1mq': '5-amino-1mq',
  'hmg-75iu': 'HCG',
  'epo-3000iu': 'IGF-1 LR3',
  'cerebrolysin': 'Semax',
  'hyaluronic-acid': 'KPV',
  'cagrilintide': 'Gagrilintide',
  'ara-290': 'Thymosin Beta 4 (TB500) 10mg',
  'snap-8': 'Epithalon',
  'mazdutide': 'Tirze GLP-2',
  'nad': 'Nad+ 500mg',
  'alprostadil': 'Oxytocin',
  'bpc-ghk-tb-glow-blend-70mg': 'Glow Blend',
  'bpc-ghk-tb-kpv-blend-80mg': 'Klow Blend',
  'survodutide': 'Reta GLP-3',
  'cagrilintide-semaglutide-blend': 'Gagrilintide',
  'retatrutide-cagrilintide-blend': 'Reta GLP-3',
  'vip': 'KPV',
  'kpv': 'KPV',
  'adamax': 'Semax',
  'pe-22-28': 'Epithalon',
  'testagen': 'Thymalin',
  'n-acetyl-epitalon-amidate': 'Epithalon',
  'pinealon': 'Epithalon',
  'lemon-bottle': 'Bacteriostatic Water',
  'vilon': 'Thymalin',
  'pnc27': 'LL-37',
  'p21': 'Semax',
  'slu-pp-332': 'SLU-PP-332',
};

function findByHint(products: ShopRefProduct[], hint: string): ShopRefProduct | null {
  const h = norm(hint);
  if (h.length < 2) return null;
  const hits = products.filter((p) => norm(p.name).includes(h));
  if (hits.length === 0) return null;
  hits.sort((a, b) => b.name.length - a.name.length);
  return hits[0]!;
}

export function resolveResearchPeptideImage(
  slug: string,
  title: string,
  products: ShopRefProduct[],
  fallbackUrl: string
): string {
  const hint = SLUG_IMAGE_HINT[slug] ?? title;
  const byHint = findByHint(products, hint);
  if (byHint) return byHint.image;

  const byTitle = findByHint(products, title);
  if (byTitle) return byTitle.image;

  return fallbackUrl;
}
