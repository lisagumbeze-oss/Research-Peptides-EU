import type { LocaleCode } from '../i18n/locales';

type ProductRow = {
  title?: string | null;
  description?: string | null;
  title_i18n?: Record<string, string> | null;
  description_i18n?: Record<string, string> | null;
};

/** Localized PDP copy from optional JSONB maps; falls back to canonical DB columns. */
export function localizedProductTitle(product: ProductRow, locale: LocaleCode): string {
  const map = product.title_i18n;
  if (map && typeof map === 'object' && map[locale]?.trim()) return map[locale].trim();
  return String(product.title ?? '');
}

export function localizedProductDescription(product: ProductRow, locale: LocaleCode): string {
  const map = product.description_i18n;
  if (map && typeof map === 'object' && map[locale]?.trim()) return map[locale].trim();
  return String(product.description ?? '');
}
