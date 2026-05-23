import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

type CheckoutProgressProps = {
  step: number;
};

export function CheckoutProgress({ step }: CheckoutProgressProps) {
  const { t } = useTranslation('checkout');
  const STEPS = [
    { id: 1, name: t('steps.shipping') },
    { id: 2, name: t('steps.payment') },
    { id: 3, name: t('steps.confirm') },
  ];

  return (
    <div className="flex items-center justify-between mb-10 max-w-2xl mx-auto">
      {STEPS.map((s, idx) => (
        <div key={s.id} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all',
                step >= s.id ? 'bg-brand-500 text-white shadow-glow' : 'bg-brand-50 text-silver-400',
              )}
            >
              {step > s.id ? <CheckCircle className="w-5 h-5" aria-hidden /> : s.id}
            </div>
            <span
              className={cn(
                'text-[10px] uppercase tracking-wider font-semibold mt-2',
                step >= s.id ? 'text-brand-600' : 'text-silver-400',
              )}
            >
              {s.name}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div className="flex-1 h-0.5 mx-3 bg-brand-100 self-center -mt-6 min-w-[2rem]">
              <div
                className={cn(
                  'h-full bg-brand-500 transition-all duration-500',
                  step > s.id ? 'w-full' : 'w-0',
                )}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
