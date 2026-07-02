import { ProductCard, type CatalogProduct } from '../products/ProductCard';
import { ProductSkeleton } from '../Skeleton';
import { cn } from '../../lib/utils';

const defaultGridClass = 'grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4';

type ProductGridProps = {
  products: CatalogProduct[];
  loading?: boolean;
  skeletonCount?: number;
  showDescription?: boolean;
  gridClassName?: string;
  inWishlist: (id: string) => boolean;
  onToggleWishlist: (productId: string, e: React.MouseEvent) => void;
  onAddToCart: (product: CatalogProduct) => void;
};

export function ProductGrid({
  products,
  loading = false,
  skeletonCount = 8,
  showDescription = false,
  gridClassName = defaultGridClass,
  inWishlist,
  onToggleWishlist,
  onAddToCart,
}: ProductGridProps) {
  const gridClass = cn('grid gap-4 md:gap-6', gridClassName);

  if (loading) {
    return (
      <div className={gridClass}>
        {[...Array(skeletonCount)].map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
          showDescription={showDescription}
          inWishlist={inWishlist(product.id)}
          onToggleWishlist={(e) => onToggleWishlist(product.id, e)}
          onAddToCart={() => onAddToCart(product)}
        />
      ))}
    </div>
  );
}
