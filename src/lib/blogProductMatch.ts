import { priorityRank } from './priorityProducts';
import { slugifyProductName } from './productUrl';

export type BlogMatchableProduct = {
  id: string;
  title: string;
  slug?: string | null;
  images?: string[] | null;
};

export type MatchedBlogProduct = BlogMatchableProduct & {
  matchName: string;
  imageUrl: string;
  titleIndex: number;
};

const MATCH_STOP_SEGMENTS = new Set([
  'blend',
  'fragment',
  'gcgr',
  'gip',
  'glp',
  'list',
  'mg',
  'mcg',
  'iu',
  'ml',
  'one',
  'peptide',
  'peptides',
  'powder',
  'research',
  'vial',
]);

/** Strip dosage / marketing suffixes so "Semaglutide - GLP-1" → "semaglutide". */
export function productMatchName(product: { title?: string | null; slug?: string | null }): string {
  const slug = String(product.slug || '')
    .trim()
    .toLowerCase();
  if (slug) {
    const parts = slug.split('-').filter(Boolean);
    const kept: string[] = [];
    for (const part of parts) {
      if (MATCH_STOP_SEGMENTS.has(part) || /^glp\d*$/i.test(part)) break;
      if (/^\d+(\.\d+)?(mg|mcg|iu|ml)$/i.test(part)) break;
      // Keep numeric peptide codes (bpc-157, tb-500); stop after the compound name otherwise.
      if (/^\d+(\.\d+)?$/.test(part) && kept.length > 0) {
        if (Number(part) >= 1000) break;
        kept.push(part);
        continue;
      }
      kept.push(part);
    }
    if (kept.length) return kept.join(' ');
  }

  return String(product.title || '')
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .replace(/\s+[-–—|:]\s+.*$/, ' ')
    .replace(/\b\d+(\.\d+)?\s?(mg|mcg|iu|ml)\b/gi, ' ')
    .replace(/\b(glp-?\d+|gip|gcgr|research|peptide|peptides|blend|vial|powder)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** True when `name` appears in `title` as a whole token (hyphens/spaces interchangeable). */
export function titleMentionsProduct(title: string, name: string): boolean {
  const needle = name.trim().toLowerCase();
  if (needle.length < 3) return false;

  const haystack = String(title || '').toLowerCase();
  const pattern = needle
    .split(/[\s-]+/)
    .filter(Boolean)
    .map(escapeRegExp)
    .join('[-\\s]?');

  if (!pattern) return false;
  return new RegExp(`(?<![a-z0-9])${pattern}(?![a-z0-9])`, 'i').test(haystack);
}

function titleIndexOf(title: string, name: string): number {
  const haystack = String(title || '').toLowerCase();
  const parts = name.trim().toLowerCase().split(/[\s-]+/).filter(Boolean);
  if (!parts.length) return -1;

  // Prefer the earliest occurrence of the first significant token.
  return haystack.indexOf(parts[0]);
}

function productImageUrl(product: BlogMatchableProduct): string | null {
  const url = product.images?.find((src) => typeof src === 'string' && src.trim());
  return url?.trim() || null;
}

function preferProduct(a: MatchedBlogProduct, b: MatchedBlogProduct): MatchedBlogProduct {
  const rankDiff = priorityRank(a.slug) - priorityRank(b.slug);
  if (rankDiff !== 0) return rankDiff < 0 ? a : b;

  const titleLenDiff = a.title.length - b.title.length;
  if (titleLenDiff !== 0) return titleLenDiff < 0 ? a : b;

  return a.matchName.length >= b.matchName.length ? a : b;
}

/**
 * Products whose names appear in the blog title, ordered by first mention.
 * Dedupes near-identical compounds (e.g. Tirzepatide vs Tirzepatide 100mg).
 */
export function matchProductsInBlogTitle(
  title: string,
  products: BlogMatchableProduct[],
): MatchedBlogProduct[] {
  const matches: MatchedBlogProduct[] = [];

  for (const product of products) {
    const imageUrl = productImageUrl(product);
    if (!imageUrl) continue;

    const matchName = productMatchName(product);
    if (!titleMentionsProduct(title, matchName)) continue;

    const titleIndex = titleIndexOf(title, matchName);
    if (titleIndex < 0) continue;

    matches.push({ ...product, matchName, imageUrl, titleIndex });
  }

  // Keep the best product per normalized match name.
  const byName = new Map<string, MatchedBlogProduct>();
  for (const match of matches) {
    const key = match.matchName.replace(/\s+/g, ' ');
    const existing = byName.get(key);
    byName.set(key, existing ? preferProduct(existing, match) : match);
  }

  return Array.from(byName.values()).sort(
    (a, b) => a.titleIndex - b.titleIndex || a.matchName.length - b.matchName.length,
  );
}

export function resolveBlogCoverImage(
  title: string | null | undefined,
  fallbackImageUrl: string | null | undefined,
  products: BlogMatchableProduct[],
): string | null {
  const matched = matchProductsInBlogTitle(String(title || ''), products);
  return matched[0]?.imageUrl || fallbackImageUrl || null;
}

/**
 * Insert product images into markdown when the title names catalog products.
 * Skips URLs already present in the body.
 */
export function injectProductImagesIntoBlogContent(
  title: string | null | undefined,
  content: string,
  products: BlogMatchableProduct[],
): string {
  const matched = matchProductsInBlogTitle(String(title || ''), products);
  if (!matched.length) return content;

  const missing = matched.filter((product) => !content.includes(product.imageUrl));
  if (!missing.length) return content;

  const block = missing
    .map((product) => {
      const alt = product.title.trim() || product.matchName;
      const href = product.slug
        ? `/product/${product.slug}`
        : `/product/${slugifyProductName(product.title)}`;
      return `[![${alt}](${product.imageUrl})](${href})`;
    })
    .join('\n\n');

  const trimmed = String(content || '').trim();
  if (!trimmed) return block;

  const parts = trimmed.split(/\n{2,}/);
  if (parts.length === 1) return `${parts[0]}\n\n${block}`;
  return [parts[0], block, ...parts.slice(1)].join('\n\n');
}
