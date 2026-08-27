import { HomeProductSegment } from './HomeProductSegment';
import { useHomeCatalog } from '../../hooks/useHomeCatalog';

export function FeaturedProductsSection() {
  const { featured, loading } = useHomeCatalog();

  return (
    <HomeProductSegment
      eyebrow="Featured compounds"
      title={
        <>
          Laboratory-proven{' '}
          <span className="text-brand-600">research formulations</span>
        </>
      }
      description="Top-rated sequences with documented purity profiles — engineered for metabolic, cognitive, and regenerative research models."
      href="/shop"
      ctaLabel="Full catalog"
      products={featured}
      loading={loading}
      tone="mist"
    />
  );
}
