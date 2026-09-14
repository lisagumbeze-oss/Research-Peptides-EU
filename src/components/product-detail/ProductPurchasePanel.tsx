import { useEffect, useMemo, useRef, useState } from 'react';
import { LocaleLink } from '../../i18n/LocaleLink';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  ChevronDown,
  Heart,
  LinkIcon,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Zap,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Button, Badge } from '../../design-system';
import { accordionMotion, fadeUpVariants } from '../../design-system/motion';
import { ProductBadge } from '../products/ProductBadge';
import { StarRow } from '../products/ProductCardRating';
import { formatCurrency } from '../../lib/utils';
import { cn } from '../../lib/utils';

type Variant = {
  variation_id?: string;
  display_name?: string;
  display_price?: number;
  attributes?: { attribute_pa_peptides?: string };
};

type ProductPurchasePanelProps = {
  title: string;
  description?: string;
  currentPrice: number;
  compareWas: number | null;
  reviewCount: number;
  rating?: number;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  variants: Variant[];
  selectedVariant: Variant | null;
  onSelectVariant: (v: Variant) => void;
  specifications: string[];
  onAddToCart: () => void;
  inWishlist: boolean;
  onToggleWishlist: () => void;
  showShare: boolean;
  onToggleShare: () => void;
  onCopyLink: () => void;
};

import { useChromeStore } from '../../store/useChromeStore';

export function ProductPurchasePanel({
  title,
  description,
  currentPrice,
  compareWas,
  reviewCount,
  rating = 5,
  quantity,
  onQuantityChange,
  variants,
  selectedVariant,
  onSelectVariant,
  specifications,
  onAddToCart,
  inWishlist,
  onToggleWishlist,
  showShare,
  onToggleShare,
  onCopyLink,
}: ProductPurchasePanelProps) {
  const { t } = useTranslation('product');
  const cookieBannerOpen = useChromeStore((s) => s.cookieBannerOpen);
  const basePrice = Number(currentPrice) || 0;
  const reduceMotion = useReducedMotion();
  const enter = fadeUpVariants();
  const shareMotion = accordionMotion(Boolean(reduceMotion));
  const [justAdded, setJustAdded] = useState(false);
  const [ctaInView, setCtaInView] = useState(true);
  const addedTimer = useRef<number>(0);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => window.clearTimeout(addedTimer.current);
  }, []);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => setCtaInView(entry.isIntersecting),
      { root: null, threshold: 0.35, rootMargin: '-8px 0px 0px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleAddToCartClick = () => {
    onAddToCart();
    setJustAdded(true);
    window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setJustAdded(false), 1600);
  };

  const bundleTiers = useMemo(
    () =>
      [
        {
          id: 'standard',
          qty: 1,
          range: t('purchase.unitsRange12'),
          label: t('purchase.bulkStandard'),
          discount: 0,
        },
        {
          id: 'save',
          qty: 3,
          range: t('purchase.unitsRange35'),
          label: t('purchase.bulkSave10'),
          discount: 0.1,
        },
        {
          id: 'value',
          qty: 5,
          range: t('purchase.unitsRange6'),
          label: t('purchase.bulkBestValue'),
          discount: 0.15,
        },
      ] as const,
    [t],
  );

  const trustBadges = useMemo(
    () =>
      [
        { icon: ShieldCheck, label: t('purchase.hplcTested') },
        { icon: Truck, label: t('purchase.euDispatch') },
        { icon: Zap, label: t('purchase.coldChain') },
      ] as const,
    [t],
  );

  return (
    <motion.div
      className="lg:sticky lg:top-24 space-y-6"
      variants={enter}
      initial="hidden"
      animate="visible"
    >
      <div className="flex justify-between items-start gap-4">
        <h1 className="text-h2 font-display font-bold text-navy-950">{title}</h1>
        <div className="flex gap-2 shrink-0 relative">
          <button
            type="button"
            onClick={onToggleShare}
            className="p-2.5 rounded-xl border border-brand-100 text-steel-600 hover:bg-brand-50 hover:text-brand-600 motion-safe:active:scale-95 transition-colors"
            aria-expanded={showShare}
            aria-label={t('purchase.shareProduct')}
          >
            <Share2 className="h-5 w-5" />
          </button>
          <AnimatePresence>
            {showShare ? (
              <motion.div
                {...shareMotion}
                className="absolute right-0 top-12 bg-white border border-brand-100 shadow-elevated rounded-xl p-2 z-10"
                role="menu"
              >
                <button
                  type="button"
                  onClick={onCopyLink}
                  className="p-2 rounded-lg hover:bg-brand-50 text-steel-600"
                  aria-label={t('purchase.copyLinkAria')}
                >
                  <LinkIcon className="h-5 w-5" />
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
          <button
            type="button"
            onClick={onToggleWishlist}
            className={cn(
              'p-2.5 rounded-xl border transition-colors motion-safe:active:scale-95',
              inWishlist
                ? 'border-error/30 bg-red-50 text-error'
                : 'border-brand-100 text-steel-600 hover:bg-brand-50',
            )}
            aria-label={inWishlist ? t('purchase.removeWishlist') : t('purchase.addWishlist')}
          >
            <Heart className="h-5 w-5" fill={inWishlist ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <StarRow
          rating={rating}
          starClassName="h-4 w-4"
          filledClassName="text-warning"
          emptyClassName="text-brand-100"
        />
        <span className="text-sm text-steel-600">{t('purchase.reviewsCount', { count: reviewCount })}</span>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          {compareWas != null && (
            <span className="text-lg font-semibold text-silver-400 line-through tabular-nums block">
              {formatCurrency(compareWas)}
            </span>
          )}
          <motion.span
            key={basePrice}
            initial={{ opacity: reduceMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="text-3xl md:text-4xl font-display font-bold text-navy-950 tabular-nums block"
          >
            {formatCurrency(basePrice)}
          </motion.span>
        </div>
        <Badge variant="purity">{t('purchase.priceVerified')}</Badge>
      </div>

      {description ? (
        <p className="text-steel-600 text-sm leading-relaxed whitespace-pre-line">{description}</p>
      ) : null}

      {variants.length > 0 && (
        <div className="p-4 rounded-2xl bg-mist-50 border border-brand-100">
          <label
            htmlFor="product-specification"
            className="text-caption text-brand-600 mb-3 block"
          >
            {t('purchase.specification')}
          </label>
          <div className="relative">
            <select
              id="product-specification"
              value={
                selectedVariant?.variation_id ??
                variants[0]?.variation_id ??
                '0'
              }
              onChange={(e) => {
                const value = e.target.value;
                const next =
                  variants.find((v, i) => String(v.variation_id ?? i) === value) ??
                  variants[0];
                if (next) onSelectVariant(next);
              }}
              className={cn(
                'w-full h-12 appearance-none rounded-xl border-2 border-brand-100 bg-white',
                'pl-4 pr-10 text-sm font-semibold text-navy-950',
                'transition-[border-color,box-shadow] duration-200',
                'focus:outline-none focus:ring-2 focus:ring-brand-400/50 focus:border-brand-500',
                'hover:border-brand-300',
              )}
            >
              {variants.map((v, i) => {
                const label =
                  v.attributes?.attribute_pa_peptides ||
                  v.display_name ||
                  t('purchase.variantFallback', { index: i + 1 });
                return (
                  <option key={v.variation_id || i} value={String(v.variation_id ?? i)}>
                    {label}
                  </option>
                );
              })}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-600"
              aria-hidden
            />
          </div>
        </div>
      )}

      {specifications.length > 0 && (
        <div>
          <h3 className="text-caption text-brand-600 mb-3">{t('purchase.productProfile')}</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {specifications.map((spec, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-sm text-steel-600 bg-white px-3 py-2 rounded-xl border border-brand-50"
              >
                <CheckCircle2 className="h-4 w-4 text-brand-500 shrink-0" />
                <span className="line-clamp-2">{spec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-4">
          <ProductBadge type="verified" size="sm" />
          <span className="text-caption text-silver-400">{t('purchase.researchBundle')}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {bundleTiers.map((tier) => {
            const unitPrice = basePrice * (1 - tier.discount);
            const isSelected =
              (tier.qty === 1 && quantity < 3) ||
              (tier.qty === 3 && quantity >= 3 && quantity < 5) ||
              (tier.qty === 5 && quantity >= 5);

            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => onQuantityChange(tier.qty)}
                className={cn(
                  'p-3 rounded-2xl border-2 text-center transition-colors motion-safe:active:scale-[0.98]',
                  isSelected
                    ? 'border-brand-500 bg-brand-50 shadow-card'
                    : 'border-brand-50 bg-white hover:border-brand-200',
                )}
                aria-pressed={isSelected}
              >
                <span className="text-[10px] font-bold uppercase tracking-wide text-brand-600 block mb-1">
                  {tier.label}
                </span>
                <span className="text-xs text-steel-600 block mb-1">{tier.range}</span>
                <span className="text-base font-bold text-navy-950 tabular-nums">
                  {formatCurrency(unitPrice)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {trustBadges.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center p-3 rounded-2xl bg-brand-50/80 border border-brand-100 text-center"
          >
            <Icon className="h-5 w-5 text-brand-600 mb-1" />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-800">{label}</span>
          </div>
        ))}
      </div>

      <div ref={ctaRef} className="flex gap-3">
        <div className="flex items-center border border-brand-100 rounded-xl overflow-hidden bg-white shadow-card">
          <button
            type="button"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="px-4 py-3 text-steel-600 hover:bg-brand-50 motion-safe:active:scale-95 transition-colors"
            aria-label={t('purchase.decreaseQty')}
          >
            −
          </button>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => onQuantityChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-14 text-center font-bold text-navy-950 border-x border-brand-100 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            aria-label={t('purchase.quantity')}
          />
          <button
            type="button"
            onClick={() => onQuantityChange(quantity + 1)}
            className="px-4 py-3 text-steel-600 hover:bg-brand-50 motion-safe:active:scale-95 transition-colors"
            aria-label={t('purchase.increaseQty')}
          >
            +
          </button>
        </div>
        <Button
          size="lg"
          fullWidth
          onClick={handleAddToCartClick}
          className={cn('gap-2 flex-1', justAdded && 'bg-success hover:brightness-100')}
          aria-live="polite"
        >
          {justAdded ? (
            <CheckCircle2 className="h-5 w-5" aria-hidden />
          ) : (
            <ShoppingCart className="h-5 w-5" aria-hidden />
          )}
          {justAdded ? t('purchase.addedToCart', { defaultValue: 'Added' }) : t('purchase.addToCart')}
        </Button>
      </div>

      <p className="text-xs text-silver-400 text-center space-y-1">
        <span className="block font-semibold text-steel-600">{t('purchase.researchOnly')}</span>
        <span className="block">{t('purchase.researchOnlyDetail')}</span>
        <span className="block">
          <LocaleLink to="/coas" className="text-brand-600 hover:underline font-medium">
            {t('purchase.viewCoaLibrary')}
          </LocaleLink>
          {' · '}
          {t('purchase.laboratoryOnly')}
        </span>
      </p>

      {/* Sticky buy bar — mobile only, when primary CTA scrolls away */}
      <AnimatePresence>
        {!ctaInView && !cookieBannerOpen ? (
          <motion.div
            key="mobile-buy-bar"
            initial={reduceMotion ? false : { y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduceMotion ? undefined : { y: 24, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="md:hidden fixed z-[55] left-0 right-0 bottom-above-mobile-nav px-3 pointer-events-none"
            role="region"
            aria-label={t('purchase.addToCart')}
          >
            <div className="pointer-events-auto mx-auto max-w-lg flex items-center gap-3 rounded-2xl border border-brand-100 bg-white/95 backdrop-blur-xl shadow-elevated p-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-steel-600 truncate">{title}</p>
                <p className="text-base font-display font-bold text-navy-950 tabular-nums">
                  {formatCurrency(basePrice)}
                </p>
              </div>
              <Button
                size="md"
                onClick={handleAddToCartClick}
                className={cn('gap-2 shrink-0', justAdded && 'bg-success hover:brightness-100')}
                aria-live="polite"
              >
                {justAdded ? (
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                ) : (
                  <ShoppingCart className="h-4 w-4" aria-hidden />
                )}
                {justAdded
                  ? t('purchase.addedToCart', { defaultValue: 'Added' })
                  : t('purchase.addToCart')}
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
