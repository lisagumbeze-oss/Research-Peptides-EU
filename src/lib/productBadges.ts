import type { BadgeType } from '../components/products/ProductBadge';

function isRecent(createdAt?: string): boolean {
  if (!createdAt) return false;
  const ts = Date.parse(createdAt);
  if (Number.isNaN(ts)) return false;
  const days = (Date.now() - ts) / (1000 * 60 * 60 * 24);
  return days <= 21;
}

export function productHasSale(product: {
  price?: number;
  compare_at_price?: number;
  compare_at?: number;
}): boolean {
  const price = Number(product.price) || 0;
  const compareAt = Number(product.compare_at_price ?? product.compare_at) || 0;
  return compareAt > price && price > 0;
}

export function getPrimaryProductBadge(product: {
  price?: number;
  compare_at_price?: number;
  compare_at?: number;
  rating?: number;
  review_count?: number;
  created_at?: string;
}): BadgeType | null {
  if (productHasSale(product)) return 'sale';
  const rating = Number(product.rating) || 0;
  const reviews = Number(product.review_count) || 0;
  if (rating >= 4.7 && reviews >= 12) return 'bestseller';
  if (isRecent(product.created_at)) return 'new';
  return null;
}
