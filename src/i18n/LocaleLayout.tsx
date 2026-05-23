import { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocale } from './LocaleProvider';
import { DEFAULT_LOCALE, pathWithLocale, persistLocaleCookie, stripLocaleFromPath } from './routing';
import { isLocaleCode } from './locales';
import { LocaleHead } from './LocaleHead';

/**
 * Validates :locale from the URL, syncs i18n + context, or redirects legacy paths
 * (e.g. /shop → /en/shop when "shop" is not a locale code).
 */
export function LocaleLayout() {
  const { locale: paramLocale } = useParams<{ locale: string }>();
  const location = useLocation();
  const { setLocale } = useLocale();
  const { i18n } = useTranslation();

  if (!paramLocale || !isLocaleCode(paramLocale)) {
    let target = DEFAULT_LOCALE;
    try {
      const ls = localStorage.getItem('rp-eu-locale');
      if (ls && isLocaleCode(ls)) target = ls;
    } catch {
      /* ignore */
    }
    return <Navigate to={pathWithLocale(target, location.pathname)} replace />;
  }

  useEffect(() => {
    setLocale(paramLocale);
    void i18n.changeLanguage(paramLocale);
    persistLocaleCookie(paramLocale);
  }, [paramLocale, setLocale, i18n]);

  return (
    <>
      <LocaleHead />
      <Outlet />
    </>
  );
}
