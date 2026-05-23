import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import type { CatalogProduct } from '../components/products/ProductCard';

export function useProductCatalogActions() {
  const addItem = useCartStore((s) => s.addItem);
  const { productIds, toggleWishlist } = useWishlistStore();
  const { user } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);

  const isInWishlist = (id: string) => productIds.includes(id);

  const handleToggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(productId, user?.id || '');
  };

  const handleAddToCart = (product: CatalogProduct) => {
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      imageUrl: product.images?.[0] || '',
    });
    addToast(`${product.title} added to cart`);
  };

  return { isInWishlist, handleToggleWishlist, handleAddToCart };
}
