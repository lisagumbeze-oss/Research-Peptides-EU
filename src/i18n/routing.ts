import { isLocaleCode, type LocaleCode } from './locales';

export const DEFAULT_LOCALE: LocaleCode = 'en';
const LOCALE_COOKIE = 'rp-eu-locale';

export function getLocaleFromPath(pathname: string): LocaleCode | null {
  const segment = pathname.split('/').filter(Boolean)[0];
  if (segment && isLocaleCode(segment)) return segment;
  return null;
}

/** Path without leading locale segment, always starts with `/` (or `/` for home). */
export function stripLocaleFromPath(pathname: string): string {
  const locale = getLocaleFromPath(pathname);
  if (!locale) return pathname || '/';
  const rest = pathname.slice(locale.length + 1);
  if (!rest || rest === '/') return '/';
  return rest.startsWith('/') ? rest : `/${rest}`;
}

export function pathWithLocale(locale: LocaleCode, path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized === '/') return `/${locale}`;
  return `/${locale}${normalized}`;
}

export function persistLocaleCookie(locale: LocaleCode): void {
  try {
    document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

export function readLocaleCookie(): LocaleCode | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  const value = match?.[1];
  return value && isLocaleCode(value) ? value : null;
}
