import { LocaleLink } from '../../i18n/LocaleLink';
import { Heart, ShoppingCart } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useMemo } from 'react';
import { Card } from '../../design-system';
import { ProductBadge } from './ProductBadge';
import { ProductCardRating } from './ProductCardRating';
import { ProductImagePlaceholder } from './ProductImagePlaceholder';
import { ProductCardPriceBlock } from './ProductCardPriceBlock';
import { getPrimaryProductBadge } from '../../lib/productBadges';
import { productDisplaySocialProof } from '../../lib/productDisplaySocialProof';
import { productPath } from '../../lib/productUrl';
import { staggerDelay } from '../../design-system/motion';
import { cn } from '../../lib/utils';
import { WhatsappIcon } from '../icons/WhatsappIcon';
import { buildWhatsAppLink } from '../../config/brand';

export type CatalogProduct = {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  inventory?: number | null;
  images?: string[] | null;
  rating?: number | null;
  review_count?: number | null;
  slug?: string | null;
  categories?: string[] | null;
  variants?: unknown[];
  compare_at_price?: number | null;
};

type ProductCardProps = {
  product: CatalogProduct;
  index?: number;
  inWishlist: boolean;
  onToggleWishlist: (e: React.MouseEvent) => void;
  onAddToCart: () => void;
  showDescription?: boolean;
  animate?: boolean;
  className?: string;
};

export function ProductCard({
  product,
  index = 0,
  inWishlist,
  onToggleWishlist,
  onAddToCart,
  showDescription = false,
  animate = true,
  className,
}: ProductCardProps) {
  const productHref = productPath(product);
  const primaryBadge = getPrimaryProductBadge(product);
  const lowStock = Number(product.inventory) < 10;
  const categoryLabel = product.categories?.[0];
  const reduceMotion = useReducedMotion();
  const socialProof = useMemo(
    () => productDisplaySocialProof(product.id || product.slug),
    [product.id, product.slug],
  );

  const card = (
    <Card
      variant="product"
      interactive
      className={cn('relative h-full flex flex-col p-0 overflow-hidden group', className)}
    >
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1">
        {primaryBadge ? <ProductBadge type={primaryBadge} size="sm" /> : null}
        {lowStock ? <ProductBadge type="low_stock" size="sm" /> : null}
      </div>

      <LocaleLink
        to={productHref}
        className="relative block aspect-[4/5] overflow-hidden bg-mist-50 m-3 mb-0 rounded-2xl"
      >
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            loading="lazy"
            decoding="async"
            width={400}
            height={500}
            className="h-full w-full object-contain p-6 pt-12 pb-6 transition-transform duration-700 group-hover:scale-105 mix-blend-multiply"
          />
        ) : (
          <ProductImagePlaceholder
            productId={String(product.id)}
            title={product.title}
            className="h-full min-h-full rounded-2xl"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <button
          type="button"
          onClick={onToggleWishlist}
          className={cn(
            'absolute top-3 right-3 z-20 p-2.5 rounded-full backdrop-blur-sm transition-all motion-safe:active:scale-90',
            inWishlist
              ? 'bg-red-50/95 text-error shadow-inner'
              : 'bg-white/90 text-silver-400 hover:text-error hover:bg-white',
          )}
          aria-label={
            inWishlist
              ? `Remove ${product.title} from wishlist`
              : `Add ${product.title} to wishlist`
          }
        >
          <Heart className="h-4 w-4" fill={inWishlist ? 'currentColor' : 'none'} />
        </button>
      </LocaleLink>

      <div className="flex flex-col flex-1 p-4 md:p-5">
        {categoryLabel ? (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-600 mb-1.5">
            {categoryLabel}
          </span>
        ) : null}
        <LocaleLink
          to={productHref}
          className="font-display font-bold text-navy-950 group-hover:text-brand-600 transition-colors line-clamp-2 text-sm md:text-base"
        >
          {product.title}
        </LocaleLink>
        <ProductCardRating
          rating={socialProof.rating}
          reviewCount={socialProof.reviewCount}
          className="mt-2 mb-2"
          starClassName="h-3.5 w-3.5"
        />
        <div className="flex-1 min-h-[0.5rem]" />
        <div className="flex items-center justify-between gap-2 pt-3 mt-auto border-t border-brand-50">
          <ProductCardPriceBlock product={product} />
          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={buildWhatsAppLink(product.title, productHref)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 px-3.5 rounded-xl bg-[#25D366] text-white hover:bg-emerald-600 shadow-card transition-all motion-safe:active:scale-95 flex items-center justify-center"
              aria-label={`Inquire about ${product.title} on WhatsApp`}
              title="Inquire on WhatsApp"
            >
              <WhatsappIcon className="h-5 w-5" />
            </a>
            <button
              type="button"
              onClick={onAddToCart}
              className="p-2.5 px-3.5 rounded-xl bg-navy-950 text-white hover:bg-brand-500 hover:shadow-glow shadow-card transition-all motion-safe:active:scale-95 flex items-center justify-center"
              aria-label={`Add ${product.title} to cart`}
              title="Add to cart"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );

  if (!animate || reduceMotion) return card;

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-24px' }}
      transition={{ delay: staggerDelay(index), duration: 0.35, ease: 'easeOut' }}
    >
      {card}
    </motion.div>
  );
}
