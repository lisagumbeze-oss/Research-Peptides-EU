import { Navigate } from 'react-router-dom';
import { isLocaleCode } from './locales';
import { DEFAULT_LOCALE, pathWithLocale, readLocaleCookie } from './routing';

export function LocaleRedirect() {
  let locale = DEFAULT_LOCALE;
  try {
    const ls = localStorage.getItem('rp-eu-locale');
    if (ls && isLocaleCode(ls)) {
      locale = ls;
    } else {
      const cookie = readLocaleCookie();
      if (cookie && isLocaleCode(cookie)) {
        locale = cookie;
      }
    }
  } catch {
    locale = DEFAULT_LOCALE;
  }

  return <Navigate to={pathWithLocale(locale, '/')} replace />;
}
