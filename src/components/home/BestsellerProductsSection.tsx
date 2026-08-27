import { HomeProductSegment } from './HomeProductSegment';
import { useHomeCatalog } from '../../hooks/useHomeCatalog';

export function BestsellerProductsSection() {
  const { bestsellers, loading } = useHomeCatalog();

  return (
    <HomeProductSegment
      eyebrow="Laboratory favourites"
      title={
        <>
          Most requested{' '}
          <span className="text-brand-600">research peptides</span>
        </>
      }
      description="High-demand sequences selected from researcher orders, reviews, and repeat laboratory procurement."
      href="/shop"
      ctaLabel="Shop bestsellers"
      products={bestsellers}
      loading={loading}
      tone="mist"
    />
  );
}
