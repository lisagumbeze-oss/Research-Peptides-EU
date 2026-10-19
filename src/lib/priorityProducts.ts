/**
 * Business-priority catalog products (highest-selling).
 * Used to pin homepage rails, boost featured sort, and bias related recommendations.
 */

export const PRIORITY_PRODUCT_SLUGS = [
  'tirzepatide',
  'semaglutide',
  'semaglutide-glp-1',
] as const;

export type PriorityProductSlug = (typeof PRIORITY_PRODUCT_SLUGS)[number];

const PRIORITY_RANK = new Map<string, number>(
  PRIORITY_PRODUCT_SLUGS.map((slug, index) => [slug, index]),
);

export function isPriorityProductSlug(slug: string | null | undefined): boolean {
  if (!slug) return false;
  return PRIORITY_RANK.has(slug.trim().toLowerCase());
}

/** Lower number = higher priority. Non-priority products return Number.POSITIVE_INFINITY. */
export function priorityRank(slug: string | null | undefined): number {
  if (!slug) return Number.POSITIVE_INFINITY;
  return PRIORITY_RANK.get(slug.trim().toLowerCase()) ?? Number.POSITIVE_INFINITY;
}

export function compareByPrioritySlug(
  a: { slug?: string | null },
  b: { slug?: string | null },
): number {
  return priorityRank(a.slug) - priorityRank(b.slug);
}

/** Move priority products to the front (stable for non-priority order). */
export function pinPriorityProducts<T extends { slug?: string | null }>(items: T[]): T[] {
  const priority: T[] = [];
  const rest: T[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const slug = item.slug?.trim().toLowerCase();
    if (slug && PRIORITY_RANK.has(slug) && !seen.has(slug)) {
      priority.push(item);
      seen.add(slug);
    } else {
      rest.push(item);
    }
  }

  priority.sort(compareByPrioritySlug);
  return [...priority, ...rest];
}
