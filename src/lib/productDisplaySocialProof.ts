/**
 * Stable per-product display rating + review count for storefront social proof.
 * Seeded by product id so values do not flicker across reloads.
 *
 * Rating: 3.0 | 3.5 | 4.0 | 4.5
 * Reviews: 25–50 inclusive
 */
const RATING_STEPS = [3, 3.5, 4, 4.5] as const;

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export type ProductDisplaySocialProof = {
  rating: number;
  reviewCount: number;
};

export function productDisplaySocialProof(
  productId: string | number | null | undefined,
): ProductDisplaySocialProof {
  const seed = hashSeed(String(productId ?? 'product'));
  const rating = RATING_STEPS[seed % RATING_STEPS.length]!;
  const reviewCount = 25 + (seed % 26); // 25..50
  return { rating, reviewCount };
}
