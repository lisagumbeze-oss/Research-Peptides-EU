/**
 * Rewrite blog markdown anchors + destinations, then add missing internals
 * on the six previously unlinked posts.
 *
 *   npx tsx scripts/rewrite-blog-anchors.ts           # dry-run
 *   npx tsx scripts/rewrite-blog-anchors.ts --apply
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const APPLY = process.argv.includes('--apply');

const HREF_ALIASES: Record<string, string> = {
  '/certificates': '/coas',
  '/tools/calculator': '/peptide-calculator',
  '/guide': '/peptide-guide',
  '/account': '/profile',
};

const ANCHOR_BY_PATH: Record<string, string> = {
  '/shop': 'research peptides EU catalog',
  '/coas': 'peptide COA library',
  '/peptide-calculator': 'peptide calculator for lab reconstitution',
  '/peptide-guide': 'peptide research guide',
  '/faq': 'research peptide FAQ',
  '/profile': 'order tracking in your account',
  '/terms': 'research use terms',
  '/shipping': 'EU peptide shipping from the Netherlands',
  '/blog/reconstitute-research-peptides': 'how to reconstitute research peptides',
  '/blog/tb-500-vs-bpc-157-synergistic-effects': 'TB-500 vs BPC-157 research guide',
  '/product/retatrutide': 'Retatrutide research peptide',
  '/product/semaglutide': 'Semaglutide research peptide',
  '/product/cagrilintide': 'Cagrilintide research peptide',
  '/product/cagrilintide-semaglutide-blend': 'Cagrilintide Semaglutide research blend',
  '/product/bpc-157': 'BPC-157 research peptide',
  '/product/igf-1-lr3': 'IGF-1 LR3 research peptide',
  '/product/hgh-fragment-176-191': 'HGH Fragment 176-191 research peptide',
  '/product/follistatin': 'Follistatin research peptide',
  '/product/bacteriostatic-water': 'bacteriostatic water for research peptides',
  '/product/thymosin-beta-4-tb500-5mg': 'TB-500 research peptide',
  '/product/bpc-10mg-tb-10mg-20mg-peptide-blend': 'BPC-157 TB-500 research blend',
  '/product/glow-blend-ghk-cu-bpc157-tb500': 'glow peptide research blend',
};

function normalizeHref(href: string): string {
  if (/^https?:\/\//i.test(href) || href.startsWith('mailto:')) return href;
  let path = href.trim();
  path = path.replace(/^\/[a-z]{2}(?=\/)/i, '');
  if (!path.startsWith('/')) path = `/${path}`;
  return HREF_ALIASES[path] || path;
}

function shopAnchor(previous: string): string {
  if (/metabolic/i.test(previous)) return 'metabolic research peptides catalog';
  if (/buy research peptides online/i.test(previous)) return 'buy research peptides online';
  if (/^Research Peptides EU$/i.test(previous.trim())) return 'buy research peptides online';
  return 'research peptides EU catalog';
}

function rewriteExistingLinks(content: string): string {
  return content.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, rawAnchor: string, rawHref: string) => {
    const href = normalizeHref(rawHref);
    if (/^https?:\/\//i.test(href)) return `[${rawAnchor}](${href})`;
    if (href === '/shop') return `[${shopAnchor(rawAnchor)}](${href})`;
    const mapped = ANCHOR_BY_PATH[href];
    return `[${mapped || rawAnchor}](${href})`;
  });
}

const BODY_PATCHES: Record<string, Array<[string | RegExp, string]>> = {
  'bpc-157-comprehensive-guide': [
    [
      'BPC-157 (Body Protection Compound-157) is a synthetic pentadecapeptide',
      '[BPC-157 research peptide](/product/bpc-157) (Body Protection Compound-157) is a synthetic pentadecapeptide',
    ],
    [
      'Upon reconstitution with bacteriostatic water (agua bacteriostática)',
      'Upon reconstitution with [bacteriostatic water for research peptides](/product/bacteriostatic-water) (agua bacteriostática)',
    ],
    [
      'Browse Research Peptides EU for 99% purity, third-party tested BPC-157 for your next European laboratory study.',
      'Browse [BPC-157 research peptide](/product/bpc-157) in the [research peptides EU catalog](/shop) for 99% purity, third-party tested material. Compare complementary actin-regulation work in our [TB-500 vs BPC-157 research guide](/blog/tb-500-vs-bpc-157-synergistic-effects).',
    ],
  ],
  'reconstitute-research-peptides': [
    [
      'introduce the required volume of bacteriostatic water slowly',
      'introduce the required volume of [bacteriostatic water for research peptides](/product/bacteriostatic-water) slowly',
    ],
    [
      'Use our free Peptide Calculator (calculadora de péptidos) to plan accurate laboratory volumes.',
      'Use the [peptide calculator for lab reconstitution](/peptide-calculator) (calculadora de péptidos) to plan accurate laboratory volumes, and confirm vial identity in the [peptide COA library](/coas).',
    ],
  ],
  'tb-500-vs-bpc-157-synergistic-effects': [
    [
      'While BPC-157 focuses on upregulating growth hormone receptors',
      'While [BPC-157 research peptide](/product/bpc-157) focuses on upregulating growth hormone receptors',
    ],
    [
      'TB-500 (Thymosin Beta-4) actively regulates cellular actin',
      '[TB-500 research peptide](/product/thymosin-beta-4-tb500-5mg) (Thymosin Beta-4) actively regulates cellular actin',
    ],
    [
      'Explore Research Peptides EU BPC-157/TB-500 research blends to streamline laboratory workflows across Spain and Europe.',
      'Explore the [BPC-157 TB-500 research blend](/product/bpc-10mg-tb-10mg-20mg-peptide-blend) to streamline laboratory workflows across Spain and Europe. Follow [how to reconstitute research peptides](/blog/reconstitute-research-peptides), then browse the [research peptides EU catalog](/shop).',
    ],
  ],
  'retatrutide-research-peptide-eu': [
    [
      'Retatrutide is a triple agonist research peptide',
      '[Retatrutide research peptide](/product/retatrutide) is a triple agonist research peptide',
    ],
    [
      'sterile bacteriostatic water (including Hospira bacteriostatic water formats where listed)',
      'sterile [bacteriostatic water for research peptides](/product/bacteriostatic-water) (including Hospira formats where listed)',
    ],
    [
      'Use the Peptide Calculator to plan volumes before opening vials.',
      'Use the [peptide calculator for lab reconstitution](/peptide-calculator) to plan volumes before opening vials.',
    ],
    [
      'Researchers comparing Cagrilintide peptide options, IGF-1 LR3, CJC-1295 Ipamorelin, or follistatin-related research materials can browse the same EU catalog.',
      'Researchers comparing [Cagrilintide research peptide](/product/cagrilintide), [IGF-1 LR3 research peptide](/product/igf-1-lr3), or related materials can browse the [research peptides EU catalog](/shop).',
    ],
  ],
  'research-peptides-uk-europe': [
    [
      'increasingly evaluate Europe-based catalogs with documented COAs and cold-chain logistics.',
      'increasingly evaluate the [research peptides EU catalog](/shop) with documented COAs and cold-chain logistics.',
    ],
    [
      '- Retatrutide buy / Retatrutide UK buy / where to buy Retatrutide online (research only)',
      '- [Retatrutide research peptide](/product/retatrutide) (research only)',
    ],
    [
      '- Bacteriostatic water, bac water Hospira, bacteriostatic water 10ml',
      '- [bacteriostatic water for research peptides](/product/bacteriostatic-water)',
    ],
    [
      '2. Review COA library references before ordering.\n3. Plan reconstitution with bacteriostatic water and the peptide calculator.',
      '2. Review the [peptide COA library](/coas) before ordering.\n3. Plan reconstitution with bacteriostatic water and the [peptide calculator for lab reconstitution](/peptide-calculator).',
    ],
  ],
  'research-peptides-multi-market-eu': [
    [
      'a US “glow blend peptide” query is not treated the same as a Dutch “research chem peptide” query.',
      'a US [glow peptide research blend](/product/glow-blend-ghk-cu-bpc157-tb500) query is not treated the same as a Dutch “research chem peptide” query.',
    ],
    [
      'HGH Fragment 176-191, Hexarelin, peptides HCG',
      '[HGH Fragment 176-191 research peptide](/product/hgh-fragment-176-191), Hexarelin, peptides HCG',
    ],
    [
      'Always confirm SKU specs and COAs. Research use only — not for human or veterinary use.',
      'Always confirm SKU specs in the [research peptides EU catalog](/shop) and batch files in the [peptide COA library](/coas). Research use only — not for human or veterinary use.',
    ],
  ],
  'como-comprar-folistatina-investigacion': [
    [
      'Reconstitute with sterile bacteriostatic water to your target concentration',
      'Reconstitute with sterile [bacteriostatic water for research peptides](/product/bacteriostatic-water) to your target concentration',
    ],
    [
      'Browse our [Follistatin research peptide](/product/follistatin) and view the current batch COA. All EU orders ship with full documentation from our Netherlands distribution centre.',
      'Browse [Follistatin research peptide](/product/follistatin), confirm the lot in the [peptide COA library](/coas), or open the [research peptides EU catalog](/shop). All EU orders ship with full documentation from our Netherlands distribution centre.',
    ],
  ],
  'coa-certificados-analisis-lote': [
    [
      'HPLC (High-Performance Liquid Chromatography) separates compounds by retention time to measure purity.',
      'HPLC (High-Performance Liquid Chromatography) separates compounds by retention time to measure purity — see [HPLC and mass spectrometry verification](/blog/hplc-espectrometria-masas).',
    ],
    [
      'Download batch COAs for any compound in our catalogue from the [peptide COA library](/coas). Every batch ships with full HPLC and MS documentation.',
      'Download batch files from the [peptide COA library](/coas) or browse the [research peptides EU catalog](/shop). Every batch ships with full HPLC and MS documentation.',
    ],
  ],
  'almacenamiento-peptidos-liofilizados': [
    [
      'Explore our full catalogue of research-grade lyophilised peptides at [buy research peptides online](/shop) — every batch ships with a Certificate of Analysis confirming purity ≥98%.',
      'Explore lyophilised compounds in the [research peptides EU catalog](/shop). Reconstitute with [how to reconstitute research peptides](/blog/reconstitute-research-peptides) and keep lot files in the [peptide COA library](/coas).',
    ],
  ],
  'envio-cadena-frio-ue': [
    [
      'For shipping queries, visit our [research peptide FAQ](/faq) or contact our team directly.',
      'For transit detail see [EU peptide shipping from the Netherlands](/shipping), or the [research peptide FAQ](/faq).',
    ],
  ],
};

function applyBodyPatches(id: string, content: string): string {
  const patches = BODY_PATCHES[id];
  if (!patches) return content;
  let next = content;
  for (const [from, to] of patches) {
    if (typeof from === 'string') {
      if (!next.includes(from)) {
        continue;
      }
      next = next.replace(from, to);
    } else {
      next = next.replace(from, to);
    }
  }
  return next;
}

export function rewritePost(id: string, content: string): string {
  return applyBodyPatches(id, rewriteExistingLinks(content));
}

function extractLinks(content: string): Array<{ anchor: string; href: string }> {
  return [...content.matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)].map((m) => ({
    anchor: m[1],
    href: m[2],
  }));
}

async function main() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Need SUPABASE_URL/VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const { data, error } = await supabase.from('blog_posts').select('id,title,content');
  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  let changed = 0;
  for (const post of data || []) {
    const next = rewritePost(post.id, String(post.content || ''));
    const before = extractLinks(String(post.content || ''));
    const after = extractLinks(next);
    const dirty = next !== post.content;
    console.log(`\n${dirty ? 'CHANGE' : 'same '} ${post.id}`);
    console.log(`  links ${before.length} → ${after.length}`);
    for (const link of after) console.log(`    [${link.anchor}](${link.href})`);
    if (!dirty) continue;
    changed += 1;
    if (APPLY) {
      const { error: upErr } = await supabase
        .from('blog_posts')
        .update({ content: next, updated_at: new Date().toISOString() })
        .eq('id', post.id);
      if (upErr) {
        console.error('  UPDATE FAIL', upErr.message);
        process.exit(1);
      }
    }
  }

  console.log(`\n${APPLY ? 'Applied' : 'Dry-run'} ${changed} posts`);
}

const isDirectRun = process.argv[1]?.includes('rewrite-blog-anchors');
if (isDirectRun) {
  void main();
}
