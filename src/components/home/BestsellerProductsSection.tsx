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
      description="Led by Tirzepatide and Semaglutide — how much for bestsellers in the UK, Italy, and Spain? Our most requested research peptides from laboratory orders and repeat procurement across Europe."
      href="/shop"
      ctaLabel="Shop bestsellers"
      products={bestsellers}
      loading={loading}
      tone="mist"
    />
  );
}
