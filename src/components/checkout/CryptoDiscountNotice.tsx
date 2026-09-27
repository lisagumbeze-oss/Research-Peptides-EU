import { Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CRYPTO_PAYMENT_DISCOUNT_PERCENT } from '../../lib/paymentConfig';
import { cn } from '../../lib/utils';

type CryptoDiscountNoticeProps = {
  className?: string;
  compact?: boolean;
};

/** Encourages cryptocurrency checkout and states the automatic product-subtotal discount. */
export function CryptoDiscountNotice({ className, compact = false }: CryptoDiscountNoticeProps) {
  const { t } = useTranslation('checkout');
  const percent = CRYPTO_PAYMENT_DISCOUNT_PERCENT;

  return (
    <p
      className={cn(
        'flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5 text-xs font-semibold leading-relaxed text-brand-800',
        className,
      )}
      role="note"
    >
      <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
      <span>
        {compact
          ? t('cryptoDiscount.compact', { percent })
          : t('cryptoDiscount.notice', { percent })}
      </span>
    </p>
  );
}
