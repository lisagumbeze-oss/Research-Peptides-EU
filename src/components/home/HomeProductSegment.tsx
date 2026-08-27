import type { ReactNode } from 'react';
import { LocaleLink } from '../../i18n/LocaleLink';
import { ArrowRight } from 'lucide-react';
import { Container, Section, buttonClassName } from '../../design-system';
import { ProductGrid } from '../catalog/ProductGrid';
import { useProductCatalogActions } from '../../hooks/useProductCatalogActions';
import { SectionHeading } from './SectionHeading';
import type { CatalogProduct } from '../products/ProductCard';

type HomeProductSegmentProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  href: string;
  ctaLabel: string;
  products: CatalogProduct[];
  loading: boolean;
  tone?: 'mist' | 'light';
  skeletonCount?: number;
};

export function HomeProductSegment({
  eyebrow,
  title,
  description,
  href,
  ctaLabel,
  products,
  loading,
  tone = 'mist',
  skeletonCount = 8,
}: HomeProductSegmentProps) {
  const { isInWishlist, handleToggleWishlist, handleAddToCart } = useProductCatalogActions();

  if (!loading && products.length === 0) return null;

  return (
    <Section size="lg" tone={tone}>
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <SectionHeading eyebrow={eyebrow} title={title} description={description} />
          <LocaleLink
            to={href}
            className={buttonClassName({
              variant: tone === 'light' ? 'primary' : 'outline',
              className: 'shrink-0 whitespace-nowrap',
            })}
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </LocaleLink>
        </div>

        <ProductGrid
          products={products}
          loading={loading}
          skeletonCount={skeletonCount}
          gridClassName="grid-cols-2 lg:grid-cols-4"
          inWishlist={isInWishlist}
          onToggleWishlist={handleToggleWishlist}
          onAddToCart={handleAddToCart}
        />
      </Container>
    </Section>
  );
}
