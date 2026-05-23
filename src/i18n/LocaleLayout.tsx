import { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LocaleProvider, useLocale } from './LocaleProvider';
import { DEFAULT_LOCALE, pathWithLocale, persistLocaleCookie } from './routing';
import { isLocaleCode, type LocaleCode } from './locales';
import { LocaleHead } from './LocaleHead';
import { SeoProvider } from '../seo/SeoProvider';

/**
 * Validates :locale from the URL, syncs i18n + context, or redirects legacy paths
 * (e.g. /shop → /en/shop when "shop" is not a locale code).
 */
export function LocaleLayout() {
  return (
    <LocaleProvider>
      <LocaleLayoutInner />
    </LocaleProvider>
  );
}

function LocaleLayoutInner() {
  const { locale: paramLocale } = useParams<{ locale: string }>();
  const location = useLocation();
  const { setLocale } = useLocale();
  const { i18n } = useTranslation();

  const localeCode: LocaleCode | null =
    paramLocale && isLocaleCode(paramLocale) ? paramLocale : null;

  useEffect(() => {
    if (!localeCode) return;
    setLocale(localeCode);
    void i18n.changeLanguage(localeCode);
    persistLocaleCookie(localeCode);
  }, [localeCode, setLocale, i18n]);

  if (!localeCode) {
    let target = DEFAULT_LOCALE;
    try {
      const ls = localStorage.getItem('rp-eu-locale');
      if (ls && isLocaleCode(ls)) target = ls;
    } catch {
      /* ignore */
    }
    return <Navigate to={pathWithLocale(target, location.pathname)} replace />;
  }

  return (
    <SeoProvider>
      <LocaleHead />
      <Outlet />
    </SeoProvider>
  );
}
