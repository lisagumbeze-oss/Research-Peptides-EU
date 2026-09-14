import type { LocaleCode } from '../i18n/locales';

type TitleEntry = { en: string; nl?: string; de?: string; fr?: string; es?: string };

export const PAGE_TITLES: Record<string, TitleEntry> = {
  '/': {
    en: 'Research Peptides EU | Buy Research Peptides Online for EU & UK Labs',
    nl: 'Research Peptides EU | Research Chem Peptide & Onderzoekspeptiden',
    de: 'Research Peptides EU | Peptide for Research & Forschungspeptide',
    fr: 'Research Peptides EU | European Peptide & Peptides de Recherche',
    es: 'Péptidos de investigación en España y Europa | Research Peptides EU',
  },
  '/shop': {
    en: 'Buy Peptides Online UK & Europe | Research Catalog',
    nl: 'Research Chemicals Peptides Kopen | EU-Catalogus',
    de: 'Forschungspeptide kaufen | Peptide for Research Katalog',
    fr: 'Boutique European Peptide | Catalogue de recherche',
    es: 'Comprar péptidos en España y Europa | Catálogo de investigación',
  },
  '/categories': { en: 'Categories', nl: 'Categorieën', de: 'Kategorien', fr: 'Catégories', es: 'Categorías de péptidos' },
  '/peptide-guide': {
    en: 'Peptide Guide',
    nl: 'Peptide-gids',
    de: 'Peptid-Leitfaden',
    fr: 'Guide des peptides',
    es: 'Guía de péptidos',
  },
  '/search': { en: 'Search', nl: 'Zoeken', de: 'Suche', fr: 'Recherche', es: 'Buscar péptidos' },
  '/cart': { en: 'Cart', nl: 'Winkelwagen', de: 'Warenkorb', fr: 'Panier', es: 'Carrito' },
  '/checkout': { en: 'Checkout', nl: 'Afrekenen', de: 'Kasse', fr: 'Paiement', es: 'Pago' },
  '/faq': { en: 'FAQ', nl: 'Veelgestelde vragen', de: 'FAQ', fr: 'FAQ', es: 'FAQ para investigadores' },
  '/shipping': { en: 'Shipping', nl: 'Verzending', de: 'Versand', fr: 'Livraison', es: 'Envío de péptidos en la UE' },
  '/contact': { en: 'Contact', nl: 'Contact', de: 'Kontakt', fr: 'Contact', es: 'Contacto' },
  '/about-us': {
    en: 'About Research Peptides Europe',
    nl: 'Over Research Peptides Europe | Peptides EU',
    de: 'Über Research Peptides Europe | Peptide for Research',
    fr: 'À propos de Research Peptides Europe | European Peptide',
    es: 'Sobre Research Peptides Europe | Europa Peptide',
  },
  '/terms': { en: 'Terms', nl: 'Voorwaarden', de: 'AGB', fr: 'Conditions', es: 'Términos' },
  '/privacy': { en: 'Privacy', nl: 'Privacy', de: 'Datenschutz', fr: 'Confidentialité', es: 'Privacidad' },
  '/refund-returns': { en: 'Returns', nl: 'Retourneren', de: 'Rückgabe', fr: 'Retours', es: 'Devoluciones' },
  '/coas': { en: 'COA Library', nl: 'COA-bibliotheek', de: 'COA-Bibliothek', fr: 'Bibliothèque COA', es: 'Biblioteca COA' },
  '/blog': {
    en: 'Research Journal',
    nl: 'Onderzoeksjournal',
    de: 'Forschungsjournal',
    fr: 'Journal de recherche',
    es: 'Blog de péptidos de investigación',
  },
  '/peptide-calculator': {
    en: 'Peptide Calculator',
    nl: 'Peptide Calculator',
    de: 'Peptid-Rechner',
    fr: 'Calculateur de peptides',
    es: 'Calculadora de péptidos',
  },
  '/peptide-information': {
    en: 'Peptide Information',
    nl: 'Peptide-informatie',
    de: 'Peptid-Informationen',
    fr: 'Informations sur les peptides',
    es: 'Información sobre péptidos',
  },
};

export const DEFAULT_DESCRIPTION =
  'Research Peptides EU — buy research peptides online for European, UK and US laboratories. Third-party tested, EUR pricing, Netherlands dispatch across the EU and beyond.';

const LOCALE_DESCRIPTIONS: Partial<Record<LocaleCode, string>> = {
  en: DEFAULT_DESCRIPTION,
  es: 'Comprar péptidos de investigación en España y en toda Europa. Research Peptides EU: catálogo verificado, envío desde Países Bajos, EUR y documentación COA. Solo uso en laboratorio.',
  nl: 'Research Peptides EU — research chem peptide en research chemicals peptides voor Nederlandse laboratoria. Derde-partij getest, EUR, EU-distributie vanuit Nederland.',
  de: 'Research Peptides EU — peptide for research und research chemical peptides für europäische Labore. Drittgeprüft, EUR-Preise, Versand aus den Niederlanden.',
  fr: 'Research Peptides EU — european peptide / peptides eu pour laboratoires. Tests tiers, tarifs EUR, distribution UE depuis les Pays-Bas.',
};

export function descriptionForLocale(locale: LocaleCode): string {
  return LOCALE_DESCRIPTIONS[locale] ?? DEFAULT_DESCRIPTION;
}

export function titleForPath(path: string, locale: LocaleCode): string {
  const base = path.startsWith('/product/') ? 'Product' : path;
  const entry = PAGE_TITLES[base] ?? PAGE_TITLES['/'];
  const localized = (entry as Record<string, string>)[locale] ?? entry.en;
  // Home / shop titles that already include brand
  if ((locale === 'es' || locale === 'nl' || locale === 'de' || locale === 'fr') && (base === '/' || base === '/shop' || base === '/about-us')) {
    return localized;
  }
  if (localized.includes('Research Peptides')) return localized;
  return `${localized} | Research Peptides EU`;
}
