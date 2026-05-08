import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, ChevronRight, User, Package, Settings, ArrowRight } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCardRating } from '../components/products/ProductCardRating';
import { ProductImagePlaceholder } from '../components/products/ProductImagePlaceholder';
import { ProductCardPriceBlock } from '../components/products/ProductCardPriceBlock';
import { productPath } from '../lib/productUrl';
import { formatCurrency } from '../lib/utils';
import { ProductBadge } from '../components/products/ProductBadge';
import { getPrimaryProductBadge } from '../lib/productBadges';

export default function Wishlist() {
  const { user, profile } = useAuthStore();
  const { productIds, toggleWishlist } = useWishlistStore();
  const addItem = useCartStore(state => state.addItem);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (!user || productIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase.from('products').select('*').in('id', productIds);
        if (data) setProducts(data);
      } catch (error) {
        console.error("Error fetching wishlist products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [user, productIds]);

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
        <div className="text-center">
           <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
           <p className="text-xl font-bold text-gray-900">Please log in to view your favorites.</p>
           <Link to="/login" className="text-blue-600 font-bold hover:underline mt-2 inline-block">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Dashboard Sidebar */}
          <aside className="w-full lg:w-80 space-y-4">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center">
               <div className="h-24 w-24 rounded-full bg-blue-50 p-1 mb-4">
                 <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-xl bg-white flex items-center justify-center">
                   {profile.photo_url ? (
                     <img src={profile.photo_url} alt={profile.display_name ? `${profile.display_name} profile photo` : 'Profile photo'} className="w-full h-full object-cover" />
                   ) : (
                     <User className="h-12 w-12 text-blue-100" />
                   )}
                 </div>
               </div>
               <h2 className="text-2xl font-black text-gray-900 leading-tight">{profile.display_name || 'Researcher'}</h2>
               <p className="text-blue-500 text-xs font-black uppercase tracking-widest mt-1">{profile.role}</p>
            </div>

            <nav className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-2">
               {[
                 { label: 'Overview', icon: User, path: '/profile' },
                 { label: 'Orders', icon: Package, path: '/orders' },
                 { label: 'Wishlist', icon: Heart, path: '/wishlist', active: true },
                 { label: 'Settings', icon: Settings, path: '/profile' }
               ].map((item, i) => (
                 <Link 
                   key={i} 
                   to={item.path}
                   className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${
                     item.active ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500 hover:bg-gray-50'
                   }`}
                 >
                   <div className="flex items-center gap-4">
                     <item.icon className="h-5 w-5" />
                     <span className="font-bold text-sm">{item.label}</span>
                   </div>
                   <ChevronRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${item.active ? 'text-white/50' : 'text-gray-300'}`} />
                 </Link>
               ))}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-grow space-y-8">
            <div className="flex justify-between items-center mb-4">
               <h1>My Wishlist</h1>
               <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{products.length} Favorites</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-80 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="space-y-12">
                <div className="text-center py-24 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="h-10 w-10 text-gray-200" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 leading-tight">Your wishlist is empty</h2>
                  <p className="text-gray-500 mt-2 mb-8 max-w-sm mx-auto font-medium">Save your most-used research compounds here for quick access in future sessions.</p>
                  <Link to="/shop" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-gray-900 transition-all shadow-lg shadow-blue-100">
                    Discover Compounds
                  </Link>
                </div>

                {/* Recommendations for empty state */}
                <section>
                   <div className="flex items-center gap-3 mb-6">
                      <div className="h-1 w-8 bg-blue-600 rounded-full" />
                      <h2 className="text-xl font-black text-gray-900">Suggested for Research</h2>
                   </div>
                   <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { id: '1', title: 'BPC-157 5mg', category: 'Recovery', price: 45.00, image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&h=300&fit=crop' },
                        { id: '2', title: 'TB-500 2mg', category: 'Healing', price: 38.00, image: 'https://images.unsplash.com/photo-1583947582991-916c8742880a?w=300&h=300&fit=crop' },
                        { id: '3', title: 'PT-141 10mg', category: 'Performance', price: 55.00, image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&h=300&fit=crop' },
                        { id: '4', title: 'CJC-1295 5mg', category: 'Growth', price: 42.00, image: 'https://images.unsplash.com/photo-1603398938378-e54eab446fec?w=300&h=300&fit=crop' }
                      ].map((p) => (
                        <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 group">
                           <div className="aspect-square rounded-2xl bg-gray-50 mb-4 overflow-hidden">
                              <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.title} />
                           </div>
                           <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{p.category}</p>
                           <h4 className="font-black text-gray-900 leading-tight mb-2">{p.title}</h4>
                           <p className="text-lg font-black text-gray-900 tabular-nums">{formatCurrency(p.price)}</p>
                        </div>
                      ))}
                   </div>
                </section>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                <AnimatePresence>
                  {products.map((product, idx) => {
                    const primaryBadge = getPrimaryProductBadge(product);
                    return (
                    <motion.div 
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 relative"
                    >
                      {/* Image Area */}
                      <Link to={productPath(product)} className="block relative aspect-square overflow-hidden bg-gray-50">
                        {product.images?.[0] ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.title} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          />
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
                            toggleWishlist(product.id, user.id);
                          }}
                          className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-20 p-2.5 rounded-full bg-red-50/95 text-red-500 backdrop-blur-sm shadow-inner transition-all duration-300 active:scale-75"
                          aria-label={`Remove ${product.title} from wishlist`}
                        >
                          <Heart className="h-5 w-5" fill="currentColor" aria-hidden />
                        </button>
                        <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/10 transition-colors" />
                      </Link>

                      {/* Content Area */}
                      <div className="p-8">
                         <div className="flex justify-between items-start mb-4">
                            <div>
                               <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">
                                 {Array.isArray(product.categories) ? product.categories[0] : product.category}
                               </p>
                              <Link to={productPath(product)} className="text-lg font-black text-gray-900 leading-tight block hover:text-blue-600 transition-colors">
                                 {product.title}
                               </Link>
                               <ProductCardRating
                                 rating={product.rating}
                                 reviewCount={product.review_count}
                                 className="mt-2"
                               />
                            </div>
                         </div>

                         <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                             <ProductCardPriceBlock product={product} />
                            
                            <div className="flex gap-2">
                               <button 
                                 type="button"
                                 onClick={() => addItem({
                                   productId: product.id,
                                   title: product.title,
                                   price: product.price,
                                   quantity: 1,
                                   imageUrl: product.images?.[0] || ''
                                 })}
                                 className="flex items-center justify-center bg-blue-600 text-white w-12 h-12 rounded-2xl hover:bg-gray-900 hover:shadow-lg transition-all duration-300 shadow-blue-100"
                                 aria-label={`Add ${product.title} to cart`}
                               >
                                  <ShoppingCart className="h-5 w-5" aria-hidden />
                               </button>
                            </div>
                         </div>
                      </div>
                    </motion.div>
                  )})}
                </AnimatePresence>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
