import { Navigate } from 'react-router-dom';
import { detectBrowserLocale, isLocaleCode } from './locales';
import { DEFAULT_LOCALE, pathWithLocale, readLocaleCookie } from './routing';

export function LocaleRedirect() {
  let locale = DEFAULT_LOCALE;
  try {
    const ls = localStorage.getItem('rp-eu-locale');
    if (ls && isLocaleCode(ls)) locale = ls;
    else {
      const cookie = readLocaleCookie();
      locale = cookie ?? detectBrowserLocale();
    }
  } catch {
    locale = detectBrowserLocale();
  }

  return <Navigate to={pathWithLocale(locale, '/')} replace />;
}
