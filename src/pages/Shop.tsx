import React, { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../lib/utils';
import { ShoppingCart, Heart, Filter, X, ChevronDown, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { motion, AnimatePresence } from 'motion/react';
import { ProductSkeleton } from '../components/Skeleton';
import { sortProducts, type CatalogSortKey } from '../lib/productSort';
import { catalogPriceSliderMax, productEffectiveMaxPrice } from '../lib/catalogPriceSlider';
import { SHOP_PRODUCT_COLUMNS } from '../lib/shopCatalogQuery';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { CatalogTrustStrip } from '../components/products/CatalogTrustStrip';
import { ProductCardRating } from '../components/products/ProductCardRating';
import { ProductImagePlaceholder } from '../components/products/ProductImagePlaceholder';
import { ProductCardPriceBlock } from '../components/products/ProductCardPriceBlock';
import { productPath } from '../lib/productUrl';
import { ProductBadge } from '../components/products/ProductBadge';
import { getPrimaryProductBadge } from '../lib/productBadges';

export default function Shop() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Filters State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(500);
  const [sortBy, setSortBy] = useState<CatalogSortKey>('newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const mobileFilterPanelRef = useRef<HTMLDivElement>(null);

  const addItem = useCartStore(state => state.addItem);
  const { productIds, toggleWishlist } = useWishlistStore();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [prodResult, catResult] = await Promise.all([
          supabase.from('products').select(SHOP_PRODUCT_COLUMNS).order('created_at', { ascending: false }),
          supabase.from('categories').select('name').order('name'),
        ]);

        const prodData = prodResult.data;

        if (prodResult.error) {
          console.error('Error fetching shop products:', prodResult.error);
        } else if (prodData) {
          setAllProducts(prodData);
          setPriceRange(catalogPriceSliderMax(prodData));
        }

        const catData = catResult.data;
        if (!catResult.error && catData) {
          setCategories(catData.map((c) => c.name));
        }
      } catch (error) {
        console.error('Error fetching shop data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (selectedCategories.length > 0) {
      result = result.filter(
        (p) => p.categories && p.categories.some((c: string) => selectedCategories.includes(c)),
      );
    }

    result = result.filter((p) => productEffectiveMaxPrice(p) <= priceRange);
    return sortProducts(result, sortBy);
  }, [allProducts, selectedCategories, priceRange, sortBy]);

  const priceSliderMax = useMemo(() => catalogPriceSliderMax(allProducts), [allProducts]);
  const priceSliderStep = priceSliderMax > 2000 ? 50 : 10;

  useFocusTrap(showMobileFilters, mobileFilterPanelRef, () => setShowMobileFilters(false));

  const addToast = useToastStore(state => state.addToast);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange(catalogPriceSliderMax(allProducts));
    setSortBy('newest');
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-12">
        <div className="h-10 w-48 bg-gray-200 animate-pulse rounded-lg"></div>
        <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-lg"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="hidden lg:block space-y-8">
           <div className="h-40 bg-gray-100 animate-pulse rounded-2xl"></div>
           <div className="h-40 bg-gray-100 animate-pulse rounded-2xl"></div>
        </div>
        <div className="lg:col-span-3 grid grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1>Shop Peptides</h1>
          <p className="text-gray-500 mt-1">
            Showing{' '}
            <span className="font-semibold text-gray-700">{filteredProducts.length}</span> of{' '}
            <span className="font-semibold text-gray-700">{allProducts.length}</span> products
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
            aria-expanded={showMobileFilters}
            aria-controls="shop-mobile-filters"
          >
            <Filter className="h-4 w-4" aria-hidden /> Filters
          </button>
          
          <div className="relative group">
            <label htmlFor="shop-sort" className="sr-only">
              Sort products
            </label>
            <select 
              id="shop-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as CatalogSortKey)}
              className="appearance-none pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="rating-desc">Best rated</option>
              <option value="newest">Newest arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" aria-hidden />
          </div>
        </div>
      </div>

      <CatalogTrustStrip />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block space-y-8 sticky top-24 self-start">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map(cat => (
                <label key={cat} className="flex items-center group cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                  />
                  <span className={`ml-3 text-sm font-medium transition-colors ${selectedCategories.includes(cat) ? 'text-blue-600 font-bold' : 'text-gray-600 group-hover:text-gray-900'}`}>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Price Range</h3>
              <span className="text-blue-600 font-bold text-sm">Under {formatCurrency(priceRange)}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max={priceSliderMax}
              step={priceSliderStep}
              value={Math.min(priceRange, priceSliderMax)}
              onChange={(e) => setPriceRange(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              aria-label="Maximum price filter"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-bold uppercase">
              <span>{formatCurrency(0)}</span>
              <span>{formatCurrency(priceSliderMax)}+</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={clearFilters}
            className="w-full py-2 text-sm font-bold text-gray-500 hover:text-red-600 transition-colors flex items-center justify-center gap-2 border border-gray-100 rounded-lg hover:bg-red-50"
          >
            <X className="h-4 w-4" /> Clear All Filters
          </button>
        </aside>

        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {showMobileFilters && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileFilters(false)}
                className="fixed inset-0 bg-black/50 z-50 md:hidden"
                aria-hidden={true}
              />
              <motion.div 
                ref={mobileFilterPanelRef}
                id="shop-mobile-filters"
                role="dialog"
                aria-modal="true"
                aria-label="Product filters"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="fixed inset-y-0 right-0 w-80 bg-white z-[60] p-6 shadow-2xl md:hidden"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold">Filters</h2>
                  <button type="button" onClick={() => setShowMobileFilters(false)} aria-label="Close filters"><X className="h-6 w-6" /></button>
                </div>
                {/* Mobile Category Sidebar Content Replicated */}
                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Categories</h3>
                    <div className="space-y-3">
                      {categories.map(cat => (
                        <label key={`mobile-${cat}`} className="flex items-center">
                          <input 
                            type="checkbox" 
                            className="h-6 w-6 rounded border-gray-300 text-blue-600"
                            checked={selectedCategories.includes(cat)}
                            onChange={() => toggleCategory(cat)}
                          />
                          <span className="ml-3 text-base font-medium">{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Price Range</h3>
                    <input 
                      type="range" 
                      min="0" 
                      max={priceSliderMax}
                      step={priceSliderStep}
                      value={Math.min(priceRange, priceSliderMax)}
                      onChange={(e) => setPriceRange(parseInt(e.target.value, 10))}
                      className="w-full"
                      aria-label="Maximum price filter"
                    />
                    <div className="text-center mt-2 font-bold text-blue-600">{formatCurrency(priceRange)}</div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => { clearFilters(); setShowMobileFilters(false); }}
                    className="w-full bg-gray-100 py-4 rounded-xl font-bold text-gray-600"
                  >
                    Clear All
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold"
                  >
                    Show Result
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {/* Active Filter Chips */}
          {(selectedCategories.length > 0 || priceRange < priceSliderMax) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedCategories.map(cat => (
                <span key={`chip-${cat}`} className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                  {cat}
                  <button type="button" onClick={() => toggleCategory(cat)} className="ml-2 hover:text-blue-900" aria-label={`Remove ${cat} category filter`}><X className="h-3 w-3" /></button>
                </span>
              ))}
              {priceRange < priceSliderMax && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                  Under {formatCurrency(priceRange)}
                  <button type="button" onClick={() => setPriceRange(priceSliderMax)} className="ml-2 hover:text-blue-900" aria-label="Remove maximum price filter"><X className="h-3 w-3" /></button>
                </span>
              )}
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div
              className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200"
              role="status"
              aria-live="polite"
            >
              <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                 <Filter className="h-8 w-8 text-gray-300" aria-hidden />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No products match your filters</h3>
              <p className="text-gray-500 mb-6">Try adjusting your price range or categories</p>
              <button 
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center font-bold text-blue-600 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => {
                const primaryBadge = getPrimaryProductBadge(product);
                return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-shadow duration-300"
                >
                  <Link to={productPath(product)} className="block relative h-64 bg-gray-100 overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <ProductImagePlaceholder productId={String(product.id)} title={product.title} className="h-full min-h-[16rem]" />
                    )}
                    <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex flex-col items-start gap-1 z-10 pointer-events-none">
                      {primaryBadge ? <ProductBadge type={primaryBadge} size="sm" /> : null}
                      {product.inventory < 10 ? <ProductBadge type="low_stock" size="sm" /> : null}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(product.id, user?.id || '');
                      }}
                      className={`absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-20 p-2.5 rounded-full backdrop-blur-sm transition-all duration-300 active:scale-75 ${
                        productIds.includes(product.id)
                          ? 'bg-red-50/95 text-red-500 shadow-inner'
                          : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white'
                      }`}
                      aria-label={productIds.includes(product.id) ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`}
                    >
                      <Heart className="h-5 w-5" fill={productIds.includes(product.id) ? "currentColor" : "none"} aria-hidden />
                    </button>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                  </Link>

                  <div className="p-6">
                    <div className="mb-3">
                      <div>
                        <Link to={productPath(product)} className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1">
                          {product.title}
                        </Link>
                        {product.categories && (
                          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{product.categories[0]}</span>
                        )}
                        <ProductCardRating
                          rating={product.rating}
                          reviewCount={product.review_count}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <p className="text-gray-500 text-xs mb-6 line-clamp-2 leading-relaxed font-medium">{product.description}</p>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-50">
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <ShieldCheck className="h-3 w-3 text-green-500" aria-hidden />
                          <span className="text-[10px] text-green-600 font-bold uppercase tracking-tight">Verified Price</span>
                        </div>
                        <ProductCardPriceBlock product={product} />
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          addItem({
                            productId: product.id,
                            title: product.title,
                            price: product.price,
                            quantity: 1,
                            imageUrl: product.images?.[0] || ''
                          });
                          addToast(`${product.title} added to cart!`);
                        }}
                        className="bg-blue-600 text-white p-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-blue-200/50 active:scale-95"
                        aria-label={`Add ${product.title} to cart`}
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
