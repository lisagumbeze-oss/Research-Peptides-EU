import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Truck, ShoppingCart, Star, Heart, Sparkles, Users, Globe, Activity, LifeBuoy, Send, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../supabase';
import { useCartStore } from '../store/useCartStore';
import { useToastStore } from '../store/useToastStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useAuthStore } from '../store/useAuthStore';
import { ProductSkeleton } from '../components/Skeleton';
import { useWizardStore } from '../store/useWizardStore';
import heroBg from '../assets/hero_bg.png';
import vialsHero from '../assets/vials_hero.png';
import heroImage from '../assets/hero_peptides.png';
import scientistLab from '../assets/scientist_lab.png';
import { CatalogTrustStrip } from '../components/products/CatalogTrustStrip';
import { ProductCardRating } from '../components/products/ProductCardRating';
import { ProductImagePlaceholder } from '../components/products/ProductImagePlaceholder';
import { ProductCardPriceBlock } from '../components/products/ProductCardPriceBlock';
import { productPath } from '../lib/productUrl';
import { ProductBadge } from '../components/products/ProductBadge';
import { getPrimaryProductBadge } from '../lib/productBadges';

export default function Home() {
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore(state => state.addItem);
  const addToast = useToastStore(state => state.addToast);
  const { productIds, toggleWishlist } = useWishlistStore();
  const { user } = useAuthStore();
  const { openWizard } = useWizardStore();

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase.from('products').select('*').limit(4);
      if (data) setFeatured(data);
      setLoading(false);
    };
    fetchFeatured();
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-[#0A0F1E]">
        {/* Background: Artistic scientific pattern */}
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt=""
            aria-hidden={true}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0F1E]/80 via-transparent to-[#0A0F1E]/60" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16 md:py-24">
          {/* Glassmorphic Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl shadow-black/40"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 items-center">
              {/* Left: Text Content */}
              <div className="p-8 md:p-12 lg:p-16">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight mb-6">
                  PREMIUM{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                    PEPTIDES.
                  </span>
                </h1>

                <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-8 max-w-md">
                  Sourced for precision and purity. Third-party lab tested
                  to ensure 99%+ consistency for your scientific studies.
                  Fast UK-wide shipping.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-3 bg-blue-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/30 uppercase text-sm tracking-wider"
                  >
                    Explore the Catalog
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={openWizard}
                    className="inline-flex items-center gap-3 bg-blue-600/20 backdrop-blur-md border border-blue-500/30 text-white font-bold py-4 px-8 rounded-xl hover:bg-blue-600 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/10 uppercase text-sm tracking-wider group"
                  >
                    <Sparkles className="h-4 w-4 text-blue-400 group-hover:text-white" />
                    Compound Selector
                  </button>
                </div>
              </div>

              {/* Right: Product Vials Image */}
              <div className="relative flex items-center justify-center p-6 md:p-10">
                <motion.img
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                  src={vialsHero}
                  alt="Premium Research Peptide Vials"
                  className="w-full max-w-md object-contain drop-shadow-[0_20px_40px_rgba(37,99,235,0.15)]"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <CatalogTrustStrip />

      {/* Trust Stats Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-blue-900/5 flex flex-wrap justify-between items-center gap-8 border border-gray-100">
            {[
              { label: 'Purity Level', value: '99.8%', icon: ShieldCheck },
              { label: 'Happy Researchers', value: '15k+', icon: Users },
              { label: 'Countries Shipped', value: '85+', icon: Globe },
              { label: 'Crypto Privacy', value: 'Verified', icon: Zap }
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-900 font-black text-2xl">{stat.value}</span>
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commitment to Excellence - New Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Institutional Standards</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">UNRIVALLED RESEARCH <span className="text-blue-600">INTEGRITY.</span></h2>
            <p className="text-gray-500 font-medium">We uphold the most stringent laboratory protocols in the industry, ensuring your scientific pursuits are built on a foundation of absolute precision.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: Activity, 
                title: 'Analytical Excellence', 
                desc: 'Every compound undergoes rigorous HPLC and MS analysis to guarantee 99%+ chemical purity and molecular consistency.' 
              },
              { 
                icon: LifeBuoy, 
                title: 'Scientific Consultation', 
                desc: 'Our technical support team provide comprehensive research documentation and logistical guidance for complex study protocols.' 
              },
              { 
                icon: Send, 
                title: 'Priority Dispatch', 
                desc: 'Logistics optimized for research timelines, featuring temperature-controlled tracking and guaranteed next-day dispatch protocols.' 
              },
              { 
                icon: Award, 
                title: 'Regulatory Integrity', 
                desc: 'Fully compliant with international research chemical standards, ensuring the highest echelon of quality for your laboratory.' 
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-[2.5rem] bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-100 transition-all duration-500"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-blue-600 group-hover:shadow-lg group-hover:shadow-blue-200 transition-all duration-500">
                  <item.icon className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors duration-500" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Elite Formulations Showcase */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-50 rounded-full blur-[120px] -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl">
              <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Proven Efficacy</span>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight">MOST ACCLAIMED <br /><span className="text-blue-600 uppercase">Research Compounds</span></h2>
              <p className="mt-4 text-gray-500 font-medium leading-relaxed">
                Scientifically proven sequences with unrivaled purification records. Pioneering the next generation of metabolic and cognitive research protocols.
              </p>
            </div>
            <Link to="/shop" className="group flex items-center gap-4 bg-gray-50 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-900 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm">
              Explore Full Catalog <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
            </Link>
          </div>

          {/* Mobile-optimized grid: 2 columns starting from base */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
              {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
              {featured.map((product, i) => {
                const primaryBadge = getPrimaryProductBadge(product);
                return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative bg-white rounded-[3rem] p-4 shadow-xl shadow-gray-200/40 border border-gray-100 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-3"
                >
                  {/* Badge */}
                  <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20 flex flex-col items-start gap-1">
                    {primaryBadge ? <ProductBadge type={primaryBadge} size="sm" className="animate-pulse" /> : <ProductBadge type="elite" size="sm" className="animate-pulse" />}
                    {Number(product.inventory) < 10 ? <ProductBadge type="low_stock" size="sm" /> : null}
                  </div>

                  <Link to={productPath(product)} className="block relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-gray-50 mb-8">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      />
                    ) : (
                      <ProductImagePlaceholder productId={String(product.id)} title={product.title} className="h-full min-h-full rounded-[2.5rem]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(product.id, user?.id || '');
                      }}
                      className="absolute top-4 right-4 p-4 rounded-full bg-white/90 backdrop-blur-md text-gray-300 hover:text-red-500 transition-all active:scale-75 shadow-xl hover:shadow-red-100"
                      aria-label={productIds.includes(product.id) ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`}
                    >
                      <Heart className="h-5 w-5" fill={productIds.includes(product.id) ? "currentColor" : "none"} />
                    </button>
                  </Link>

                  <div className="px-6 pb-8">
                    <div className="flex items-center gap-2 mb-3">
                       <span className="w-2 h-2 rounded-full bg-emerald-500" />
                       <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">In Stock: UK Dispatch</span>
                    </div>
                    
                    <Link to={productPath(product)} className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">
                      {product.title}
                    </Link>
                    <ProductCardRating
                      rating={product.rating}
                      reviewCount={product.review_count}
                      className="mb-3"
                      starClassName="h-3.5 w-3.5"
                    />
                    
                    <div className="flex items-center justify-between mt-4 pt-6 border-t border-gray-50">
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Stock Verified</p>
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
                          addToast(`${product.title} secured in cart`);
                        }}
                        className="bg-gray-900 text-white p-5 rounded-2xl hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-200 transition-all active:scale-95 group/btn"
                        aria-label={`Add ${product.title} to cart`}
                      >
                        <ShoppingCart className="h-6 w-6 transition-transform group-hover/btn:scale-110" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )})}
            </div>
          )}
        </div>
      </section>

      {/* Features Multi-Grid */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/5 -skew-x-12 translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="mb-8 leading-tight">
                WHY RESEARCHERS <br />
                <span className="text-blue-500">TRUST RESEARCH PEPTIDES UK</span>
              </h2>
              <div className="space-y-8">
                {[
                  { icon: ShieldCheck, title: '99% Purity Protocols', desc: 'Each batch is logged and cross-referenced with COA documentation.' },
                  { icon: Zap, title: 'Crypto Privacy', desc: 'Accepting BTC, ETH, USDT for complete transaction anonymity.' },
                  { icon: Truck, title: 'Guaranteed Stealth', desc: 'Bypass delays with our proprietary stealth shipping methods.' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-6"
                  >
                    <div className="flex-shrink-0 w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <item.icon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative">
              {/* Reduced height aspect ratio: aspect-video or aspect-[16/10] */}
              <div className="aspect-video lg:aspect-[4/3] bg-gray-800 rounded-[3rem] overflow-hidden border border-white/5 relative group">
                <img src={heroImage} alt="Premium peptide research laboratory setting" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] w-3/4 mx-auto">
                    <Star className="h-10 w-10 text-blue-500 mx-auto mb-4 fill-current" />
                    <p className="text-lg font-medium italic mb-4">"The purity levels are consistent, shipping is exceptional. 5/5 stars for research reliability."</p>
                    <span className="text-xs font-black uppercase tracking-widest text-blue-500">Dr. Sarah K. — Pharma Research</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gold Standard British Peptides Section */}
      <section className="py-24 bg-white overflow-hidden border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 px-4">
             <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4 block animate-pulse">National Excellence</span>
             <h2 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight">
               THE PREMIER DESTINATION FOR <br />
               <span className="text-blue-600 uppercase">British Peptide Research</span>
             </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Left Column: Custom Imagery */}
            <motion.div 
               initial={{ opacity: 0, x: -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8 }}
               className="relative"
            >
               <div className="relative z-10 rounded-[4rem] overflow-hidden shadow-2xl shadow-blue-900/10 border-[12px] border-white group">
                  <img 
                    src={scientistLab} 
                    alt="Purity and Precision" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-transparent to-transparent" />
               </div>
               {/* Decorative Gradient Blob */}
               <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl -z-10" />
            </motion.div>

            {/* Right Column: Key Benefits and Call to Action */}
            <div className="space-y-12">
               {/* 2-Row Benefit Matrix */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { title: 'Source Purest Peptides', bg: 'bg-amber-50 border-amber-100 text-amber-900', icon: '💎' },
                    { title: 'Elite Support Service', bg: 'bg-blue-50 border-blue-100 text-blue-900', icon: '🎧' },
                    { title: 'VIP Eligibility Status', bg: 'bg-slate-50 border-slate-100 text-slate-900', icon: '👑' },
                    { title: 'Institutional Purity', bg: 'bg-emerald-50 border-emerald-100 text-emerald-900', icon: '🔬' }
                  ].map((block, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className={`p-6 rounded-[2rem] border ${block.bg} flex items-center gap-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-300`}
                    >
                      <span className="text-2xl">{block.icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{block.title}</span>
                    </motion.div>
                  ))}
               </div>

               {/* Context Paragraphs */}
               <div className="space-y-8">
                  <div className="p-1 rounded-full bg-blue-50 w-fit px-4 border border-blue-100 mb-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Established Integrity</span>
                  </div>
                  <div className="space-y-6 text-gray-500 font-medium leading-[1.8]">
                     <p className="text-lg text-gray-900 font-bold leading-relaxed">
                       Research Peptides UK is the leading specialist for high-purity research compounds in the UK, bridging the gap between cutting-edge molecular engineering and institutional lab access.
                     </p>
                     <p>
                       Our British-sourced peptides are engineered for precision, offering unmatched structural integrity and molecular purity. Every compound is strictly for laboratory research, provided with comprehensive technical documentation to uphold the standards your study deserves.
                     </p>
                  </div>
               </div>

               {/* Final Call to Action */}
               <motion.div
                 initial={{ opacity: 0, scale: 0.95 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 className="pt-4"
               >
                 <Link 
                   to="/shop" 
                   className="inline-flex items-center gap-4 bg-gray-900 text-white font-black text-xs uppercase tracking-[0.3em] px-12 py-7 rounded-3xl hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-200 transition-all active:scale-95 group"
                 >
                   Access the Collection
                   <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-3" />
                 </Link>
               </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
