import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ShoppingCart, ArrowRight, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { useSearchStore } from '../../store/useSearchStore';
import { useCartStore } from '../../store/useCartStore';
import { supabase } from '../../supabase';
import { formatCurrency } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { ProductImagePlaceholder } from '../products/ProductImagePlaceholder';
import { productPath } from '../../lib/productUrl';

const POPULAR_SEARCHES = ['BPC-157', 'TB-500', 'Semaglutide', 'CJC-1295', 'AOD-9604'];

export default function Omnisearch() {
  const { isOpen, closeSearch } = useSearchStore();
  const { addItem } = useCartStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
    }
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
        setResults(data || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleProductClick = (product: any) => {
    closeSearch();
    navigate(productPath(product));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh]"
        >
          {/* Backdrop with extreme blur */}
          <div 
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-xl" 
            onClick={closeSearch}
          />

          {/* Search Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-white/20"
          >
            {/* Input Wrapper */}
            <div className="relative p-6 border-b dark:border-gray-800">
              <Search className="absolute left-10 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search compounds, peptides, or categories..."
                className="w-full bg-gray-50 dark:bg-gray-800/50 rounded-2xl pl-14 pr-14 py-4 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all text-gray-900 dark:text-white"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button 
                onClick={closeSearch}
                className="absolute right-10 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Results / Suggestions Area */}
            <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-10 w-10 text-brand-500 animate-spin" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Scanning research database...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-2">
                  <p className="px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-2">
                    <Sparkles className="h-3 w-3" /> Exact Matches
                  </p>
                  {results.map((product) => (
                    <div
                      key={product.id}
                      className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer border border-transparent hover:border-brand-100 dark:hover:border-brand-900/50"
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
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
                      <div className="flex-grow min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {product.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                          {product.description}
                        </p>
                        <p className="text-sm font-black text-brand-600 dark:text-brand-400 mt-1">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addItem({
                            productId: product.id,
                            title: product.title,
                            price: product.price,
                            quantity: 1,
                            imageUrl: product.images?.[0] || ''
                          });
                        }}
                        className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-brand-600 hover:text-white transition-all transform active:scale-90"
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => { navigate(`/search?q=${query}`); closeSearch(); }}
                    className="w-full mt-4 p-4 flex items-center justify-center gap-2 text-sm font-bold text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-2xl transition-all"
                  >
                    View all results <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : query.length >= 2 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-gray-300" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Empty Catalog Search</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No exact matches found for "{query}"</p>
                </div>
              ) : (
                <div className="py-6 px-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                    <TrendingUp className="h-3 w-3" /> Trending Compound Groups
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((item) => (
                      <button
                        key={item}
                        onClick={() => setQuery(item)}
                        className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/30 dark:hover:text-brand-400 transition-all border border-transparent hover:border-brand-100"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Hint Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/30 text-center border-t dark:border-gray-800">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                 <span className="p-1 px-1.5 bg-white dark:bg-gray-800 rounded shadow-sm border dark:border-gray-700 font-mono">ESC</span>
                 to close search portal
               </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
