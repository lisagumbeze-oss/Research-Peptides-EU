import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LocaleLink } from '../i18n/LocaleLink';
import { useLocaleNavigate } from '../i18n/useLocaleNavigate';
import { useTranslation } from 'react-i18next';
import { supabase } from '../supabase';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useToastStore } from '../store/useToastStore';
import { DetailedProductSkeleton } from '../components/Skeleton';
import { productPath } from '../lib/productUrl';
import { Container, Reveal } from '../design-system';
import { ProductGallery } from '../components/product-detail/ProductGallery';
import { ProductPurchasePanel } from '../components/product-detail/ProductPurchasePanel';
import { ProductDescriptionCards } from '../components/product-detail/ProductDescriptionCards';
import { ProductRecommendations } from '../components/product-detail/ProductRecommendations';
import { StarRow } from '../components/products/ProductCardRating';
import { useProductCatalogActions } from '../hooks/useProductCatalogActions';
import type { CatalogProduct } from '../components/products/ProductCard';
import { usePageSeo } from '../seo/SeoProvider';
import { breadcrumbJsonLd, productJsonLd } from '../seo/structuredData';
import type { LocaleCode } from '../i18n/locales';
import { localizedProductDescription, localizedProductTitle } from '../lib/localizedProduct';
import { productDescriptionSummary } from '../lib/parseProductDescription';
import { productDisplaySocialProof } from '../lib/productDisplaySocialProof';
import { findCachedProduct, rememberProduct } from '../lib/catalogCache';
import { stripLocaleFromPath } from '../i18n/routing';

export default function ProductDetails() {
  const { t, i18n } = useTranslation('product');
  const locale = i18n.language as LocaleCode;
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const cachedProduct = findCachedProduct(slug) ?? findCachedProduct(id);
  const [product, setProduct] = useState<any>(cachedProduct ?? null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(!cachedProduct);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(cachedProduct?.variants?.[0] ?? null);
  const [showShare, setShowShare] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState<CatalogProduct[]>([]);

  const addItem = useCartStore((state) => state.addItem);
  const { user } = useAuthStore();
  const { productIds, toggleWishlist } = useWishlistStore();
  const addToast = useToastStore((state) => state.addToast);
  const navigate = useLocaleNavigate();
  const { isInWishlist, handleToggleWishlist, handleAddToCart: addRelatedToCart } =
    useProductCatalogActions();

  const displayTitle = product ? localizedProductTitle(product, locale) : '';
  const displayDescription = product ? localizedProductDescription(product, locale) : '';
  const descriptionTeaser = useMemo(
    () => productDescriptionSummary(displayDescription),
    [displayDescription],
  );
  const socialProof = useMemo(
    () => productDisplaySocialProof(product?.id ?? product?.slug),
    [product?.id, product?.slug],
  );

  const seoConfig = useMemo(() => {
    if (!product) return null;
    const title = localizedProductTitle(product, locale);
    const canonicalPath = productPath(product);
    const plainDescription = String(localizedProductDescription(product, locale) || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 160);
    return {
      title: `${title} | Research Peptides EU`,
      description: plainDescription || `Research-grade ${title} — EUR pricing, EU dispatch.`,
      canonicalPath,
      ogType: 'product' as const,
      ogImage: product.images?.[0] || undefined,
      jsonLd: [
        productJsonLd(product, locale),
        breadcrumbJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Shop', path: '/shop' },
            { name: title, path: canonicalPath },
          ],
          locale,
        ),
      ],
    };
  }, [product, locale]);

  usePageSeo(seoConfig);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      if (!slug && !id) return;
      const fromCache = findCachedProduct(slug) ?? findCachedProduct(id);
      if (fromCache) {
        setProduct(fromCache);
        setLoading(false);
        if (fromCache.variants?.length > 0) {
          setSelectedVariant(fromCache.variants[0]);
        }
      } else {
        setLoading(true);
      }
      try {
        const query = supabase.from('products').select('*');
        const { data: pData } = slug
          ? await query.eq('slug', slug).maybeSingle()
          : await query.eq('id', id as string).maybeSingle();

        if (pData) {
          rememberProduct(pData as CatalogProduct);
          const canonical = productPath(pData);
          if (stripLocaleFromPath(window.location.pathname) !== canonical) {
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

    const title = localizedProductTitle(product, locale);
    if (quantity >= 5) addToast(t('toast.bulk15', { title }));
    else if (quantity >= 3) addToast(t('toast.bulk10', { title }));
    else addToast(t('toast.added', { title }));
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShare(false);
    addToast(t('toast.linkCopied'));
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
        <h2 className="font-display font-bold text-2xl text-navy-950 mb-4">{t('notFound.title')}</h2>
        <LocaleLink to="/shop" className="text-brand-600 font-semibold hover:underline">
          {t('notFound.cta')}
        </LocaleLink>
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
            title={displayTitle}
            images={images}
            activeIndex={activeImage}
            onSelectImage={setActiveImage}
            lowStock={Number(product.inventory) < 50}
          />

          <ProductPurchasePanel
            title={displayTitle}
            description={descriptionTeaser}
            currentPrice={currentPrice}
            compareWas={compareWas}
            reviewCount={socialProof.reviewCount}
            rating={socialProof.rating}
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

        <ProductDescriptionCards description={displayDescription} productTitle={displayTitle} />

        <Reveal as="section" className="rounded-3xl bg-white/90 backdrop-blur-sm border border-brand-100 p-8 md:p-12 shadow-card mb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <p className="text-caption text-brand-600 mb-2">{t('reviews.eyebrow')}</p>
              <h2 className="text-h2 font-display font-bold text-navy-950">{t('reviews.title')}</h2>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-mist-50 border border-brand-50">
              <span className="text-sm font-bold text-navy-950 tabular-nums">
                {socialProof.rating.toFixed(1)} / 5.0
              </span>
              <StarRow
                rating={socialProof.rating}
                starClassName="h-4 w-4"
                filledClassName="text-warning"
                emptyClassName="text-brand-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {socialProof.reviews.map((review) => (
              <blockquote
                key={`${review.name}-${review.date}-${review.content.slice(0, 24)}`}
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
        </Reveal>
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
