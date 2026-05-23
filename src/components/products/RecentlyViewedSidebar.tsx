import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../../supabase';
import { ProductImagePlaceholder } from './ProductImagePlaceholder';
import { productPath } from '../../lib/productUrl';

export default function RecentlyViewedSidebar() {
  const [products, setProducts] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

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
            // Sort to match the order of IDs in localStorage
            const sortedData = ids.map((id: string) => data.find(p => p.id === id)).filter(Boolean);
            setProducts(sortedData);
            setIsVisible(true);
          }
        }
      }
    };

    fetchRecent();
  }, [location.pathname]);

  if (!isVisible || products.length === 0) return null;

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[40] hidden lg:flex items-center">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-2 rounded-l-xl shadow-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-gray-500 hover:text-brand-600"
      >
        {isExpanded ? <ChevronRight className="h-5 w-5" /> : <History className="h-5 w-5" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            className="bg-white dark:bg-gray-900 border-l border-t border-b border-gray-200 dark:border-gray-800 rounded-l-[2rem] shadow-[-10px_0_30px_rgba(0,0,0,0.1)] p-4 w-24 flex flex-col items-center gap-4"
          >
            <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 text-center mb-2">History</p>
            {products.map((product) => (
              <Link
                key={product.id}
                to={productPath(product)}
                className="relative group"
              >
                <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-transparent group-hover:border-brand-500 transition-all shadow-md">
                  {product.images?.[0] ? (
                  <img src={product.images[0]} alt="" className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
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
                {/* Tooltip on hover */}
                <span className="absolute right-14 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                  {product.title}
                </span>
              </Link>
            ))}
            <button 
              onClick={() => {
                localStorage.removeItem('recentlyViewed');
                setProducts([]);
                setIsVisible(false);
              }}
              className="mt-2 p-2 text-gray-300 hover:text-red-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
