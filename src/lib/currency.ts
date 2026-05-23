import type { LocaleCode } from '../i18n/locales';

/** Canonical storefront currency — prices in Supabase `products.price` are stored in this unit. */
export const DEFAULT_CURRENCY = 'EUR' as const;

/**
 * Fixed GBP→EUR rate used for the one-time catalog migration (May 2026).
 * Document in `server/migrations/006_currency_eur.sql` and migration script output.
 */
export const GBP_TO_EUR_RATE = 1.17;

const LOCALE_TO_INTL: Record<LocaleCode, string> = {
  en: 'en-IE',
  nl: 'nl-NL',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
  it: 'it-IT',
  pt: 'pt-PT',
  hr: 'hr-HR',
  pl: 'pl-PL',
  ro: 'ro-RO',
  cs: 'cs-CZ',
  da: 'da-DK',
  sv: 'sv-SE',
  fi: 'fi-FI',
  el: 'el-GR',
  hu: 'hu-HU',
  sk: 'sk-SK',
  sl: 'sl-SI',
  bg: 'bg-BG',
};

export function localeToIntl(locale: LocaleCode): string {
  return LOCALE_TO_INTL[locale] ?? 'en-IE';
}

export function formatMoney(
  amount: number,
  locale: string = 'en-IE',
  currency: string = DEFAULT_CURRENCY,
): string {
  const value = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function convertGbpToEur(amount: number, rate = GBP_TO_EUR_RATE): number {
  return Math.round(amount * rate * 100) / 100;
}

/** Round-trip helper for admin tools that still accept legacy GBP input. */
export function convertEurToGbp(amount: number, rate = GBP_TO_EUR_RATE): number {
  return Math.round((amount / rate) * 100) / 100;
}

let activeLocale: LocaleCode = 'en';

export function setActiveLocale(locale: LocaleCode): void {
  activeLocale = locale;
}

export function getActiveLocale(): LocaleCode {
  return activeLocale;
}

export function formatCurrency(value: number, locale?: LocaleCode): string {
  const code = locale ?? activeLocale;
  return formatMoney(value, localeToIntl(code), DEFAULT_CURRENCY);
}
