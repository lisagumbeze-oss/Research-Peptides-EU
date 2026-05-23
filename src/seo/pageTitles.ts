import type { LocaleCode } from '../i18n/locales';

type TitleEntry = { en: string; nl?: string; de?: string; fr?: string };

export const PAGE_TITLES: Record<string, TitleEntry> = {
  '/': {
    en: 'Premium Research Peptides',
    nl: 'Premium onderzoekspeptiden',
    de: 'Premium-Forschungspeptide',
    fr: 'Peptides de recherche premium',
  },
  '/shop': { en: 'Shop', nl: 'Shop', de: 'Shop', fr: 'Boutique' },
  '/categories': { en: 'Categories', nl: 'Categorieën', de: 'Kategorien', fr: 'Catégories' },
  '/search': { en: 'Search', nl: 'Zoeken', de: 'Suche', fr: 'Recherche' },
  '/cart': { en: 'Cart', nl: 'Winkelwagen', de: 'Warenkorb', fr: 'Panier' },
  '/checkout': { en: 'Checkout', nl: 'Afrekenen', de: 'Kasse', fr: 'Paiement' },
  '/faq': { en: 'FAQ', nl: 'Veelgestelde vragen', de: 'FAQ', fr: 'FAQ' },
  '/shipping': { en: 'Shipping', nl: 'Verzending', de: 'Versand', fr: 'Livraison' },
  '/contact': { en: 'Contact', nl: 'Contact', de: 'Kontakt', fr: 'Contact' },
  '/about-us': { en: 'About Us', nl: 'Over ons', de: 'Über uns', fr: 'À propos' },
  '/terms': { en: 'Terms', nl: 'Voorwaarden', de: 'AGB', fr: 'Conditions' },
  '/privacy': { en: 'Privacy', nl: 'Privacy', de: 'Datenschutz', fr: 'Confidentialité' },
  '/refund-returns': { en: 'Returns', nl: 'Retourneren', de: 'Rückgabe', fr: 'Retours' },
  '/coas': { en: 'COA Library', nl: 'COA-bibliotheek', de: 'COA-Bibliothek', fr: 'Bibliothèque COA' },
  '/blog': { en: 'Research Journal', nl: 'Onderzoeksjournal', de: 'Forschungsjournal', fr: 'Journal de recherche' },
};

export const DEFAULT_DESCRIPTION =
  'Research Peptides EU — premium research-grade peptides for European laboratories. Third-party tested, EUR pricing, EU distribution.';

export function titleForPath(path: string, locale: LocaleCode): string {
  const base = path.startsWith('/product/') ? 'Product' : path;
  const entry = PAGE_TITLES[base] ?? PAGE_TITLES['/'];
  const localized = (entry as Record<string, string>)[locale] ?? entry.en;
  return `${localized} | Research Peptides EU`;
}
