/** Shared catalog sort keys aligned with ecommerce-webapps skill (Featured, Best rated, etc.). */

export type CatalogSortKey =
  | 'featured'
  | 'rating-desc'
  | 'newest'
  | 'price-asc'
  | 'price-desc';

type SortableProduct = {
  price?: number;
  rating?: number;
  review_count?: number;
  created_at?: string;
};

/** Featured = weighted by rating × √(reviews + 1) so high-rated, well-reviewed items surface first. */
export function featuredScore(p: SortableProduct): number {
  const r = Number(p.rating) || 0;
  const c = Number(p.review_count) || 0;
  return r * Math.sqrt(c + 1);
}

export function sortProducts<T extends SortableProduct>(items: T[], sortBy: CatalogSortKey): T[] {
  const copy = [...items];

  switch (sortBy) {
    case 'featured':
      copy.sort((a, b) => featuredScore(b) - featuredScore(a));
      break;
    case 'rating-desc':
      copy.sort((a, b) => {
        const ra = Number(a.rating) || 0;
        const rb = Number(b.rating) || 0;
        if (rb !== ra) return rb - ra;
        return (Number(b.review_count) || 0) - (Number(a.review_count) || 0);
      });
      break;
    case 'price-asc':
      copy.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
      break;
    case 'price-desc':
      copy.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
      break;
    case 'newest':
    default:
      copy.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
      break;
  }

  return copy;
}
