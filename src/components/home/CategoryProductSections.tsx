import { useTranslation } from 'react-i18next';
import { HomeProductSegment } from './HomeProductSegment';
import { useHomeCatalog } from '../../hooks/useHomeCatalog';
import { categoryPath } from '../../lib/categoryUrl';
import { localizedCategoryName } from '../../lib/localizedCategory';
import type { LocaleCode } from '../../i18n/locales';

export function CategoryProductSections() {
  const { i18n } = useTranslation();
  const locale = i18n.language as LocaleCode;
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
      {categoryRails.map((rail, index) => {
        const name = localizedCategoryName(rail.category, locale);
        return (
          <HomeProductSegment
            key={rail.category.slug}
            eyebrow="Research line"
            title={
              <>
                {name}{' '}
                <span className="text-brand-600">compounds</span>
              </>
            }
            description={`Selected ${name.toLowerCase()} peptides for in-vitro laboratory research.`}
            href={categoryPath(rail.category.slug)}
            ctaLabel={`View ${name}`}
            products={rail.products}
            loading={false}
            tone={index % 2 === 0 ? 'light' : 'mist'}
            skeletonCount={4}
          />
        );
      })}
    </>
  );
}
