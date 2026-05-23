import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { supabase } from '../supabase';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useToastStore } from '../store/useToastStore';
import { DetailedProductSkeleton } from '../components/Skeleton';
import { productPath } from '../lib/productUrl';
import { Container } from '../design-system';
import { ProductGallery } from '../components/product-detail/ProductGallery';
import { ProductPurchasePanel } from '../components/product-detail/ProductPurchasePanel';
import { ProductRecommendations } from '../components/product-detail/ProductRecommendations';
import { useProductCatalogActions } from '../hooks/useProductCatalogActions';
import type { CatalogProduct } from '../components/products/ProductCard';

const STATIC_REVIEWS = [
  {
    name: 'Dr. Alexander V.',
    role: 'Clinical Research · EU',
    content:
      'Purity levels exceeded our laboratory requirements. Vacuum sealing remained intact during EU transit.',
    date: '2 days ago',
  },
  {
    name: 'Sarah M.',
    role: 'Biotech Analyst · NL',
    content:
      'Structural integrity of the lyophilized powder was excellent. Reconstitution was immediate and clear.',
    date: '1 week ago',
  },
];

export default function ProductDetails() {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [showShare, setShowShare] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState<CatalogProduct[]>([]);

  const addItem = useCartStore((state) => state.addItem);
  const { user } = useAuthStore();
  const { productIds, toggleWishlist } = useWishlistStore();
  const addToast = useToastStore((state) => state.addToast);
  const navigate = useNavigate();
  const { isInWishlist, handleToggleWishlist, handleAddToCart: addRelatedToCart } =
    useProductCatalogActions();

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
          if (pData.variants?.length > 0) {
            setSelectedVariant(pData.variants[0]);
          }
          setActiveImage(0);

          const stored = localStorage.getItem('recentlyViewed');
          let prevIds = stored ? JSON.parse(stored) : [];
          prevIds = [pData.id, ...prevIds.filter((pid: string) => pid !== pData.id)].slice(0, 10);
          localStorage.setItem('recentlyViewed', JSON.stringify(prevIds));

          const displayIds = prevIds.filter((pid: string) => pid !== pData.id).slice(0, 4);
          if (displayIds.length > 0) {
            const { data: rvData } = await supabase.from('products').select('*').in('id', displayIds);
            if (rvData) setRecentlyViewed(rvData as CatalogProduct[]);
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
        if (recData) {
          setRecommended(
            recData.filter((p) => String(p.id) !== String(productId)).slice(0, 3) as CatalogProduct[],
          );
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndReviews();
    window.scrollTo(0, 0);
  }, [slug, id, navigate]);

  const handleAddToCart = () => {
    if (!product) return;
    let pricePerUnit = selectedVariant ? selectedVariant.display_price : product.price;
    if (quantity >= 5) pricePerUnit = pricePerUnit * 0.85;
    else if (quantity >= 3) pricePerUnit = pricePerUnit * 0.9;

    addItem({
      productId: product.id,
      title: product.title,
      price: pricePerUnit,
      quantity,
      imageUrl: product.images?.[0] || '',
      specification: selectedVariant
        ? selectedVariant.attributes?.attribute_pa_peptides || selectedVariant.display_name
        : undefined,
    });

    if (quantity >= 5) addToast(`Bulk discount (15%) applied to ${product.title}`);
    else if (quantity >= 3) addToast(`Bulk discount (10%) applied to ${product.title}`);
    else addToast(`${product.title} added to cart`);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShare(false);
    addToast('Link copied to clipboard');
  };

  if (loading) {
    return (
      <Container className="py-12">
        <DetailedProductSkeleton />
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-20 text-center">
        <h2 className="font-display font-bold text-2xl text-navy-950 mb-4">Product not found</h2>
        <Link to="/shop" className="text-brand-600 font-semibold hover:underline">
          Return to shop
        </Link>
      </Container>
    );
  }

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

  const images: string[] = product.images?.length ? product.images : [];

  return (
    <div className="bg-mist-50 min-h-screen">
      <Container className="py-10 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 mb-16">
          <ProductGallery
            productId={String(product.id)}
            title={product.title}
            images={images}
            activeIndex={activeImage}
            onSelectImage={setActiveImage}
            lowStock={Number(product.inventory) < 50}
          />

          <ProductPurchasePanel
            title={product.title}
            description={product.description}
            currentPrice={currentPrice}
            compareWas={compareWas}
            reviewCount={reviews.length}
            rating={product.rating}
            quantity={quantity}
            onQuantityChange={setQuantity}
            variants={product.variants || []}
            selectedVariant={selectedVariant}
            onSelectVariant={setSelectedVariant}
            specifications={product.specifications || []}
            onAddToCart={handleAddToCart}
            inWishlist={productIds.includes(product.id)}
            onToggleWishlist={() => toggleWishlist(product.id, user?.id || '')}
            showShare={showShare}
            onToggleShare={() => setShowShare((s) => !s)}
            onCopyLink={copyLink}
          />
        </div>

        <section className="rounded-3xl bg-white border border-brand-100 p-8 md:p-12 shadow-card mb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <p className="text-caption text-brand-600 mb-2">Researcher community</p>
              <h2 className="text-h2 font-display font-bold text-navy-950">Verified reviews</h2>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-mist-50 border border-brand-50">
              <span className="text-sm font-bold text-navy-950">4.9 / 5.0</span>
              <div className="flex text-warning">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {STATIC_REVIEWS.map((review) => (
              <blockquote
                key={review.name}
                className="p-6 rounded-2xl bg-mist-50 border border-brand-50 text-steel-600 text-sm leading-relaxed"
              >
                <p className="italic mb-4">&ldquo;{review.content}&rdquo;</p>
                <footer className="flex justify-between items-center not-italic pt-4 border-t border-brand-100">
                  <div>
                    <cite className="font-semibold text-navy-950 not-italic">{review.name}</cite>
                    <p className="text-xs text-silver-400">{review.role}</p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase text-brand-600">{review.date}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </section>
      </Container>

      <ProductRecommendations
        recommended={recommended}
        recentlyViewed={recentlyViewed}
        inWishlist={isInWishlist}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={addRelatedToCart}
      />
    </div>
  );
}
