import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Link, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, ShoppingCart, Heart, ChevronDown, Filter, ArrowRight, Sparkles } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { motion, AnimatePresence } from 'motion/react';
import { ProductSkeleton } from '../components/Skeleton';
import { sortProducts, type CatalogSortKey } from '../lib/productSort';
import { CatalogTrustStrip } from '../components/products/CatalogTrustStrip';
import { ProductCardRating } from '../components/products/ProductCardRating';
import { ProductImagePlaceholder } from '../components/products/ProductImagePlaceholder';
import { ProductCardPriceBlock } from '../components/products/ProductCardPriceBlock';
import { productPath } from '../lib/productUrl';
import { ProductBadge } from '../components/products/ProductBadge';
import { getPrimaryProductBadge } from '../lib/productBadges';

export default function Search() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState<CatalogSortKey | 'relevance'>('relevance');
  
  const addItem = useCartStore(state => state.addItem);
  const { productIds, toggleWishlist } = useWishlistStore();
  const { user } = useAuthStore();
  const addToast = useToastStore(state => state.addToast);
  const selectedCategory = searchParams.get('category') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await supabase.from('products').select('*');
        if (data) setAllProducts(data);
      } catch (error) {
        console.error("Error fetching search data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categoryOptions = Array.from(
    new Set(
      allProducts.flatMap((product) =>
        Array.isArray(product.categories) ? product.categories : []
      )
    )
  ).sort();

  const getFilteredAndSorted = () => {
    let result = allProducts.filter(product => {
      const matchesText =
        product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!selectedCategory) return matchesText;
      return (
        matchesText &&
        Array.isArray(product.categories) &&
        product.categories.includes(selectedCategory)
      );
    });

    if (sortBy === 'relevance') {
      /* keep stable filtered order */
    } else {
      result = sortProducts(result, sortBy);
    }

    return result;
  };

  const filteredProducts = getFilteredAndSorted();

  const hasNoCatalog = !loading && allProducts.length === 0;
  const hasNoMatches =
    !loading && allProducts.length > 0 && filteredProducts.length === 0;

  const clearSearchFilters = () => {
    setSearchTerm('');
    setSearchParams({});
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Search Header Hero */}
      <section className="bg-white border-b border-gray-100 pt-20 pb-16">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
               <motion.div
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex items-center justify-center gap-2 mb-4"
               >
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">Global Database Access</span>
               </motion.div>
               <h1>
                  Peptide <span className="text-blue-600">Search</span> Engine
               </h1>
               
               <div className="relative group max-w-2xl mx-auto">
                 <div className="absolute inset-y-0 left-0 pl-10 flex items-center pointer-events-none">
                   <SearchIcon className="h-6 w-6 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                 </div>
                 <label htmlFor="global-product-search" className="sr-only">Search products by name or description</label>
                 <input
                   id="global-product-search"
                   type="text"
                   className="block w-full pl-20 pr-10 py-6 border-none ring-1 ring-gray-100 rounded-[2.5rem] bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:bg-white text-xl font-bold shadow-2xl shadow-blue-900/5 transition-all"
                   placeholder="Enter research compound ID..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
               </div>
            </div>
         </div>
      </section>

      <CatalogTrustStrip />

      {/* Results Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
         {/* Filter Bar */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-12">
            <div className="relative inline-block w-full">
               <label htmlFor="search-category" className="sr-only">Filter by category</label>
               <select
                 id="search-category"
                 value={selectedCategory}
                 onChange={(e) => {
                   const next = e.target.value;
                   setSearchParams(next ? { category: next } : {});
                 }}
                 className="w-full appearance-none pl-6 pr-12 py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-600/5 cursor-pointer shadow-sm shadow-gray-200/50"
               >
                 <option value="">All Quantities</option>
                 {categoryOptions.map((cat) => (
                   <option key={cat} value={cat}>
                     {cat}
                   </option>
                 ))}
               </select>
               <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" aria-hidden />
            </div>

            <div className="relative inline-block w-full">
               <label htmlFor="search-sort" className="sr-only">Sort search results</label>
               <select 
                 id="search-sort"
                 value={sortBy}
                 onChange={(e) => setSortBy(e.target.value as CatalogSortKey | 'relevance')}
                 className="w-full appearance-none pl-6 pr-12 py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-600/5 cursor-pointer shadow-sm shadow-gray-200/50"
               >
                  <option value="relevance">Precision Rank</option>
                  <option value="featured">Featured</option>
                  <option value="rating-desc">Best Rated</option>
                  <option value="newest">Recent Discovery</option>
                  <option value="price-asc">Yield: Low to High</option>
                  <option value="price-desc">Yield: High to Low</option>
               </select>
               <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" aria-hidden />
            </div>
         </div>

         {!loading && !hasNoCatalog && (
           <p className="text-sm text-gray-500 mb-8">
             Showing <span className="font-semibold text-gray-700">{filteredProducts.length}</span> of{' '}
             <span className="font-semibold text-gray-700">{allProducts.length}</span> products
             {searchTerm ? ` matching "${searchTerm}"` : ''}
             {selectedCategory && !searchTerm ? ` in “${selectedCategory}”` : ''}
           </p>
         )}

         {loading ? (
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
             {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
           </div>
         ) : hasNoCatalog ? (
           <div
             className="text-center py-24 bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/20"
             role="status"
             aria-live="polite"
           >
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Filter className="h-10 w-10 text-gray-200" aria-hidden />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">No products available</h3>
              <p className="text-gray-400 font-medium mb-8 max-w-md mx-auto">
                The catalog has not loaded yet or your database is empty. Check your connection or seed products from the admin dashboard.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-blue-600 font-black uppercase tracking-widest text-[10px] hover:gap-4 transition-all"
              >
                Browse shop <ArrowRight className="h-3 w-3" aria-hidden />
              </Link>
           </div>
         ) : hasNoMatches ? (
           <div
             className="text-center py-24 bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/20"
             role="status"
             aria-live="polite"
           >
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Filter className="h-10 w-10 text-gray-200" aria-hidden />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Zero matches identified</h3>
              <p className="text-gray-400 font-medium mb-8 max-w-md mx-auto">
                {searchTerm
                  ? `Nothing matched “${searchTerm}”. Try different keywords or clear filters.`
                  : selectedCategory
                    ? `No products are listed under “${selectedCategory}” right now.`
                    : 'Adjust filters to see results.'}
              </p>
              <button
                type="button"
                onClick={clearSearchFilters}
                className="inline-flex items-center gap-2 text-blue-600 font-black uppercase tracking-widest text-[10px] hover:gap-4 transition-all"
              >
                 Clear search & filters <ArrowRight className="h-3 w-3" aria-hidden />
              </button>
           </div>
         ) : (
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
              <AnimatePresence>
                {filteredProducts.map((product, idx) => {
                  const primaryBadge = getPrimaryProductBadge(product);
                  return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05 }}
                    key={product.id}
                    className="group bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative"
                  >
                    <Link to={productPath(product)} className="block relative aspect-[4/5] overflow-hidden bg-gray-50">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                        ) : (
                          <ProductImagePlaceholder productId={String(product.id)} title={product.title} className="h-full min-h-full" />
                        )}
                        <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex flex-col items-start gap-1 z-10 pointer-events-none">
                          {primaryBadge ? <ProductBadge type={primaryBadge} size="sm" /> : null}
                          {Number(product.inventory) < 10 ? <ProductBadge type="low_stock" size="sm" /> : null}
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                     </Link>

                     <div className="p-8">
                        <div className="mb-4">
                           <div>
                              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">
                                {Array.isArray(product.categories) ? product.categories[0] : product.category}
                              </p>
                             <Link to={productPath(product)} className="text-lg font-black text-gray-900 leading-tight hover:text-blue-600 transition-colors line-clamp-1">
                                {product.title}
                              </Link>
                              <ProductCardRating
                                rating={product.rating}
                                reviewCount={product.review_count}
                                className="mt-2"
                              />
                           </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-50">
                           <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Stock Verified</p>
                              <ProductCardPriceBlock product={product} />
                           </div>
                           <button 
                             type="button"
                             onClick={() => {
                               addItem({ productId: product.id, title: product.title, price: product.price, quantity: 1, imageUrl: product.images?.[0] || '' });
                               addToast(`${product.title} archived in cart`);
                             }}
                             className="bg-gray-900 text-white p-4 rounded-2xl hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200 transition-all active:scale-95"
                             aria-label={`Add ${product.title} to cart`}
                           >
                              <ShoppingCart className="h-5 w-5" />
                           </button>
                        </div>
                     </div>
                  </motion.div>
                )})}
              </AnimatePresence>
           </div>
         )}
      </main>
    </div>
  );
}
