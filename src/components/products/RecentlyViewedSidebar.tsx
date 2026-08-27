import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { History, X, ChevronRight } from 'lucide-react';
import { LocaleLink } from '../../i18n/LocaleLink';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../supabase';
import { ProductImagePlaceholder } from './ProductImagePlaceholder';
import { productPath } from '../../lib/productUrl';
import { slideFromRightMotion } from '../../design-system/motion';
import type { CatalogProduct } from './ProductCard';
import { cn } from '../../lib/utils';

type RecentProduct = Pick<CatalogProduct, 'id' | 'title' | 'images' | 'price'>;

export default function RecentlyViewedSidebar() {
  const [products, setProducts] = useState<RecentProduct[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const panel = slideFromRightMotion(Boolean(reduceMotion));

  useEffect(() => {
    const fetchRecent = async () => {
      const stored = localStorage.getItem('recentlyViewed');
      if (stored) {
        const ids = JSON.parse(stored);
        if (ids.length > 0) {
          const { data } = await supabase
            .from('products')
            .select('id, title, images, price')
            .in('id', ids.slice(0, 5));

          if (data) {
            const sortedData = ids
              .map((id: string) => data.find((p) => p.id === id))
              .filter(Boolean) as RecentProduct[];
            setProducts(sortedData);
            setIsVisible(true);
          }
        }
      }
    };

    fetchRecent();
  }, [location.pathname]);

  useEffect(() => {
    if (!isExpanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsExpanded(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isExpanded]);

  if (!isVisible || products.length === 0) return null;

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden lg:flex items-center">
      <button
        type="button"
        onClick={() => setIsExpanded((open) => !open)}
        aria-expanded={isExpanded}
        aria-controls="recently-viewed-rail"
        aria-label={isExpanded ? 'Collapse recently viewed' : 'Recently viewed products'}
        className={cn(
          'bg-white border border-brand-100 p-2 rounded-l-xl shadow-card',
          'text-steel-600 hover:bg-brand-50 hover:text-brand-600 transition-colors',
        )}
      >
        {isExpanded ? <ChevronRight className="h-5 w-5" aria-hidden /> : <History className="h-5 w-5" aria-hidden />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id="recently-viewed-rail"
            {...panel}
            className="bg-white border-l border-t border-b border-brand-100 rounded-l-3xl shadow-elevated p-4 w-24 flex flex-col items-center gap-4"
          >
            <p className="text-caption text-center">History</p>
            {products.map((product) => (
              <LocaleLink key={product.id} to={productPath(product)} className="relative group">
                <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-transparent group-hover:border-brand-500 transition-colors shadow-card">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
                    />
                  ) : (
                    <ProductImagePlaceholder
                      productId={String(product.id)}
                      title={product.title}
                      className="h-full w-full min-h-12"
                      compact
                      monogram={false}
                    />
                  )}
                </div>
                <span className="absolute right-14 top-1/2 -translate-y-1/2 bg-navy-950 text-white text-[10px] font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-elevated">
                  {product.title}
                </span>
              </LocaleLink>
            ))}
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('recentlyViewed');
                setProducts([]);
                setIsVisible(false);
              }}
              className="mt-2 p-2 rounded-lg text-silver-400 hover:text-error hover:bg-red-50 transition-colors"
              aria-label="Clear recently viewed"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
