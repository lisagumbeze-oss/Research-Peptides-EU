export const DEFAULT_CURRENCY = 'EUR';

export function formatCurrency(value: number, locale = 'en-IE', currency = DEFAULT_CURRENCY): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}
