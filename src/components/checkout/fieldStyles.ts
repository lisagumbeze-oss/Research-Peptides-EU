import { cn } from '../../lib/utils';

export function checkoutFieldClass(invalid: boolean) {
  return cn(
    'w-full p-4 bg-mist-50 rounded-2xl outline-none font-bold text-navy-950',
    'transition-[box-shadow,border-color] duration-200',
    invalid
      ? 'border border-error ring-2 ring-error/30 focus:ring-error'
      : 'border border-transparent focus:ring-2 focus:ring-brand-400',
  );
}

export function checkoutSelectClass(invalid: boolean) {
  return cn(
    'w-full p-4 bg-mist-50 rounded-2xl outline-none font-semibold text-navy-950',
    'appearance-none cursor-pointer transition-[box-shadow,border-color] duration-200',
    invalid
      ? 'border border-error ring-2 ring-error/30 focus:ring-error'
      : 'border border-brand-100 focus:ring-2 focus:ring-brand-400',
  );
}

export function checkoutChoiceClass(selected: boolean) {
  return cn(
    'flex items-center justify-between p-4 rounded-2xl border-2 text-left',
    'transition-colors motion-safe:active:scale-[0.99]',
    selected
      ? 'border-brand-500 bg-brand-50/50 shadow-card'
      : 'border-brand-50 bg-mist-50/50 hover:border-brand-200',
  );
}

export function checkoutPaymentChoiceClass(selected: boolean) {
  return cn(
    'relative flex items-center gap-5 p-6 rounded-[2rem] border-2',
    'transition-colors motion-safe:active:scale-[0.99]',
    selected
      ? 'border-brand-500 bg-brand-50/30 shadow-card'
      : 'border-brand-50 bg-mist-50/30 hover:border-brand-200',
  );
}
