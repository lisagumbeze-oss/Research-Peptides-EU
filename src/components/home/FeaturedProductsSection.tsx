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
      description="How to buy Tirzepatide in the Netherlands? Where can I buy Semaglutide in Germany? Priority compounds with documented purity for metabolic and regenerative laboratory models — plus how much for other top-rated sequences across the EU."
      href="/shop"
      ctaLabel="Full catalog"
      products={featured}
      loading={loading}
      tone="mist"
    />
  );
}
