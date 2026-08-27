import { HomeProductSegment } from './HomeProductSegment';
import { useHomeCatalog } from '../../hooks/useHomeCatalog';

export function CategoryProductSections() {
  const { categoryRails, loading } = useHomeCatalog();

  if (!loading && categoryRails.length === 0) return null;

  if (loading) {
    return (
      <>
        <HomeProductSegment
          eyebrow="Research line"
          title="Category spotlight"
          description="Featured compounds grouped by laboratory application."
          href="/categories"
          ctaLabel="All categories"
          products={[]}
          loading
          tone="light"
          skeletonCount={4}
        />
      </>
    );
  }

  return (
    <>
      {categoryRails.map((rail, index) => (
        <HomeProductSegment
          key={rail.category.slug}
          eyebrow="Research line"
          title={
            <>
              {rail.category.name}{' '}
              <span className="text-brand-600">compounds</span>
            </>
          }
          description={`Selected ${rail.category.name.toLowerCase()} peptides for in-vitro laboratory research.`}
          href={`/search?category=${rail.category.slug}`}
          ctaLabel={`View ${rail.category.name}`}
          products={rail.products}
          loading={false}
          tone={index % 2 === 0 ? 'light' : 'mist'}
          skeletonCount={4}
        />
      ))}
    </>
  );
}
