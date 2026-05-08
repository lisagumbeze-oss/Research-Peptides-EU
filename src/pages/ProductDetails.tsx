import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatCurrency } from '../lib/utils';
import { ShoppingCart, Star, Heart, Share2, LinkIcon, ShieldCheck, Zap, Truck, CheckCircle2 } from 'lucide-react';
import { useWishlistStore } from '../store/useWishlistStore';
import { useToastStore } from '../store/useToastStore';
import { motion } from 'motion/react';
import { DetailedProductSkeleton } from '../components/Skeleton';
import { ProductBadge } from '../components/products/ProductBadge';
import { ProductImagePlaceholder } from '../components/products/ProductImagePlaceholder';
import { productPath } from '../lib/productUrl';

export default function ProductDetails() {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [showShare, setShowShare] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  
  const addItem = useCartStore(state => state.addItem);
  const { user, profile } = useAuthStore();
  const { productIds, toggleWishlist } = useWishlistStore();
  const addToast = useToastStore(state => state.addToast);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      if (!slug && !id) return;
      setLoading(true);
      try {
        const query = supabase.from('products').select('*');
        const { data: pData } = slug
          ? await query.eq('slug', slug).maybeSingle()
          : await query.eq('id', id as string).maybeSingle();
        if (pData) {
          const canonical = productPath(pData);
          if (canonical !== window.location.pathname) {
            navigate(canonical, { replace: true });
          }
          setProduct(pData);
          if (pData.variants && pData.variants.length > 0) {
            setSelectedVariant(pData.variants[0]);
          }
          setActiveImage(0); // Reset image on product change

          // Tracking: Add to Recently Viewed in LocalStorage
          const stored = localStorage.getItem('recentlyViewed');
          let prevIds = stored ? JSON.parse(stored) : [];
          // Keep unique last 10
          prevIds = [pData.id, ...prevIds.filter((pid: string) => pid !== pData.id)].slice(0, 10);
          localStorage.setItem('recentlyViewed', JSON.stringify(prevIds));

          // Fetch details for recently viewed (excluding current)
          const displayIds = prevIds.filter((pid: string) => pid !== pData.id).slice(0, 4);
          if (displayIds.length > 0) {
            const { data: rvData } = await supabase.from('products').select('*').in('id', displayIds);
            if (rvData) setRecentlyViewed(rvData);
          }
        }

        const productId = pData?.id;
        if (!productId) {
          setReviews([]);
          setRecommended([]);
          return;
        }

        const { data: rData } = await supabase.from('reviews').select('*').eq('product_id', productId);
        if (rData) setReviews(rData);

        const { data: recData } = await supabase.from('products').select('*').limit(4);
        if (recData) setRecommended(recData.filter(p => String(p.id) !== String(productId)).slice(0, 3));

      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndReviews();
    window.scrollTo(0, 0);
  }, [slug, id, navigate]);

  const handleAddToCart = () => {
    if (product) {
      let pricePerUnit = selectedVariant ? selectedVariant.display_price : product.price;
      
      // Apply Tier Discounts
      if (quantity >= 5) pricePerUnit = pricePerUnit * 0.85; // 15% off
      else if (quantity >= 3) pricePerUnit = pricePerUnit * 0.90; // 10% off

      addItem({
        productId: product.id,
        title: product.title,
        price: pricePerUnit,
        quantity,
        imageUrl: product.images?.[0] || '',
        specification: selectedVariant ? (selectedVariant.attributes?.attribute_pa_peptides || selectedVariant.display_name) : undefined
      });
      
      // If user selected 3 or 5, we can show a special toast
      if (quantity >= 5) addToast(`Bulk discount (15%) applied to ${product.title}!`);
      else if (quantity >= 3) addToast(`Bulk discount (10%) applied to ${product.title}!`);
      else addToast(`${product.title} added to cart!`);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !product?.id) return;

    try {
      const newReview = {
        product_id: product.id,
        user_id: user.id,
        author_name: profile.display_name || user.email?.split('@')[0] || 'Anonymous',
        rating,
        comment: reviewText
      };
      const { data, error } = await supabase.from('reviews').insert([newReview]).select().single();
      if (data) {
        setReviews([...reviews, data]);
      }
      setReviewText('');
      setRating(5);
    } catch (error) {
      console.error("Error adding review:", error);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShare(false);
    alert('Link copied to clipboard!');
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <DetailedProductSkeleton />
    </div>
  );
  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
       <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
       <Link to="/shop" className="text-blue-600 font-bold hover:underline">Return to Shop</Link>
    </div>
  );

  const currentPrice = selectedVariant ? selectedVariant.display_price : product.price;
  const currentNum = Number(currentPrice) || 0;
  const listCompare = Number(product.compare_at_price ?? product.compare_at);
  const variantCompare = selectedVariant
    ? Number(selectedVariant.original_price ?? selectedVariant.regular_price)
    : NaN;
  const compareWas =
    Number.isFinite(listCompare) && listCompare > currentNum
      ? listCompare
      : Number.isFinite(variantCompare) && variantCompare > currentNum
        ? variantCompare
        : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div className="space-y-4">
          <div className="bg-white rounded-3xl aspect-square overflow-hidden flex items-center justify-center border border-gray-100 shadow-sm relative group">
            {product.images && product.images.length > 0 ? (
              <motion.img 
                key={activeImage}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={product.images[activeImage]} 
                alt={product.title} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <ProductImagePlaceholder productId={String(product.id)} title={product.title} className="h-full w-full min-h-[16rem]" />
            )}
            
            <div className="absolute top-6 left-6 flex flex-col gap-2">
               <ProductBadge type="elite" size="md" />
               {product.inventory < 50 && (
                 <ProductBadge type="low_stock" size="md" />
               )}
            </div>
          </div>

          {/* Thumbnail Switcher */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 p-1 overflow-x-auto pb-2 no-scrollbar">
              {product.images.map((img: string, i: number) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    activeImage === i ? 'border-blue-600 shadow-md scale-105' : 'border-transparent hover:border-gray-200'
                  }`}
                  aria-label={`Show product image ${i + 1} of ${product.images.length}`}
                  aria-current={activeImage === i ? 'true' : undefined}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
            <div className="flex space-x-2 relative">
              <button 
                type="button"
                onClick={() => setShowShare(!showShare)}
                className="p-2 rounded-full border border-gray-200 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                aria-expanded={showShare}
                aria-haspopup="true"
                aria-label="Share product"
              >
                <Share2 className="h-6 w-6" aria-hidden />
              </button>
              {showShare && (
                <div className="absolute right-0 top-12 bg-white border border-gray-200 shadow-lg rounded-md p-2 flex space-x-2 z-10" role="menu">
                  <button type="button" onClick={copyLink} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md" aria-label="Copy link to clipboard"><LinkIcon className="h-5 w-5" aria-hidden /></button>
                </div>
              )}
              <button 
                type="button"
                onClick={() => toggleWishlist(product.id, user?.id || '')}
                className={`p-2 rounded-full border ${productIds.includes(product.id) ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                aria-label={productIds.includes(product.id) ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`}
              >
                <Heart className="h-6 w-6" fill={productIds.includes(product.id) ? "currentColor" : "none"} aria-hidden />
              </button>
            </div>
          </div>
          
          <div className="flex items-center mb-4">
            <div className="flex text-yellow-400 mr-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < (product.rating || 5) ? 'fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-gray-500 text-sm">({reviews.length} reviews)</span>
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex flex-col gap-0.5">
              {compareWas != null && (
                <span className="text-lg font-bold text-gray-400 line-through tabular-nums">
                  {formatCurrency(compareWas)}
                </span>
              )}
              <div className="text-4xl font-black text-gray-900 tabular-nums">
                {formatCurrency(currentPrice)}
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-full border border-green-100">
               <ShieldCheck className="h-4 w-4 text-green-500" />
               <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Price Verified</span>
            </div>
          </div>
          
          <p className="text-gray-600 mb-8 whitespace-pre-line">{product.description}</p>

          {/* New Variant Selector Section */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Specification</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: any, i: number) => {
                  const label = v.attributes?.attribute_pa_peptides || v.display_name;
                  return (
                    <button
                      key={v.variation_id || i}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                        selectedVariant?.variation_id === v.variation_id
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                      aria-pressed={selectedVariant?.variation_id === v.variation_id}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {product.specifications && product.specifications.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Product Profile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.specifications.map((spec: string, i: number) => (
                  <div key={i} className="flex items-center text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                    <span className="line-clamp-1">{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bundle Selection UI */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-6">
              <ProductBadge type="verified" size="sm" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                Choose Your Research Bundle
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              {[
                { id: 'standard', qty: 1, range: '1-2 Units', label: 'STANDARD', discount: 0, tagColor: 'bg-gray-100 text-gray-600' },
                { id: 'save', qty: 3, range: '3-5 Units', label: 'SAVE 10%', discount: 0.10, tagColor: 'bg-amber-100 text-amber-700' },
                { id: 'value', qty: 5, range: '6+ Units', label: 'BEST VALUE', discount: 0.15, tagColor: 'bg-emerald-100 text-emerald-700' }
              ].map((tier) => {
                const basePrice = selectedVariant ? selectedVariant.display_price : product.price;
                const unitPrice = basePrice * (1 - tier.discount);
                const isSelected = (tier.qty === 1 && quantity < 3) || 
                                  (tier.qty === 3 && quantity >= 3 && quantity < 5) || 
                                  (tier.qty === 5 && quantity >= 5);
                
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setQuantity(tier.qty)}
                    className={`relative p-3 md:p-6 rounded-2xl md:rounded-[2rem] border-2 transition-all duration-300 text-center group ${
                      isSelected 
                        ? 'border-blue-600 bg-blue-50/50 shadow-xl shadow-blue-500/10 md:scale-[1.02]' 
                        : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200/50'
                    }`}
                    aria-pressed={isSelected}
                    aria-label={`${tier.label}: ${tier.range}, ${formatCurrency(unitPrice)} per unit`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 md:top-4 md:right-4 text-blue-600">
                        <CheckCircle2 className="h-4 w-4 md:h-6 md:w-6 fill-white" />
                      </div>
                    )}

                    <div className="flex flex-col items-center">
                      <span className={`px-2 py-0.5 md:px-4 md:py-1 rounded-full text-[8px] md:text-[10px] font-black tracking-widest mb-2 md:mb-4 inline-block ${tier.tagColor}`}>
                        {tier.label}
                      </span>
                      
                      <span className="text-[10px] md:text-sm font-bold text-gray-500 mb-1 leading-tight">
                        {tier.range}
                      </span>
                      
                      <div className="flex flex-col md:flex-row items-center md:items-baseline md:gap-1 mb-2">
                        <span className={`text-base md:text-2xl font-black ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>
                          {formatCurrency(unitPrice)}
                        </span>
                        <span className="text-[8px] md:text-xs font-bold text-gray-400">/ unit</span>
                      </div>

                      <p className={`hidden sm:block text-[11px] font-bold ${tier.discount > 0 ? 'text-gray-500' : 'text-gray-400'}`}>
                        {tier.discount > 0 
                          ? `Total (×${tier.qty}): ${formatCurrency(unitPrice * tier.qty)}` 
                          : 'No discount'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trust Signals */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8">
            <div className="flex flex-col items-center p-2 md:p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-center">
              <ShieldCheck className="h-4 w-4 md:h-6 md:w-6 text-blue-600 mb-2" />
              <span className="text-[8px] md:text-[10px] font-bold text-blue-900 uppercase tracking-[0.15em] leading-tight">HPLC <br className="md:hidden" /> Tested</span>
            </div>
            <div className="flex flex-col items-center p-2 md:p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-center">
              <Truck className="h-4 w-4 md:h-6 md:w-6 text-blue-600 mb-2" />
              <span className="text-[8px] md:text-[10px] font-bold text-blue-900 uppercase tracking-[0.15em] leading-tight">Stealth <br className="md:hidden" /> Ship</span>
            </div>
            <div className="flex flex-col items-center p-2 md:p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-center">
              <Zap className="h-4 w-4 md:h-6 md:w-6 text-blue-600 mb-2" />
              <span className="text-[8px] md:text-[10px] font-bold text-blue-900 uppercase tracking-[0.15em] leading-tight">Express <br className="md:hidden" /> Purity</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden shadow-sm">
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Decrease quantity">−</button>
              <input 
                type="number" 
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-2 py-3 font-bold text-gray-900 border-x border-gray-300 bg-white text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                aria-label="Quantity"
              />
              <button type="button" onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Increase quantity">+</button>
            </div>
            <button 
              type="button"
              onClick={handleAddToCart}
              className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
                 <ShoppingCart className="mr-2 h-5 w-5" aria-hidden /> Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Verified Researcher Reviews Section */}
      <section className="mt-16 bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
               <div className="flex items-center gap-2 mb-2">
                  <div className="h-1 w-8 bg-blue-600 rounded-full" />
                  <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Scientific Community</span>
               </div>
               <h2 className="text-3xl font-black text-gray-900">Verified Researcher Reviews</h2>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
               <div className="text-right">
                  <p className="text-sm font-black text-gray-900">4.9 / 5.0</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Community Rating</p>
               </div>
               <div className="h-10 w-[1px] bg-gray-200" />
               <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
               {
                  name: "Dr. Alexander V.",
                  role: "Clinical Researcher",
                  content: "The purity levels of this batch exceeded our laboratory requirements. We observed consistent results across all test groups. The vacuum sealing remained intact during transit.",
                  date: "2 Days Ago"
               },
               {
                  name: "Sarah M.",
                  role: "Biotech Analyst",
                  content: "Highly impressed with the structural integrity of the lyophilized powder. Reconstitution was immediate and clear. Will be using this as our primary reference material.",
                  date: "1 Week Ago"
               }
            ].map((review, i) => (
               <div key={i} className="space-y-4 p-6 rounded-[2rem] bg-gray-50 border border-gray-100 italic font-medium text-gray-700 relative">
                  <span className="absolute -top-4 -left-2 text-6xl text-blue-100 font-serif">"</span>
                  <p className="relative z-10 leading-relaxed">
                     {review.content}
                  </p>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200/50 not-italic">
                     <div>
                        <p className="text-sm font-black text-gray-900">{review.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{review.role}</p>
                     </div>
                     <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-full">{review.date}</span>
                  </div>
               </div>
            ))}
         </div>
      </section>

      {recommended.length > 0 && (
        <div className="mb-20 mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2>Recommended for you</h2>
            <Link to="/shop" className="text-blue-600 font-bold hover:underline">View all results</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
            {recommended.map(rec => (
              <Link key={rec.id} to={productPath(rec)} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-500">
                <div className="h-48 bg-gray-100 overflow-hidden relative">
                  {rec.images && rec.images.length > 0 ? (
                     <img src={rec.images[0]} alt={rec.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                     <ProductImagePlaceholder productId={String(rec.id)} title={rec.title} className="h-full min-h-[12rem]" />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                <div className="p-6">
                  <h3 className="group-hover:text-blue-600 transition-colors truncate">{rec.title}</h3>
                  <p className={`text-blue-600 font-black ${rec.variants && rec.variants.length > 1 ? 'text-lg' : 'text-xl'} mt-2`}>
                    {rec.variants && rec.variants.length > 1 
                      ? `${formatCurrency(Math.min(...rec.variants.map((v: any) => v.display_price)))} – ${formatCurrency(Math.max(...rec.variants.map((v: any) => v.display_price)))}`
                      : formatCurrency(rec.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed (Phase 2) */}
      {recentlyViewed.length > 0 && (
        <div className="mb-12 pt-12 border-t border-gray-100">
          <h2 className="text-gray-500 uppercase tracking-widest mb-8">Recently viewed</h2>
          <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar">
            {recentlyViewed.map(rv => (
              <Link key={`rv-${rv.id}`} to={productPath(rv)} className="flex-shrink-0 w-48 group">
                <div className="h-48 rounded-2xl bg-gray-100 overflow-hidden border border-gray-50 group-hover:shadow-lg transition-all">
                  {rv.images?.[0] ? (
                    <img src={rv.images[0]} alt={rv.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <ProductImagePlaceholder productId={String(rv.id)} title={rv.title} className="h-full min-h-[12rem] rounded-2xl" />
                  )}
                </div>
                <h4 className="mt-3 group-hover:text-blue-600 line-clamp-1">{rv.title}</h4>
                <p className={`text-gray-400 ${rv.variants && rv.variants.length > 1 ? 'text-[10px]' : 'text-xs'} font-medium mt-1`}>
                  {rv.variants && rv.variants.length > 1 
                    ? `${formatCurrency(Math.min(...rv.variants.map((v: any) => v.display_price)))} – ${formatCurrency(Math.max(...rv.variants.map((v: any) => v.display_price)))}`
                    : formatCurrency(rv.price)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
