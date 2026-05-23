import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../../supabase';
import { Container, Section, Button } from '../../design-system';
import { ProductGrid } from '../catalog/ProductGrid';
import { useProductCatalogActions } from '../../hooks/useProductCatalogActions';
import { SectionHeading } from './SectionHeading';
import type { CatalogProduct } from '../products/ProductCard';

export function FeaturedProductsSection() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { isInWishlist, handleToggleWishlist, handleAddToCart } = useProductCatalogActions();

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('rating', { ascending: false })
        .limit(4);
      if (data) setProducts(data as CatalogProduct[]);
      setLoading(false);
    })();
  }, []);

  return (
    <Section size="lg" tone="mist">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <SectionHeading
            eyebrow="Featured compounds"
            title={
              <>
                Laboratory-proven{' '}
                <span className="text-brand-600">research formulations</span>
              </>
            }
            description="Top-rated sequences with documented purity profiles — engineered for metabolic, cognitive, and regenerative research models."
          />
          <Link to="/shop" className="shrink-0">
            <Button variant="outline" className="gap-2">
              Full catalog
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <ProductGrid
          products={products}
          loading={loading}
          skeletonCount={4}
          inWishlist={isInWishlist}
          onToggleWishlist={handleToggleWishlist}
          onAddToCart={handleAddToCart}
        />
      </Container>
    </Section>
  );
}
