const GRADIENTS = [
  'bg-gradient-to-br from-slate-200 via-slate-50 to-blue-100',
  'bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100',
  'bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100',
  'bg-gradient-to-br from-violet-100 via-indigo-50 to-blue-100',
  'bg-gradient-to-br from-stone-200 via-neutral-100 to-zinc-100',
  'bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100',
  'bg-gradient-to-br from-fuchsia-100 via-purple-50 to-blue-50',
  'bg-gradient-to-br from-lime-100 via-green-50 to-emerald-100',
  'bg-gradient-to-br from-rose-100 via-pink-50 to-orange-50',
  'bg-gradient-to-br from-cyan-100 via-blue-50 to-indigo-100',
] as const;

function hashToIndex(seed: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h) % mod;
}

export function productPlaceholderGradientClass(productId: string, title: string): string {
  const idx = hashToIndex(String(productId || title), GRADIENTS.length);
  return GRADIENTS[idx];
}

/** Lowest / highest display prices for listing cards. */
export function productCardPriceRange(product: {
  price?: number;
  variants?: Array<{ display_price?: number }>;
}): { min: number; max: number } {
  const base = Number(product.price);
  let min = Number.isNaN(base) ? 0 : base;
  let max = min;
  if (product.variants?.length) {
    for (const v of product.variants) {
      const dp = Number(v.display_price);
      if (!Number.isNaN(dp)) {
        min = Math.min(min, dp);
        max = Math.max(max, dp);
      }
    }
  }
  return { min, max };
}

/**
 * Optional “was” price for cards: product.compare_at_price, or single-variant original_price / regular_price.
 */
export function productListCompareAtPrice(product: {
  price?: number;
  compare_at_price?: number;
  compare_at?: number;
  variants?: Array<{ display_price?: number; original_price?: number; regular_price?: number }>;
}): number | null {
  const { min } = productCardPriceRange(product);
  const top = Number(product.compare_at_price ?? product.compare_at);
  if (Number.isFinite(top) && top > min) return top;

  if (product.variants?.length === 1) {
    const v = product.variants[0];
    const op = Number(v.original_price ?? v.regular_price);
    const dp = Number(v.display_price ?? product.price);
    if (Number.isFinite(op) && Number.isFinite(dp) && op > dp) return op;
  }

  return null;
}
