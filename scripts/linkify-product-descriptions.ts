/**
 * Inject keyword-anchored inbound (+ sparse outbound) links into product descriptions.
 *
 * - Prefer internal /product/, /shop, /peptide-calculator links
 * - Keep outbound scientific refs few (PubMed / PubChem / journal URLs)
 * - Uses markdown [anchor](href) — rendered by ProductDescriptionCards
 *
 * Usage:
 *   npx tsx scripts/linkify-product-descriptions.ts            # dry-run (file payload)
 *   npx tsx scripts/linkify-product-descriptions.ts --apply
 *   npx tsx scripts/linkify-product-descriptions.ts --slugs=glp-3-pen-40mg --apply
 *   npx tsx scripts/linkify-product-descriptions.ts --from-db --apply
 *   npx tsx scripts/linkify-product-descriptions.ts --limit=5
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const APPLY = process.argv.includes('--apply');
const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const LIMIT = limitArg ? Number(limitArg.split('=')[1]) : Number.POSITIVE_INFINITY;

const OUT_DIR = path.resolve('scratch');
const PAYLOAD_PATH = path.join(OUT_DIR, 'uk-eu-description-payloads.json');
const KEYWORD_DIR = path.resolve('docs/seo/keywords-by-market');

const MAX_INBOUND = 5;
const MAX_OUTBOUND = 2;
const MIN_INBOUND_BEFORE_RELATED = 4;

type RelatedLink = { anchor: string; slug?: string; href?: string };

/** Manual related clusters — used when body text lacks enough natural mentions. */
const RELATED: Record<string, RelatedLink[]> = {
  'bpc-157': [
    { slug: 'thymosin-beta-4-tb500-5mg', anchor: 'TB-500 research peptide' },
    { slug: 'bpc-10mg-tb-10mg-20mg-peptide-blend', anchor: 'BPC-157 TB-500 blend' },
    { slug: 'bacteriostatic-water-0-9-benzyl-alcohol-10ml-hospira-injection-usp', anchor: 'bacteriostatic water' },
  ],
  'thymosin-beta-4-tb500-5mg': [
    { slug: 'bpc-157', anchor: 'BPC-157 research peptide' },
    { slug: 'bpc-10mg-tb-10mg-20mg-peptide-blend', anchor: 'BPC 157 10mg TB500 10mg blend' },
  ],
  'thymosin-beta-4-tb500-10mg': [
    { slug: 'bpc-157', anchor: 'BPC-157 research peptide' },
    { slug: 'glow-blend-ghk-cu-bpc157-tb500', anchor: 'glow blend peptide' },
  ],
  'bpc-10mg-tb-10mg-20mg-peptide-blend': [
    { slug: 'bpc-157', anchor: 'BPC-157' },
    { slug: 'thymosin-beta-4-tb500-10mg', anchor: 'TB-500 / thymosin beta-4' },
  ],
  'bpc-5mg-tb-5mg': [
    { slug: 'bpc-157', anchor: 'BPC-157 research peptide' },
    { slug: 'thymosin-beta-4-tb500-5mg', anchor: 'TB500 research peptide' },
  ],
  'glow-blend-ghk-cu-bpc157-tb500': [
    { slug: 'ghk-cu', anchor: 'GHK-Cu research peptide' },
    { slug: 'bpc-157', anchor: 'BPC-157' },
    { slug: 'kpv', anchor: 'KPV peptide' },
  ],
  'klow-blend-ghk-cu-bpc157-tb500-kpv': [
    { slug: 'glow-blend-ghk-cu-bpc157-tb500', anchor: 'glow peptide blend' },
    { slug: 'kpv', anchor: 'KPV research peptide' },
    { slug: 'ghk-cu', anchor: 'GHK-Cu' },
  ],
  kpv: [
    { slug: 'll-37', anchor: 'LL-37 research peptide' },
    { slug: 'glow-blend-ghk-cu-bpc157-tb500', anchor: 'glow peptide' },
    { slug: 'bpc-157', anchor: 'BPC-157' },
  ],
  'ghk-cu': [
    { slug: 'glow-blend-ghk-cu-bpc157-tb500', anchor: 'glow blend peptide' },
    { slug: 'bpc-157', anchor: 'BPC-157 research peptide' },
  ],
  'cjc-1295-no-dac-5mg-ipamorelin-5mg-10mg-total-peptide-blend': [
    { slug: 'ipamorelin', anchor: 'Ipamorelin research peptide' },
    { slug: 'cjc-1295-no-dac-5mg', anchor: 'CJC-1295 no DAC' },
    { slug: 'cjc-1295-with-dac-2mg', anchor: 'CJC-1295 with DAC' },
  ],
  'cjc-1295-no-dac-5mg': [
    { slug: 'ipamorelin', anchor: 'Ipamorelin' },
    { slug: 'cjc-1295-no-dac-5mg-ipamorelin-5mg-10mg-total-peptide-blend', anchor: 'CJC 1295 Ipamorelin blend' },
  ],
  'cjc-1295-with-dac-2mg': [
    { slug: 'ipamorelin', anchor: 'Ipamorelin research peptide' },
    { slug: 'tesamorelin', anchor: 'Tesamorelin research peptide' },
  ],
  ipamorelin: [
    { slug: 'cjc-1295-no-dac-5mg', anchor: 'CJC-1295 research peptide' },
    { slug: 'cjc-1295-no-dac-5mg-ipamorelin-5mg-10mg-total-peptide-blend', anchor: 'CJC 1295 Ipamorelin' },
  ],
  'tesamorelin-5mg-ipamorelin-5mg-10mg-total-peptide-blend': [
    { slug: 'tesamorelin', anchor: 'Tesamorelin' },
    { slug: 'ipamorelin', anchor: 'Ipamorelin' },
  ],
  tesamorelin: [
    { slug: 'ipamorelin', anchor: 'Ipamorelin research peptide' },
    { slug: 'sermorelin-acetate', anchor: 'Sermorelin acetate' },
  ],
  'igf-1-lr3-1mg': [
    { slug: 'igf-1-des-1mg', anchor: 'IGF-1 DES' },
    { slug: 'peg-mgf-2mg', anchor: 'PEG-MGF research peptide' },
  ],
  'peg-mgf-2mg': [
    { slug: 'igf-1-lr3-1mg', anchor: 'IGF-1 LR3' },
    { slug: 'igf-1-des-1mg', anchor: 'IGF-1 DES research peptide' },
  ],
  'retatrutide-glp-3': [
    { slug: 'semaglutide-glp-1', anchor: 'Semaglutide research peptide' },
    { slug: 'tirzepatide', anchor: 'Tirzepatide research peptide' },
    { slug: 'gagrilintide-5mg', anchor: 'Cagrilintide research peptide' },
    { slug: 'glp-3-pen-40mg', anchor: 'Retatrutide GLP-3 pen 40mg' },
  ],
  'glp-3-pen-40mg': [
    { slug: 'retatrutide-glp-3', anchor: 'Retatrutide research peptide' },
    { slug: 'semaglutide-glp-1', anchor: 'Semaglutide GLP-1 research peptide' },
    { slug: 'tirzepatide', anchor: 'Tirzepatide research peptide' },
    { slug: 'gagrilintide-5mg', anchor: 'Cagrilintide research peptide' },
  ],
  'tesamorelin-13mg-ipamorelin-3mg-16mg-blend': [
    { slug: 'tesamorelin', anchor: 'Tesamorelin research peptide' },
    { slug: 'ipamorelin', anchor: 'Ipamorelin research peptide' },
    { slug: 'tesamorelin-5mg-ipamorelin-5mg-10mg-total-peptide-blend', anchor: 'Tesamorelin Ipamorelin 5mg/5mg blend' },
  ],
  'semaglutide-glp-1': [
    { slug: 'retatrutide-glp-3', anchor: 'Retatrutide research peptide' },
    { slug: 'tirzepatide', anchor: 'Tirzepatide' },
  ],
  tirzepatide: [
    { slug: 'retatrutide-glp-3', anchor: 'Retatrutide' },
    { slug: 'semaglutide-glp-1', anchor: 'Semaglutide GLP-1' },
  ],
  'nad-250mg': [
    { slug: 'nad-500mg', anchor: 'NAD+ 500mg research material' },
    { slug: 'mots-c-mitochondrial-derived-peptide', anchor: 'MOTS-c research peptide' },
  ],
  'nad-500mg': [
    { slug: 'nad-250mg', anchor: 'NAD+ 250mg' },
    { slug: 'ss-31', anchor: 'SS-31 research peptide' },
  ],
  'hgh-fragment-176-191-5mg': [
    { slug: 'hgh-fragment-176-191-10mg', anchor: 'HGH Fragment 176-191 10mg' },
    { slug: 'aod-9604-5mg', anchor: 'AOD-9604 research peptide' },
  ],
  'hgh-fragment-176-191-10mg': [
    { slug: 'hgh-fragment-176-191-5mg', anchor: 'HGH Fragment 176-191' },
    { slug: 'hgh-191aa-somatropin', anchor: 'HGH 191AA Somatropin' },
  ],
  'hgh-191aa-somatropin': [
    { slug: 'hgh-fragment-176-191-5mg', anchor: 'HGH Fragment 176-191' },
    { slug: 'igf-1-lr3-1mg', anchor: 'IGF-1 LR3' },
  ],
  semax: [
    { slug: 'selank-5mg', anchor: 'Selank research peptide' },
  ],
  'selank-5mg': [
    { slug: 'semax', anchor: 'Semax research peptide' },
  ],
  'mt-2-melanotan-2-acetate-10mg': [
    { slug: 'mt-1-melanotan-1-acetate-10mg', anchor: 'Melanotan 1 research peptide' },
    { slug: 'pt-141-10mg', anchor: 'PT-141 research peptide' },
  ],
  'mt-1-melanotan-1-acetate-10mg': [
    { slug: 'mt-2-melanotan-2-acetate-10mg', anchor: 'Melanotan 2' },
  ],
  'bacteriostatic-water-0-9-benzyl-alcohol-10ml-hospira-injection-usp': [
    {
      slug: 'bacteriostatic-water-0-9-sodium-chloride-10ml-hospira-usp-injection',
      anchor: 'bacteriostatic sodium chloride water',
    },
    { href: '/peptide-calculator', anchor: 'peptide calculator' },
  ],
};

type HubRule = { pattern: RegExp; href: string; anchor: string };

const HUB_RULES: HubRule[] = [
  {
    pattern: /\bbuy peptides(?:\s+online)?(?:\s+in\s+the\s+EU|\s+UK)?\b/i,
    href: '/shop',
    anchor: 'buy research peptides online',
  },
  {
    pattern: /\bresearch peptides(?:\s+EU|\s+Europe)?\b/i,
    href: '/shop',
    anchor: 'research peptides EU',
  },
  {
    pattern: /\bpeptide calculator\b/i,
    href: '/peptide-calculator',
    anchor: 'peptide calculator',
  },
  {
    pattern: /\bbacteriostatic water\b/i,
    href: '/product/bacteriostatic-water-0-9-benzyl-alcohol-10ml-hospira-injection-usp',
    anchor: 'bacteriostatic water',
  },
  {
    pattern: /\bbac water\b/i,
    href: '/product/bacteriostatic-water-0-9-benzyl-alcohol-10ml-hospira-injection-usp',
    anchor: 'bac water',
  },
];

type Alias = { slug: string; phrase: string; href: string };

type KeywordMarketFile = {
  market_code: string;
  keywords: Array<{
    keyword: string;
    status?: string;
    volume?: number;
    best_url?: string;
  }>;
};

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function titleFromSlug(slug: string): string {
  return slug
    .replace(/-?\d+mg.*$/i, '')
    .replace(/-?\d+mcg.*$/i, '')
    .replace(/-total-peptide-blend$/i, '')
    .replace(/-peptide-blend$/i, '')
    .replace(/-acetate$/i, '')
    .replace(/-hospira.*$/i, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function isBlendSlug(slug: string): boolean {
  return /blend|glow|klow|total-peptide|\/|ipamorelin-5mg|bpc-.*-tb/i.test(slug);
}

function aliasesForSlug(slug: string): string[] {
  const out = new Set<string>();
  const blend = isBlendSlug(slug);

  // Primary identity from slug — always safe
  const primary = titleFromSlug(slug);
  if (primary.length >= 4) out.add(primary);

  if (!blend) {
    if (/^bpc-157$/i.test(slug) || slug === 'bpc-157') {
      out.add('BPC-157');
      out.add('BPC 157');
    }
    if (/thymosin-beta-4-tb500/i.test(slug)) {
      out.add('TB-500');
      out.add('TB500');
      out.add('Thymosin Beta-4');
    }
    if (/^cjc-1295-no-dac/i.test(slug) && !/ipamorelin/i.test(slug)) {
      out.add('CJC-1295 No DAC');
      out.add('CJC 1295 no DAC');
    }
    if (/cjc-1295-with-dac/i.test(slug)) {
      out.add('CJC-1295 with DAC');
      out.add('CJC 1295 with DAC');
    }
    if (/^ipamorelin$/i.test(slug)) out.add('Ipamorelin');
    if (/^ghk-cu$/i.test(slug)) {
      out.add('GHK-Cu');
      out.add('GHK Cu');
    }
    if (/^kpv$/i.test(slug)) out.add('KPV peptide');
    if (/retatrutide/i.test(slug) && !/pen/i.test(slug)) out.add('Retatrutide');
    if (/glp-3-pen/i.test(slug)) {
      out.add('GLP-3 pen');
      out.add('Retatrutide GLP-3 pen');
      out.add('Retatrutide pen');
    }
    if (/semaglutide/i.test(slug)) out.add('Semaglutide');
    if (/tirzepatide/i.test(slug)) out.add('Tirzepatide');
    if (/igf-1-lr3/i.test(slug)) {
      out.add('IGF-1 LR3');
      out.add('IGF1 LR3');
    }
    if (/igf-1-des/i.test(slug)) out.add('IGF-1 DES');
    if (/^nad-/i.test(slug)) {
      out.add('NAD⁺');
      out.add('NAD+');
    }
    if (/glutathione/i.test(slug)) {
      out.add('Glutathione peptide');
      out.add('peptide glutathione');
    }
    if (/hexarelin/i.test(slug)) out.add('Hexarelin');
    if (/peg-mgf/i.test(slug)) {
      out.add('PEG-MGF');
      out.add('PEG MGF');
    }
    if (/gonadorelin/i.test(slug)) out.add('Gonadorelin');
    if (/^aicar$/i.test(slug)) out.add('AICAR');
    if (/^semax$/i.test(slug)) out.add('Semax');
    if (/selank/i.test(slug)) out.add('Selank');
    if (/mots-c/i.test(slug)) out.add('MOTS-c');
    if (/^tesamorelin$/i.test(slug)) out.add('Tesamorelin');
    if (/hgh-fragment|176-191/i.test(slug)) {
      out.add('HGH Fragment 176-191');
      out.add('Fragment 176-191');
    }
    if (/hgh-191aa/i.test(slug)) {
      out.add('HGH 191AA');
      out.add('Somatropin');
    }
    if (/bacteriostatic-water/i.test(slug) && /benzyl/i.test(slug)) {
      out.add('bacteriostatic water');
      out.add('Hospira bacteriostatic water');
    }
    if (/ll-37/i.test(slug)) out.add('LL-37');
    if (/pt-141/i.test(slug)) out.add('PT-141');
    if (/melanotan-2|mt-2/i.test(slug)) {
      out.add('Melanotan 2');
      out.add('MT-2');
    }
    if (/melanotan-1|mt-1/i.test(slug)) {
      out.add('Melanotan 1');
      out.add('MT-1');
    }
    if (/5-amino-1mq/i.test(slug)) out.add('5-Amino-1MQ');
    if (/epithalon/i.test(slug)) out.add('Epithalon');
    if (/ss-31/i.test(slug)) out.add('SS-31');
  } else {
    // Blends: only blend-specific phrases — never steal solo compound names
    if (/glow-blend/i.test(slug)) {
      out.add('Glow blend peptide');
      out.add('Glow peptide');
      out.add('Glow Blend');
    }
    if (/klow-blend/i.test(slug)) {
      out.add('KLOW blend');
      out.add('Klow blend peptide');
    }
    if (/cjc-1295.*ipamorelin/i.test(slug)) {
      out.add('CJC 1295 Ipamorelin');
      out.add('CJC-1295 Ipamorelin blend');
      out.add('CJC 1295 ipamorelin blend');
    }
    if (/tesamorelin.*ipamorelin/i.test(slug)) {
      out.add('Tesamorelin Ipamorelin blend');
      out.add('Tesamorelin and Ipamorelin');
    }
    if (/bpc-10mg-tb-10mg|bpc-5mg-tb-5mg/i.test(slug)) {
      out.add('BPC-157 TB-500 blend');
      out.add('BPC 157 TB500 blend');
      out.add('bpc157 tb500');
    }
  }

  // Drop ultra-short / ambiguous tokens
  return [...out].filter((p) => p.length >= 5 && !/^(NAD|GLP|GH|TB|BPC)$/i.test(p));
}

function loadKeywordAliases(slugs: Set<string>): Alias[] {
  const aliases: Alias[] = [];
  const files = fs.readdirSync(KEYWORD_DIR).filter((f) => f.endsWith('.json'));
  for (const file of files) {
    const data = JSON.parse(
      fs.readFileSync(path.join(KEYWORD_DIR, file), 'utf8'),
    ) as KeywordMarketFile;
    for (const row of data.keywords || []) {
      if (row.status && row.status !== 'target') continue;
      const kw = String(row.keyword || '').trim();
      if (kw.length < 3) continue;
      // Skip pure "buy X" transactional shells when too generic — still allow compound buys
      const m = String(row.best_url || '').match(/\/product\/([^/?#]+)/);
      if (!m) continue;
      let eu = m[1];
      // Map a few known UK→EU slug differences
      const map: Record<string, string> = {
        'bacteriostatic-water-0-9-benzyl':
          'bacteriostatic-water-0-9-benzyl-alcohol-10ml-hospira-injection-usp',
        'bacteriostatic-water-0-9-sodium-chloride':
          'bacteriostatic-water-0-9-sodium-chloride-10ml-hospira-usp-injection',
        'bpc-10mg-tb-10mg-20mg': 'bpc-10mg-tb-10mg-20mg-peptide-blend',
        'cjc-1295-no-dac-5mg-ipamorelin-5mg':
          'cjc-1295-no-dac-5mg-ipamorelin-5mg-10mg-total-peptide-blend',
        'tesamorelin-5mg-ipamorelin-5mg':
          'tesamorelin-5mg-ipamorelin-5mg-10mg-total-peptide-blend',
        'gonadorelin-acetategnrh-2mg': 'gonadorelin-acetate-gnrh-2mg',
        'hcg-human-chorionic-gonadotropin': 'hcg-human-chorionic-gonadotropin-5000iu',
        'hgh-191aasomatropin': 'hgh-191aa-somatropin',
        'ipamorelin-5mg-10mg': 'ipamorelin',
        reta: 'retatrutide-glp-3',
        sema: 'semaglutide-glp-1',
        'peg-mgf-2mg': 'peg-mgf-2mg',
        'igf-1-lr3-1mg': 'igf-1-lr3-1mg',
      };
      eu = map[eu] || eu;
      if (!slugs.has(eu)) continue;
      // Prefer research framing for transactional keywords
      let phrase = kw;
      if (/^buy\s+/i.test(phrase)) {
        phrase = phrase.replace(/^buy\s+/i, '').trim();
        if (!/research/i.test(phrase)) phrase = `${phrase} research peptide`;
      }
      aliases.push({ slug: eu, phrase, href: `/product/${eu}` });
    }
  }
  return aliases;
}

function alreadyLinked(text: string, start: number, end: number): boolean {
  const before = text.slice(Math.max(0, start - 80), start);
  const after = text.slice(end, end + 80);
  // Inside existing markdown link label or URL
  if (/\[[^\]]*$/.test(before) && /^[^\]]*\]\(/.test(after)) return true;
  if (/\]\([^)]*$/.test(before) && /^[^)]*\)/.test(after)) return true;
  return false;
}

function replaceFirst(
  text: string,
  pattern: RegExp,
  href: string,
  preferredAnchor?: string,
): { text: string; linked: boolean; anchor?: string } {
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
  const re = new RegExp(pattern.source, flags);
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const start = match.index;
    const end = start + match[0].length;
    if (alreadyLinked(text, start, end)) continue;
    // Avoid matching inside headings that are product titles at the very start — still OK
    const anchor = preferredAnchor || match[0];
    const md = `[${anchor}](${href})`;
    return {
      text: text.slice(0, start) + md + text.slice(end),
      linked: true,
      anchor,
    };
  }
  return { text, linked: false };
}

function linkifyOutboundUrls(text: string, max: number): { text: string; count: number } {
  let count = 0;
  const re = /(https?:\/\/[^\s<>"')\]]+)/g;
  return {
    text: text.replace(re, (url, _o, offset: number) => {
      if (count >= max) return url;
      if (alreadyLinked(text, offset, offset + url.length)) return url;
      // Skip if already markdown-wrapped (heuristic: preceding "](" )
      if (offset >= 2 && text.slice(offset - 2, offset) === '](') return url;
      count += 1;
      let label = 'scientific reference';
      if (/pubmed/i.test(url)) label = 'PubMed reference';
      else if (/pubchem/i.test(url)) label = 'PubChem compound record';
      else if (/sciencedirect|nature\.com|science\.org|nih\.gov/i.test(url))
        label = 'peer-reviewed research reference';
      return `[${label}](${url})`;
    }),
    count,
  };
}

function countLinks(text: string): { inbound: number; outbound: number } {
  const re = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let inbound = 0;
  let outbound = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (/^https?:\/\//i.test(m[2])) outbound += 1;
    else if (m[2].startsWith('/')) inbound += 1;
  }
  return { inbound, outbound };
}

function buildAliasIndex(slugs: string[]): Alias[] {
  const set = new Set(slugs);
  const fromNames: Alias[] = [];
  for (const slug of slugs) {
    for (const phrase of aliasesForSlug(slug)) {
      fromNames.push({ slug, phrase, href: `/product/${slug}` });
    }
  }
  const fromKw = loadKeywordAliases(set).filter((a) => {
    // Drop ambiguous short / generic keyword phrases
    if (a.phrase.length < 5) return false;
    if (/^(nad|tb ?4|buy peptides)$/i.test(a.phrase)) return false;
    // If keyword is a solo compound name, don't point it at a blend
    if (isBlendSlug(a.slug) && /^(bpc[-\s]?157|tb[-\s]?500|ipamorelin|ghk[-\s]?cu|kpv|cjc[-\s]?1295)$/i.test(a.phrase)) {
      return false;
    }
    return true;
  });
  const all = [...fromNames, ...fromKw];
  // Prefer longer phrases; for equal length prefer non-blend targets
  all.sort((a, b) => {
    if (b.phrase.length !== a.phrase.length) return b.phrase.length - a.phrase.length;
    return Number(isBlendSlug(a.slug)) - Number(isBlendSlug(b.slug));
  });
  const seen = new Set<string>();
  return all.filter((a) => {
    const key = `${a.slug}::${a.phrase.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function defaultRelated(slug: string, allSlugs: string[]): RelatedLink[] {
  const hubs: RelatedLink[] = [
    {
      slug: 'bacteriostatic-water-0-9-benzyl-alcohol-10ml-hospira-injection-usp',
      anchor: 'bacteriostatic water for research peptides',
    },
    { href: '/shop', anchor: 'research peptides EU catalog' },
    { href: '/peptide-calculator', anchor: 'peptide calculator' },
  ];
  const token = slug.split('-').slice(0, 2).join('-');
  const sibling = allSlugs.find(
    (s) => s !== slug && s.startsWith(token) && !isBlendSlug(s),
  );
  const tuned = RELATED[slug] || [];
  const merged: RelatedLink[] = [];
  const seen = new Set<string>();
  for (const r of [
    ...tuned,
    ...(sibling
      ? [{ slug: sibling, anchor: `${titleFromSlug(sibling)} research peptide` }]
      : []),
    ...hubs,
  ]) {
    const key = r.href || r.slug || '';
    if (!key || seen.has(key) || key === slug) continue;
    seen.add(key);
    merged.push(r);
  }
  return merged.slice(0, 4);
}

function linkifyDescription(
  slug: string,
  raw: string,
  aliases: Alias[],
  allSlugs: string[],
): { text: string; inbound: number; outbound: number; notes: string[] } {
  const notes: string[] = [];
  let text = raw;

  // Protect the first title line from becoming a wrong inbound link
  const firstLine = (text.split('\n')[0] || '');
  const bodyStart = text.startsWith(firstLine) ? firstLine.length : 0;
  const head = text.slice(0, bodyStart);
  let body = text.slice(bodyStart);

  let inboundBudget = MAX_INBOUND;
  const usedSlugs = new Set<string>([slug]);
  const usedPhrases = new Set<string>();

  // 1) Hub phrases (inbound) — body only
  for (const hub of HUB_RULES) {
    if (inboundBudget <= 0) break;
    if (hub.href.includes(slug)) continue;
    const res = replaceFirst(body, hub.pattern, hub.href, hub.anchor);
    if (res.linked) {
      body = res.text;
      inboundBudget -= 1;
      notes.push(`hub:${hub.anchor}`);
    }
  }

  // 2) Cross-product / keyword mentions — one link per target slug
  for (const alias of aliases) {
    if (inboundBudget <= 0) break;
    if (alias.slug === slug) continue;
    if (usedSlugs.has(alias.slug)) continue;
    const phraseKey = alias.phrase.toLowerCase();
    if (usedPhrases.has(phraseKey)) continue;
    const pattern = new RegExp(`\\b${escapeRegExp(alias.phrase)}\\b`, 'i');
    const res = replaceFirst(body, pattern, alias.href, alias.phrase);
    if (res.linked) {
      body = res.text;
      inboundBudget -= 1;
      usedSlugs.add(alias.slug);
      usedPhrases.add(phraseKey);
      notes.push(`kw:${alias.phrase}->${alias.slug}`);
    }
  }

  text = head + body;

  // 3) Related section — keep inbound above outbound for every dossier
  let { inbound } = countLinks(text);
  if (inbound < MIN_INBOUND_BEFORE_RELATED) {
    const need = MIN_INBOUND_BEFORE_RELATED - inbound;
    const related = defaultRelated(slug, allSlugs)
      .filter((r) => {
        if (r.slug && (r.slug === slug || usedSlugs.has(r.slug))) return false;
        if (r.href?.includes(slug)) return false;
        return Boolean(r.slug || r.href);
      })
      .slice(0, Math.max(need, 2));
    if (related.length && !/Related Research Compounds/i.test(text)) {
      const linesOut = related.map((r) => {
        const href = r.href || `/product/${r.slug}`;
        return `• [${r.anchor}](${href})`;
      });
      const block = `\n\nRelated Research Compounds\n\n${linesOut.join('\n\n')}\n`;
      const disc = text.search(/\n(?:Research Use )?Disclaimer\b/i);
      text =
        disc > -1
          ? `${text.slice(0, disc).trimEnd()}${block}\n${text.slice(disc).trimStart()}`
          : `${text.trim()}${block}`;
      notes.push(`related-section:${related.length}`);
    }
  }

  // 4) Outbound scientific URLs
  const out = linkifyOutboundUrls(text, MAX_OUTBOUND);
  text = out.text;
  if (out.count) notes.push(`outbound:${out.count}`);

  const counts = countLinks(text);
  return { text: text.trim() + '\n', ...counts, notes };
}

async function main() {
  const fromDb = process.argv.includes('--from-db');
  const slugsArg = process.argv.find((a) => a.startsWith('--slugs='));
  const onlySlugs = slugsArg
    ? slugsArg
        .slice('--slugs='.length)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : null;

  let payloads: Record<string, string> = {};
  if (fromDb || onlySlugs) {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(url, key);
    let q = supabase.from('products').select('slug, description');
    if (onlySlugs?.length) q = q.in('slug', onlySlugs);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    for (const row of data || []) {
      if (row.slug && row.description) payloads[row.slug] = String(row.description);
    }
    // Alias index still needs the full synced catalog for cross-links
    if (fs.existsSync(PAYLOAD_PATH)) {
      const filePayloads = JSON.parse(fs.readFileSync(PAYLOAD_PATH, 'utf8')) as Record<string, string>;
      for (const [slug, desc] of Object.entries(filePayloads)) {
        if (!(slug in payloads)) payloads[slug] = desc;
      }
      // When --slugs is set, only transform those rows (keep others for alias graph only)
      if (onlySlugs?.length) {
        const aliasSlugs = Object.keys(payloads);
        const aliases = buildAliasIndex(aliasSlugs);
        const results: Record<string, { inbound: number; outbound: number; notes: string[]; preview?: string }> = {};
        const updated: Record<string, string> = {};
        for (const slug of onlySlugs) {
          const raw = payloads[slug];
          if (!raw) {
            console.warn('missing description', slug);
            continue;
          }
          const { text, inbound, outbound, notes } = linkifyDescription(slug, raw, aliases, aliasSlugs);
          updated[slug] = text;
          results[slug] = { inbound, outbound, notes, preview: text.slice(0, 400) };
        }
        await finish(updated, results, APPLY);
        return;
      }
    }
  } else {
    payloads = JSON.parse(fs.readFileSync(PAYLOAD_PATH, 'utf8')) as Record<string, string>;
  }

  const slugs = Object.keys(payloads);
  const aliases = buildAliasIndex(slugs);

  const results: Record<
    string,
    { inbound: number; outbound: number; notes: string[]; preview?: string }
  > = {};
  const updated: Record<string, string> = {};

  let i = 0;
  for (const slug of slugs) {
    if (i >= LIMIT) break;
    i += 1;
    const { text, inbound, outbound, notes } = linkifyDescription(
      slug,
      payloads[slug],
      aliases,
      slugs,
    );
    updated[slug] = text;
    results[slug] = {
      inbound,
      outbound,
      notes,
      preview: text.slice(0, 400),
    };
  }

  await finish(updated, results, APPLY);
}

async function finish(
  updated: Record<string, string>,
  results: Record<string, { inbound: number; outbound: number; notes: string[]; preview?: string }>,
  apply: boolean,
) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPayload = path.join(OUT_DIR, 'linkified-description-payloads.json');
  const outReport = path.join(OUT_DIR, 'linkified-description-report.json');
  fs.writeFileSync(outPayload, JSON.stringify(updated, null, 2));
  fs.writeFileSync(outReport, JSON.stringify(results, null, 2));

  const totals = Object.values(results).reduce(
    (acc, r) => {
      acc.inbound += r.inbound;
      acc.outbound += r.outbound;
      return acc;
    },
    { inbound: 0, outbound: 0 },
  );
  const n = Math.max(Object.keys(results).length, 1);

  console.log(
    JSON.stringify(
      {
        mode: apply ? 'apply' : 'dry-run',
        products: Object.keys(results).length,
        totals,
        avgInbound: +(totals.inbound / n).toFixed(2),
        avgOutbound: +(totals.outbound / n).toFixed(2),
        results,
        outPayload,
        outReport,
      },
      null,
      2,
    ),
  );

  if (!apply) {
    console.log('Dry-run only. Re-run with --apply to write Supabase.');
    return;
  }

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  }
  const supabase = createClient(url, key);
  const applyLog: Array<{ slug: string; ok: boolean; error?: string }> = [];

  for (const [slug, description] of Object.entries(updated)) {
    const { data, error } = await supabase
      .from('products')
      .update({ description })
      .eq('slug', slug)
      .select('slug');
    if (error) applyLog.push({ slug, ok: false, error: error.message });
    else if (!data?.length) applyLog.push({ slug, ok: false, error: 'missing row' });
    else applyLog.push({ slug, ok: true });
  }

  fs.writeFileSync(
    path.join(OUT_DIR, 'linkified-description-apply.json'),
    JSON.stringify({ applied_at: new Date().toISOString(), applyLog }, null, 2),
  );
  console.log(
    'Applied',
    applyLog.filter((r) => r.ok).length,
    '/',
    applyLog.length,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
