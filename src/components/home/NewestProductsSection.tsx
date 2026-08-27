import { HomeProductSegment } from './HomeProductSegment';
import { useHomeCatalog } from '../../hooks/useHomeCatalog';

export function NewestProductsSection() {
  const { newest, loading } = useHomeCatalog();

  return (
    <HomeProductSegment
      eyebrow="New arrivals"
      title={
        <>
          Recently added to the{' '}
          <span className="text-brand-600">research catalog</span>
        </>
      }
      description="Newly listed compounds for laboratories expanding metabolic, recovery, and analytical workflows."
      href="/shop"
      ctaLabel="Browse newest"
      products={newest}
      loading={loading}
      tone="light"
    />
  );
}
