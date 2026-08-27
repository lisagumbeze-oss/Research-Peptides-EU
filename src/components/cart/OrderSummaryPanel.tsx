import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Tag, X, ShieldCheck, Truck } from 'lucide-react';
import { Button, FormError, GlassPanel } from '../../design-system';
import { accordionMotion } from '../../design-system/motion';
import { formatCurrency, cn } from '../../lib/utils';
import { PRIMARY_PROMO_CODE } from '../../lib/promoCodes';

type OrderSummaryPanelProps = {
  subtotal: number;
  discount: number;
  discountPercent: number;
  total: number;
  promoCode: string | null;
  promoInput: string;
  promoError: string;
  onPromoInputChange: (value: string) => void;
  onApplyPromo: () => void;
  onClearPromo: () => void;
  onCheckout: () => void;
  checkoutLabel?: string;
  sticky?: boolean;
};

export function OrderSummaryPanel({
  subtotal,
  discount,
  discountPercent,
  total,
  promoCode,
  promoInput,
  promoError,
  onPromoInputChange,
  onApplyPromo,
  onClearPromo,
  onCheckout,
  checkoutLabel,
  sticky = true,
}: OrderSummaryPanelProps) {
  const { t } = useTranslation('checkout');
  const reduceMotion = useReducedMotion();
  const promoMotion = accordionMotion(Boolean(reduceMotion));
  const proceedLabel = checkoutLabel ?? t('cart.proceed');
  const discountAmount = (subtotal * discount) / 100;

  return (
    <GlassPanel
      variant="light"
      padding="md"
      className={`shadow-glow h-fit ${sticky ? 'lg:sticky lg:top-24' : ''}`}
    >
      <h2 className="font-display font-bold text-lg text-navy-950 mb-6">{t('cart.summary')}</h2>

      <div className="mb-6">
        <label htmlFor="order-promo-code" className="text-caption text-brand-600 block mb-2">
          {t('cart.promo')}
        </label>
        <div className="flex gap-2">
          <input
            id="order-promo-code"
            type="text"
            value={promoInput}
            onChange={(e) => onPromoInputChange(e.target.value)}
            placeholder={PRIMARY_PROMO_CODE}
            aria-invalid={promoError ? true : undefined}
            aria-describedby={promoError ? 'order-promo-code-error' : undefined}
            className={cn(
              'flex-1 min-w-0 px-4 py-2.5 rounded-xl border bg-mist-50 text-sm',
              'focus:outline-none focus:ring-2 transition-[border-color,box-shadow] duration-200',
              promoError
                ? 'border-error focus:ring-error/40'
                : 'border-brand-100 focus:ring-brand-400',
            )}
          />
          <Button type="button" variant="secondary" size="sm" onClick={onApplyPromo}>
            Apply
          </Button>
        </div>
        <FormError message={promoError} id="order-promo-code-error" className="mt-2" />
        <AnimatePresence>
          {promoCode ? (
            <motion.div
              key="promo-applied"
              {...promoMotion}
              className="flex items-center justify-between mt-3 bg-brand-50 px-3 py-2 rounded-xl border border-brand-100"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-brand-700">
                <Tag className="h-4 w-4" aria-hidden />
                {promoCode} applied
              </span>
              <button
                type="button"
                onClick={onClearPromo}
                className="text-brand-400 hover:text-brand-600 p-1 motion-safe:active:scale-95"
                aria-label="Remove promotion code"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <dl className="space-y-3 text-sm mb-6">
        <div className="flex justify-between text-steel-600">
          <dt>{t('cart.subtotal')}</dt>
          <dd className="font-semibold text-navy-950 tabular-nums">{formatCurrency(subtotal)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-success font-semibold">
            <dt>{t('cart.discount')} ({discountPercent}%)</dt>
            <dd className="tabular-nums">−{formatCurrency(discountAmount)}</dd>
          </div>
        )}
        <div className="flex justify-between text-steel-600">
          <dt>{t('cart.shipping')}</dt>
          <dd className="text-xs italic text-silver-400">{t('cart.shippingAtCheckout')}</dd>
        </div>
        <div className="border-t border-brand-100 pt-4 flex justify-between items-center">
          <dt className="font-display font-bold text-navy-950">{t('cart.total')}</dt>
          <dd className="text-2xl font-display font-bold text-brand-600 tabular-nums">
            <motion.span
              key={total}
              initial={{ opacity: reduceMotion ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              className="inline-block"
            >
              {formatCurrency(total)}
            </motion.span>
          </dd>
        </div>
      </dl>

      <Button size="lg" fullWidth onClick={onCheckout}>
        {proceedLabel}
      </Button>

      <p className="mt-4 text-[11px] text-steel-600 leading-relaxed">{t('cart.vatNote')}</p>

      <div className="mt-4 flex flex-wrap justify-center gap-4 pt-4 border-t border-brand-50 text-[10px] font-semibold uppercase tracking-wider text-silver-400">
        <span className="flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-500" aria-hidden />
          Secure checkout
        </span>
        <span className="flex items-center gap-1">
          <Truck className="h-3.5 w-3.5 text-brand-500" aria-hidden />
          EU dispatch
        </span>
      </div>
    </GlassPanel>
  );
}
