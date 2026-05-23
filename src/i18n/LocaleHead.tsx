import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supportedLocales } from './locales';
import { pathWithLocale, stripLocaleFromPath } from './routing';

const SITE_ORIGIN =
  import.meta.env.VITE_SITE_URL?.replace(/\/+$/, '') ||
  (typeof window !== 'undefined' ? window.location.origin : 'https://researchpeptide.eu');

const PAGE_TITLES: Record<string, { en: string; nl?: string; de?: string; fr?: string }> = {
  '/': {
    en: 'Premium Research Peptides',
    nl: 'Premium onderzoekspeptiden',
    de: 'Premium-Forschungspeptide',
    fr: 'Peptides de recherche premium',
  },
  '/shop': {
    en: 'Shop',
    nl: 'Shop',
    de: 'Shop',
    fr: 'Boutique',
  },
  '/cart': { en: 'Cart', nl: 'Winkelwagen', de: 'Warenkorb', fr: 'Panier' },
  '/checkout': { en: 'Checkout', nl: 'Afrekenen', de: 'Kasse', fr: 'Paiement' },
};

function titleForPath(path: string, locale: string): string {
  const entry = PAGE_TITLES[path] ?? PAGE_TITLES['/'];
  const localized = (entry as Record<string, string>)[locale] ?? entry.en;
  return `${localized} | Research Peptides EU`;
}

export function LocaleHead() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const locale = i18n.language;
  const path = stripLocaleFromPath(location.pathname);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = titleForPath(path, locale);

    const existing = document.querySelectorAll('link[data-rp-hreflang]');
    existing.forEach((el) => el.remove());

    const basePath = path === '/' ? '' : path;

    for (const loc of supportedLocales) {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = loc.code;
      link.href = `${SITE_ORIGIN}${pathWithLocale(loc.code, basePath || '/')}`;
      link.setAttribute('data-rp-hreflang', '1');
      document.head.appendChild(link);
    }

    const xDefault = document.createElement('link');
    xDefault.rel = 'alternate';
    xDefault.hreflang = 'x-default';
    xDefault.href = `${SITE_ORIGIN}${pathWithLocale('en', basePath || '/')}`;
    xDefault.setAttribute('data-rp-hreflang', '1');
    document.head.appendChild(xDefault);
  }, [locale, path, location.search]);

  return null;
}
