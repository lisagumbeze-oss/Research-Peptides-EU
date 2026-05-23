import { Link } from 'react-router-dom';
import { formatCurrency } from '../../lib/utils';
import { productPath } from '../../lib/productUrl';
import { ProductImagePlaceholder } from '../products/ProductImagePlaceholder';
import { Container } from '../../design-system';
import { ProductCard } from '../products/ProductCard';
import type { CatalogProduct } from '../products/ProductCard';

type ProductRecommendationsProps = {
  recommended: CatalogProduct[];
  recentlyViewed: CatalogProduct[];
  inWishlist: (id: string) => boolean;
  onToggleWishlist: (id: string, e: React.MouseEvent) => void;
  onAddToCart: (product: CatalogProduct) => void;
};

export function ProductRecommendations({
  recommended,
  recentlyViewed,
  inWishlist,
  onToggleWishlist,
  onAddToCart,
}: ProductRecommendationsProps) {
  return (
    <Container className="pb-16 space-y-16">
      {recommended.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-h2 font-display font-bold text-navy-950">Related research compounds</h2>
            <Link to="/shop" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              View catalog →
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {recommended.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                inWishlist={inWishlist(product.id)}
                onToggleWishlist={(e) => onToggleWishlist(product.id, e)}
                onAddToCart={() => onAddToCart(product)}
              />
            ))}
          </div>
        </section>
      )}

      {recentlyViewed.length > 0 && (
        <section className="pt-12 border-t border-brand-100">
          <h2 className="text-caption text-brand-600 mb-6">Recently viewed</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recentlyViewed.map((rv) => (
              <Link
                key={rv.id}
                to={productPath(rv)}
                className="shrink-0 w-44 group"
              >
                <div className="h-44 rounded-2xl overflow-hidden bg-mist-50 border border-brand-50 group-hover:shadow-elevated transition-shadow">
                  {rv.images?.[0] ? (
                    <img
                      src={rv.images[0]}
                      alt={rv.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <ProductImagePlaceholder
                      productId={String(rv.id)}
                      title={rv.title}
                      className="h-full min-h-full"
                    />
                  )}
                </div>
                <h3 className="mt-2 text-sm font-semibold text-navy-950 line-clamp-1 group-hover:text-brand-600">
                  {rv.title}
                </h3>
                <p className="text-xs text-brand-600 font-semibold tabular-nums mt-0.5">
                  {formatCurrency(rv.price)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
