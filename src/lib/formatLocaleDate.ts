import type { LocaleCode } from '../i18n/locales';

/** Format dates using the active storefront locale (BCP 47). */
export function formatLocaleDate(
  value: string | Date,
  locale: string | LocaleCode,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' },
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale, options);
}
