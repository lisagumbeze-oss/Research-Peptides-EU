import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Search, X, ShoppingCart, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { useSearchStore } from '../../store/useSearchStore';
import { useCartStore } from '../../store/useCartStore';
import { supabase } from '../../supabase';
import { cn, formatCurrency } from '../../lib/utils';
import { LocaleLink } from '../../i18n/LocaleLink';
import { ProductImagePlaceholder } from '../products/ProductImagePlaceholder';
import type { CatalogProduct } from '../products/ProductCard';
import { productPath } from '../../lib/productUrl';
import { modalMotion, overlayMotion } from '../../design-system/motion';
import { useFocusTrap } from '../../hooks/useFocusTrap';

const POPULAR_SEARCHES = ['BPC-157', 'TB-500', 'Semaglutide', 'CJC-1295', 'AOD-9604'];

export default function Omnisearch() {
  const { isOpen, closeSearch } = useSearchStore();
  const { addItem } = useCartStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const overlay = overlayMotion(Boolean(reduceMotion));
  const panel = modalMotion(Boolean(reduceMotion));

  useFocusTrap(isOpen, panelRef, closeSearch);

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setResults([]);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    const handleSearch = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .ilike('title', `%${query}%`)
          .limit(6);

        if (error) throw error;
        setResults((data as CatalogProduct[]) || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
          <motion.button
            type="button"
            {...overlay}
            onClick={closeSearch}
            className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm"
            aria-label="Close search"
            tabIndex={-1}
          />

          <motion.div
            ref={panelRef}
            {...panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="omnisearch-title"
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-elevated overflow-hidden border border-brand-100"
          >
            <h2 id="omnisearch-title" className="sr-only">
              Search catalog
            </h2>

            <div className="relative p-5 md:p-6 border-b border-brand-100">
              <label htmlFor="omnisearch-input" className="sr-only">
                Search compounds
              </label>
              <Search
                className="pointer-events-none absolute left-9 md:left-10 top-1/2 -translate-y-1/2 h-5 w-5 text-silver-400"
                aria-hidden
              />
              <input
                id="omnisearch-input"
                ref={inputRef}
                type="search"
                autoComplete="off"
                placeholder="Search compounds, peptides, or categories..."
                className={cn(
                  'w-full bg-mist-50 rounded-2xl pl-12 pr-12 py-3.5 text-base font-medium',
                  'text-navy-950 placeholder:text-silver-400',
                  'border border-silver-400/30',
                  'focus:outline-none focus:ring-2 focus:ring-brand-400/50 focus:border-brand-500',
                )}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="button"
                onClick={closeSearch}
                className="absolute right-8 md:right-9 top-1/2 -translate-y-1/2 p-2 rounded-xl text-steel-600 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              className="max-h-[60vh] overflow-y-auto p-4"
              role="region"
              aria-live="polite"
              aria-busy={loading}
            >
              {loading ? (
                <div className="space-y-2" role="status">
                  <span className="sr-only">Searching catalog</span>
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4">
                      <div className="skeleton-block h-16 w-16 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="skeleton-block h-4 w-2/3" />
                        <div className="skeleton-block h-3 w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-1">
                  <p className="px-3 mb-2 text-caption text-brand-600 flex items-center gap-2">
                    <Sparkles className="h-3 w-3" aria-hidden />
                    Exact matches
                  </p>
                  <ul className="space-y-1">
                    {results.map((product) => (
                      <li
                        key={product.id}
                        className="flex items-stretch gap-1 rounded-2xl border border-transparent hover:border-brand-100 hover:bg-brand-50/60 transition-colors"
                      >
                        <LocaleLink
                          to={productPath(product)}
                          onClick={closeSearch}
                          className="flex min-w-0 flex-1 items-center gap-4 p-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                        >
                          <div className="h-16 w-16 rounded-xl overflow-hidden bg-mist-50 shrink-0 border border-brand-50">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ProductImagePlaceholder
                                productId={String(product.id)}
                                title={product.title}
                                className="h-full w-full min-h-16"
                                compact
                              />
                            )}
                          </div>
                          <div className="flex-grow min-w-0 text-left">
                            <p className="text-sm font-semibold text-navy-950 truncate">
                              {product.title}
                            </p>
                            {product.description ? (
                              <p className="text-xs text-steel-600 line-clamp-1">
                                {product.description}
                              </p>
                            ) : null}
                            <p className="text-sm font-bold text-brand-600 mt-1 tabular-nums">
                              {formatCurrency(product.price)}
                            </p>
                          </div>
                        </LocaleLink>
                        <button
                          type="button"
                          onClick={() =>
                            addItem({
                              productId: product.id,
                              title: product.title,
                              price: product.price,
                              quantity: 1,
                              imageUrl: product.images?.[0] || '',
                            })
                          }
                          className="self-center shrink-0 m-2 p-3 rounded-xl bg-navy-950 text-white hover:bg-brand-500 shadow-card transition-colors motion-safe:active:scale-95"
                          aria-label={`Add ${product.title} to cart`}
                        >
                          <ShoppingCart className="h-5 w-5" aria-hidden />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <LocaleLink
                    to={`/search?q=${query}`}
                    onClick={closeSearch}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl p-3 text-sm font-semibold text-brand-600 hover:bg-brand-50 transition-colors"
                  >
                    View all results
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </LocaleLink>
                </div>
              ) : query.length >= 2 ? (
                <div className="py-12 text-center" role="status">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
                    <Search className="h-7 w-7 text-brand-300" aria-hidden />
                  </div>
                  <h3 className="font-display font-bold text-navy-950">No matching compounds</h3>
                  <p className="mt-1 text-sm text-steel-600">
                    No exact matches found for “{query}”
                  </p>
                </div>
              ) : (
                <div className="px-3 py-4">
                  <p className="mb-4 text-caption text-brand-600 flex items-center gap-2">
                    <TrendingUp className="h-3 w-3" aria-hidden />
                    Trending compounds
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setQuery(item)}
                        className="rounded-xl border border-brand-100 bg-mist-50 px-4 py-2 text-sm font-medium text-steel-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <p className="border-t border-brand-100 bg-mist-50 px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-widest text-silver-400">
              <kbd className="mr-1.5 rounded-md border border-brand-100 bg-white px-1.5 py-0.5 font-mono text-[10px] text-steel-600 shadow-sm">
                Esc
              </kbd>
              to close
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
