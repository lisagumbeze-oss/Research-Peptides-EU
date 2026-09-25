/**
 * Build-time SEO prerender for the Vite SPA.
 *
 * After `vite build`, copies dist/index.html into nested route folders and injects:
 * - locale-aware title / description / canonical / hreflang / OG
 * - Organization + WebSite (+ Product) JSON-LD
 * - Visible <main> content inside #root for non-JS crawlers
 *
 * React createRoot replaces #root on hydrate — users still get the SPA.
 *
 *   npm run prerender
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SITE_ORIGIN = (() => {
  let origin = (process.env.VITE_SITE_URL || 'https://www.researchpeptide.eu').replace(/\/+$/, '');
  origin = origin.replace('://researchpeptide.eu', '://www.researchpeptide.eu');
  return origin;
})();

const BRAND = 'Research Peptides EU';
const LEGAL_ENTITY = 'Research Peptides EU B.V.';
const SUPPORT_EMAIL = process.env.VITE_SUPPORT_EMAIL || 'info@researchpeptide.eu';
const DEFAULT_OG = `${SITE_ORIGIN}/brand_logo.png`;
const BRAND_DESCRIPTION =
  'Premium research-grade peptides and compounds for European laboratories. Third-party tested, EUR pricing, EU distribution from the Netherlands. Laboratory research use only.';
const HQ_ADDRESS = {
  streetAddress: 'Vivaldistraat 19',
  postalCode: '5283 KP',
  addressLocality: 'Boxtel',
  addressRegion: 'North Brabant',
  addressCountry: 'NL',
} as const;

/** Full locale set for hreflang; content locales get richer titles. */
const ALL_LOCALES = [
  'en', 'nl', 'fr', 'de', 'es', 'it', 'pt', 'hr', 'pl', 'ro', 'cs', 'da', 'sv', 'fi', 'el', 'hu', 'sk', 'sl', 'bg',
] as const;

/** v1: prerender primary EU market locales (matches pageTitles coverage). */
const PRERENDER_LOCALES = ['en', 'nl', 'de', 'fr', 'es'] as const;

type Locale = (typeof PRERENDER_LOCALES)[number];

type TitleEntry = { en: string; nl?: string; de?: string; fr?: string; es?: string };

const PAGE_META: Record<
  string,
  { titles: TitleEntry; h1: TitleEntry; blurb: TitleEntry }
> = {
  '/': {
    titles: {
      en: 'Research Peptides EU | Buy Research Peptides Online for EU & UK Labs',
      nl: 'Research Peptides EU | Research Chem Peptide & Onderzoekspeptiden',
      de: 'Research Peptides EU | Peptide for Research & Forschungspeptide',
      fr: 'Research Peptides EU | European Peptide & Peptides de Recherche',
      es: 'Péptidos de investigación en España y Europa | Research Peptides EU',
    },
    h1: {
      en: 'Premium research peptides for European laboratories',
      nl: 'Premium onderzoekspeptiden voor Europese laboratoria',
      de: 'Premium-Forschungspeptide für europäische Labore',
      fr: 'Peptides de recherche premium pour laboratoires européens',
      es: 'Péptidos de investigación premium para laboratorios europeos',
    },
    blurb: {
      en: 'Third-party tested research-grade peptides with EUR pricing and EU dispatch from the Netherlands. For laboratory research use only.',
      nl: 'Derde-partij geteste research-grade peptiden, EUR-prijzen en EU-verzending vanuit Nederland. Alleen voor laboratoriumonderzoek.',
      de: 'Drittgeprüfte Forschungspeptide mit EUR-Preisen und EU-Versand aus den Niederlanden. Nur für den Laborgebrauch.',
      fr: 'Peptides de recherche testés par des tiers, tarifs EUR, distribution UE depuis les Pays-Bas. Usage laboratoire uniquement.',
      es: 'Péptidos de investigación verificados, precios en EUR y envío UE desde Países Bajos. Solo uso en laboratorio.',
    },
  },
  '/shop': {
    titles: {
      en: 'Buy Peptides Online UK & Europe | Research Catalog',
      nl: 'Research Chemicals Peptides Kopen | EU-Catalogus',
      de: 'Forschungspeptide kaufen | Peptide for Research Katalog',
      fr: 'Boutique European Peptide | Catalogue de recherche',
      es: 'Comprar péptidos en España y Europa | Catálogo de investigación',
    },
    h1: {
      en: 'Research peptide catalog',
      nl: 'Catalogus onderzoekspeptiden',
      de: 'Katalog Forschungspeptide',
      fr: 'Catalogue de peptides de recherche',
      es: 'Catálogo de péptidos de investigación',
    },
    blurb: {
      en: 'Browse verified research compounds with COA documentation, EUR pricing, and EU-wide dispatch.',
      nl: 'Bekijk geverifieerde research compounds met COA, EUR-prijzen en EU-verzending.',
      de: 'Geprüfte Forschungssubstanzen mit COA, EUR-Preisen und EU-Versand.',
      fr: 'Composés de recherche vérifiés avec COA, tarifs EUR et livraison UE.',
      es: 'Compuestos de investigación verificados con COA, precios EUR y envío UE.',
    },
  },
  '/faq': {
    titles: { en: 'FAQ', nl: 'Veelgestelde vragen', de: 'FAQ', fr: 'FAQ', es: 'FAQ para investigadores' },
    h1: {
      en: 'Frequently asked questions',
      nl: 'Veelgestelde vragen',
      de: 'Häufig gestellte Fragen',
      fr: 'Questions fréquentes',
      es: 'Preguntas frecuentes',
    },
    blurb: {
      en: 'Answers on research-use policies, shipping across the EU, purity testing, and ordering from Research Peptides EU.',
      nl: 'Antwoorden over research-only beleid, EU-verzending, zuiverheidstesten en bestellen.',
      de: 'Antworten zu Research-Only, EU-Versand, Reinheitstests und Bestellung.',
      fr: 'Réponses sur l’usage recherche, livraison UE, tests de pureté et commandes.',
      es: 'Respuestas sobre uso de investigación, envío UE, pureza y pedidos.',
    },
  },
  '/about-us': {
    titles: {
      en: 'About Research Peptides Europe',
      nl: 'Over Research Peptides Europe | Peptides EU',
      de: 'Über Research Peptides Europe | Peptide for Research',
      fr: 'À propos de Research Peptides Europe | European Peptide',
      es: 'Sobre Research Peptides Europe | Europa Peptide',
    },
    h1: {
      en: 'About Research Peptides EU',
      nl: 'Over Research Peptides EU',
      de: 'Über Research Peptides EU',
      fr: 'À propos de Research Peptides EU',
      es: 'Sobre Research Peptides EU',
    },
    blurb: {
      en: 'Netherlands-based supplier of research-grade peptides for European laboratories — purity, documentation, and reliable EU logistics.',
      nl: 'Nederlandse leverancier van research-grade peptiden voor Europese labs.',
      de: 'Niederländischer Anbieter von Forschungspeptiden für europäische Labore.',
      fr: 'Fournisseur néerlandais de peptides de recherche pour laboratoires européens.',
      es: 'Proveedor con sede en Países Bajos de péptidos de investigación para laboratorios europeos.',
    },
  },
  '/contact': {
    titles: { en: 'Contact', nl: 'Contact', de: 'Kontakt', fr: 'Contact', es: 'Contacto' },
    h1: {
      en: 'Contact Research Peptides EU',
      nl: 'Contact Research Peptides EU',
      de: 'Kontakt Research Peptides EU',
      fr: 'Contact Research Peptides EU',
      es: 'Contacto Research Peptides EU',
    },
    blurb: {
      en: `Reach our team at ${SUPPORT_EMAIL}. HQ: Vivaldistraat 19, 5283 KP Boxtel, Netherlands.`,
      nl: `Neem contact op via ${SUPPORT_EMAIL}. HQ: Vivaldistraat 19, 5283 KP Boxtel, Nederland.`,
      de: `Kontakt: ${SUPPORT_EMAIL}. HQ: Vivaldistraat 19, 5283 KP Boxtel, Niederlande.`,
      fr: `Contact: ${SUPPORT_EMAIL}. Siège: Vivaldistraat 19, 5283 KP Boxtel, Pays-Bas.`,
      es: `Contacto: ${SUPPORT_EMAIL}. Sede: Vivaldistraat 19, 5283 KP Boxtel, Países Bajos.`,
    },
  },
  '/peptide-guide': {
    titles: {
      en: 'Peptide Guide | Research Peptides EU',
      nl: 'Peptide-gids | Research Peptides EU',
      de: 'Peptid-Leitfaden | Research Peptides EU',
      fr: 'Guide des peptides | Research Peptides EU',
      es: 'Guía de péptidos | Research Peptides EU',
    },
    h1: {
      en: 'Peptide research guide',
      nl: 'Gids voor peptide-onderzoek',
      de: 'Leitfaden für Peptidforschung',
      fr: 'Guide de recherche sur les peptides',
      es: 'Guía de investigación de péptidos',
    },
    blurb: {
      en: 'Practical orientation for laboratory researchers: handling, documentation, and selecting research-grade peptides.',
      nl: 'Praktische oriëntatie voor laboratoriumonderzoekers.',
      de: 'Praktische Orientierung für Laborforscher.',
      fr: 'Orientation pratique pour chercheurs en laboratoire.',
      es: 'Orientación práctica para investigadores de laboratorio.',
    },
  },
  '/shipping': {
    titles: {
      en: 'Shipping | Research Peptides EU',
      nl: 'Verzending | Research Peptides EU',
      de: 'Versand | Research Peptides EU',
      fr: 'Livraison | Research Peptides EU',
      es: 'Envío de péptidos en la UE | Research Peptides EU',
    },
    h1: {
      en: 'EU shipping & dispatch',
      nl: 'EU-verzending & dispatch',
      de: 'EU-Versand & Versandabwicklung',
      fr: 'Livraison et expédition UE',
      es: 'Envío y despacho en la UE',
    },
    blurb: {
      en: 'Dispatch from the Netherlands across the European Union with cold-chain aware logistics for research materials.',
      nl: 'Verzending vanuit Nederland door de EU.',
      de: 'Versand aus den Niederlanden in die gesamte EU.',
      fr: 'Expédition depuis les Pays-Bas dans toute l’UE.',
      es: 'Despacho desde Países Bajos a toda la UE.',
    },
  },
  '/categories': {
    titles: {
      en: 'Categories | Research Peptides EU',
      nl: 'Categorieën | Research Peptides EU',
      de: 'Kategorien | Research Peptides EU',
      fr: 'Catégories | Research Peptides EU',
      es: 'Categorías de péptidos | Research Peptides EU',
    },
    h1: {
      en: 'Research categories',
      nl: 'Onderzoekscategorieën',
      de: 'Forschungskategorien',
      fr: 'Catégories de recherche',
      es: 'Categorías de investigación',
    },
    blurb: {
      en: 'Explore specialized research lines across our European peptide catalog.',
      nl: 'Ontdek gespecialiseerde researchlijnen in onze EU-catalogus.',
      de: 'Entdecken Sie spezialisierte Forschungslinien in unserem EU-Katalog.',
      fr: 'Explorez nos lignes de recherche spécialisées.',
      es: 'Explore líneas de investigación especializadas en nuestro catálogo.',
    },
  },
};

const STATIC_PATHS = Object.keys(PAGE_META);

type ProductRow = {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  price: number;
  inventory: number | null;
  images: string[] | null;
  categories?: string[] | null;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/'/g, '&#39;');
}

function pickLocalized(entry: TitleEntry, locale: Locale): string {
  return entry[locale] ?? entry.en;
}

function localePath(locale: string, routePath: string): string {
  if (routePath === '/') return `/${locale}`;
  return `/${locale}${routePath}`;
}

function absoluteUrl(locale: string, routePath: string): string {
  return `${SITE_ORIGIN}${localePath(locale, routePath)}`;
}

function stripHtml(input: string): string {
  return input
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleForStatic(routePath: string, locale: Locale): string {
  const meta = PAGE_META[routePath];
  const localized = pickLocalized(meta.titles, locale);
  if (localized.includes('Research Peptides')) return localized;
  return `${localized} | ${BRAND}`;
}

function descriptionForLocale(locale: Locale): string {
  const map: Record<Locale, string> = {
    en: 'Research Peptides EU — buy research peptides online for European, UK and US laboratories. Third-party tested, EUR pricing, Netherlands dispatch across the EU and beyond.',
    es: 'Comprar péptidos de investigación en España y en toda Europa. Research Peptides EU: catálogo verificado, envío desde Países Bajos, EUR y documentación COA. Solo uso en laboratorio.',
    nl: 'Research Peptides EU — research chem peptide en research chemicals peptides voor Nederlandse laboratoria. Derde-partij getest, EUR, EU-distributie vanuit Nederland.',
    de: 'Research Peptides EU — peptide for research und research chemical peptides für europäische Labore. Drittgeprüft, EUR-Preise, Versand aus den Niederlanden.',
    fr: 'Research Peptides EU — european peptide / peptides eu pour laboratoires. Tests tiers, tarifs EUR, distribution UE depuis les Pays-Bas.',
  };
  return map[locale];
}

function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_ORIGIN}/#organization`,
    name: BRAND,
    legalName: LEGAL_ENTITY,
    url: SITE_ORIGIN,
    email: SUPPORT_EMAIL,
    logo: { '@type': 'ImageObject', url: DEFAULT_OG },
    image: DEFAULT_OG,
    description: BRAND_DESCRIPTION,
    areaServed: { '@type': 'Place', name: 'European Union' },
    address: { '@type': 'PostalAddress', ...HQ_ADDRESS },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: SUPPORT_EMAIL,
      areaServed: 'EU',
      availableLanguage: ['en', 'nl', 'de', 'fr', 'es'],
    },
  };
}

function websiteJsonLd(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_ORIGIN}/#website`,
    name: BRAND,
    url: absoluteUrl(locale, '/'),
    inLanguage: locale,
    publisher: { '@id': `${SITE_ORIGIN}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_ORIGIN}/${locale}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_ORIGIN}/#localbusiness`,
    name: BRAND,
    legalName: LEGAL_ENTITY,
    url: SITE_ORIGIN,
    email: SUPPORT_EMAIL,
    logo: DEFAULT_OG,
    image: DEFAULT_OG,
    description: BRAND_DESCRIPTION,
    address: { '@type': 'PostalAddress', ...HQ_ADDRESS },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: SUPPORT_EMAIL,
      areaServed: 'EU',
      availableLanguage: ['en', 'nl', 'de', 'fr', 'es'],
    },
    areaServed: { '@type': 'Place', name: 'European Union' },
  };
}

function productJsonLd(product: ProductRow, locale: string, productPath: string) {
  const url = absoluteUrl(locale, productPath);
  const images = (product.images ?? []).filter(Boolean);
  const inStock = Number(product.inventory ?? 0) > 0;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description ? stripHtml(product.description).slice(0, 500) : undefined,
    image: images.length ? images : undefined,
    sku: product.slug ?? String(product.id),
    url,
    brand: { '@type': 'Brand', name: BRAND },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'EUR',
      price: Number(product.price) || 0,
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
}

function itemListJsonLd(products: ProductRow[], locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${BRAND} catalog`,
    numberOfItems: Math.min(products.length, 48),
    itemListElement: products.slice(0, 48).map((product, index) => {
      const pPath = `/product/${String(product.slug).trim()}`;
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: product.title,
        url: absoluteUrl(locale, pPath),
      };
    }),
  };
}

function hreflangTags(routePath: string): string {
  const lines = ALL_LOCALES.map(
    (locale) =>
      `<link rel="alternate" hreflang="${locale}" href="${escapeAttr(absoluteUrl(locale, routePath))}" data-rp-hreflang="1" />`,
  );
  lines.push(
    `<link rel="alternate" hreflang="x-default" href="${escapeAttr(absoluteUrl('en', routePath))}" data-rp-hreflang="1" />`,
  );
  return lines.join('\n    ');
}

function jsonLdScript(data: unknown | unknown[]): string {
  const payload = Array.isArray(data) ? data : [data];
  return payload
    .map(
      (block) =>
        `<script type="application/ld+json">${JSON.stringify(block).replace(/</g, '\\u003c')}</script>`,
    )
    .join('\n    ');
}

function formatEur(amount: number): string {
  try {
    return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(amount);
  } catch {
    return `€${amount.toFixed(2)}`;
  }
}

function buildHeadInjection(opts: {
  locale: Locale;
  routePath: string;
  title: string;
  description: string;
  ogType?: string;
  ogImage?: string;
  jsonLd: unknown[];
}): string {
  const canonical = absoluteUrl(opts.locale, opts.routePath);
  const ogImage = opts.ogImage || DEFAULT_OG;
  return `
    <title>${escapeHtml(opts.title)}</title>
    <meta name="description" content="${escapeAttr(opts.description)}" data-rp-seo="1" />
    <link rel="canonical" href="${escapeAttr(canonical)}" data-rp-seo="1" />
    <meta property="og:title" content="${escapeAttr(opts.title)}" data-rp-seo="1" />
    <meta property="og:description" content="${escapeAttr(opts.description)}" data-rp-seo="1" />
    <meta property="og:url" content="${escapeAttr(canonical)}" data-rp-seo="1" />
    <meta property="og:type" content="${escapeAttr(opts.ogType ?? 'website')}" data-rp-seo="1" />
    <meta property="og:site_name" content="${escapeAttr(BRAND)}" data-rp-seo="1" />
    <meta property="og:image" content="${escapeAttr(ogImage)}" data-rp-seo="1" />
    <meta name="twitter:card" content="summary_large_image" data-rp-seo="1" />
    <meta name="twitter:title" content="${escapeAttr(opts.title)}" data-rp-seo="1" />
    <meta name="twitter:description" content="${escapeAttr(opts.description)}" data-rp-seo="1" />
    ${hreflangTags(opts.routePath)}
    ${jsonLdScript(opts.jsonLd)}
  `.trim();
}

function buildBodyMain(opts: {
  locale: Locale;
  routePath: string;
  h1: string;
  blurb: string;
  extraHtml?: string;
}): string {
  const home = localePath(opts.locale, '/');
  const shop = localePath(opts.locale, '/shop');
  return `
    <div data-rp-prerender="1">
      <a href="${escapeAttr(home)}" style="position:absolute;left:-9999px">Skip to content</a>
      <header>
        <p><a href="${escapeAttr(home)}">${escapeHtml(BRAND)}</a></p>
        <nav aria-label="Primary">
          <a href="${escapeAttr(shop)}">Shop</a>
          · <a href="${escapeAttr(localePath(opts.locale, '/faq'))}">FAQ</a>
          · <a href="${escapeAttr(localePath(opts.locale, '/peptide-guide'))}">Peptide guide</a>
          · <a href="${escapeAttr(localePath(opts.locale, '/contact'))}">Contact</a>
        </nav>
      </header>
      <main id="main-content">
        <h1>${escapeHtml(opts.h1)}</h1>
        <p>${escapeHtml(opts.blurb)}</p>
        ${opts.extraHtml ?? ''}
        <p><strong>Research use only.</strong> Not for human consumption. EU laboratory supply.</p>
      </main>
      <footer>
        <p>${escapeHtml(BRAND)} — Vivaldistraat 19, 5283 KP Boxtel, Netherlands · <a href="mailto:${escapeAttr(SUPPORT_EMAIL)}">${escapeHtml(SUPPORT_EMAIL)}</a></p>
      </footer>
    </div>
  `.trim();
}

function injectIntoTemplate(
  template: string,
  locale: Locale,
  headInjection: string,
  bodyMain: string,
): string {
  let html = template;

  // lang attribute
  html = html.replace(/<html\s+lang="[^"]*"/i, `<html lang="${locale}"`);

  // Replace default <title>…</title>
  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, '');
  }

  // Remove shell description so we don't duplicate
  html = html.replace(/<meta\s+name="description"[^>]*>/i, '');

  // Inject head block before </head>
  html = html.replace(/<\/head>/i, `    ${headInjection}\n  </head>`);

  // Inject prerender body into #root
  if (!/<div id="root"><\/div>/i.test(html)) {
    throw new Error('Expected empty <div id="root"></div> in dist/index.html');
  }
  html = html.replace(
    /<div id="root"><\/div>/i,
    `<div id="root">${bodyMain}</div>`,
  );

  return html;
}

function writeRouteHtml(distDir: string, locale: string, routePath: string, html: string) {
  const urlPath = localePath(locale, routePath); // /en or /en/shop
  const outDir = path.join(distDir, ...urlPath.split('/').filter(Boolean));
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'index.html');
  fs.writeFileSync(outFile, html, 'utf8');
  return outFile;
}

async function fetchProducts(): Promise<ProductRow[]> {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn('[prerender] No Supabase credentials — skipping product pages.');
    return [];
  }
  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from('products')
    .select('id, title, slug, description, price, inventory, images, categories')
    .not('slug', 'is', null)
    .order('title', { ascending: true })
    .limit(2000);
  if (error) {
    console.warn('[prerender] Product fetch failed:', error.message);
    return [];
  }
  return (data ?? []).filter((row) => row.slug && String(row.slug).trim()) as ProductRow[];
}

type CategoryRow = {
  name: string;
  slug: string;
  description?: string | null;
};

async function fetchCategories(): Promise<CategoryRow[]> {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from('categories')
    .select('name, slug, description')
    .not('slug', 'is', null)
    .order('name', { ascending: true })
    .limit(500);
  if (error) {
    console.warn('[prerender] Category fetch failed:', error.message);
    return [];
  }
  return (data ?? []).filter((row) => row.slug && String(row.slug).trim()) as CategoryRow[];
}

async function main() {
  const distDir = path.join(process.cwd(), 'dist');
  const templatePath = path.join(distDir, 'index.html');
  if (!fs.existsSync(templatePath)) {
    throw new Error('dist/index.html missing — run vite build first');
  }
  const template = fs.readFileSync(templatePath, 'utf8');
  const [products, categories] = await Promise.all([fetchProducts(), fetchCategories()]);

  let written = 0;

  for (const locale of PRERENDER_LOCALES) {
    for (const routePath of STATIC_PATHS) {
      const meta = PAGE_META[routePath];
      const title = titleForStatic(routePath, locale);
      const description =
        routePath === '/' || routePath === '/shop'
          ? pickLocalized(meta.blurb, locale)
          : descriptionForLocale(locale);
      const jsonLd: unknown[] = [
        organizationJsonLd(),
        websiteJsonLd(locale),
        localBusinessJsonLd(),
      ];
      if (routePath === '/shop' && products.length > 0) {
        jsonLd.push(itemListJsonLd(products, locale));
      }

      let extraHtml = '';
      if (routePath === '/shop' && products.length > 0) {
        const links = products
          .slice(0, 60)
          .map((p) => {
            const href = localePath(locale, `/product/${String(p.slug).trim()}`);
            return `<li><a href="${escapeAttr(href)}">${escapeHtml(p.title)}</a></li>`;
          })
          .join('');
        extraHtml = `<ul>${links}</ul>`;
      }
      if (routePath === '/categories' && categories.length > 0) {
        const links = categories
          .map((c) => {
            const href = localePath(locale, `/category/${String(c.slug).trim()}`);
            return `<li><a href="${escapeAttr(href)}">${escapeHtml(c.name)}</a></li>`;
          })
          .join('');
        extraHtml = `<ul>${links}</ul>`;
      }

      const head = buildHeadInjection({
        locale,
        routePath,
        title,
        description,
        jsonLd,
      });
      const body = buildBodyMain({
        locale,
        routePath,
        h1: pickLocalized(meta.h1, locale),
        blurb: pickLocalized(meta.blurb, locale),
        extraHtml,
      });
      const html = injectIntoTemplate(template, locale, head, body);
      writeRouteHtml(distDir, locale, routePath, html);
      written += 1;
    }

    for (const category of categories) {
      const slug = String(category.slug).trim();
      const routePath = `/category/${slug}`;
      const title = `${category.name} Research Peptides | ${BRAND}`;
      const description =
        (category.description && String(category.description).trim()) ||
        `${category.name} research compounds — EUR pricing, EU dispatch, laboratory use only.`;
      const matching = products.filter((p) =>
        (p.categories ?? []).some((c) => String(c).toLowerCase() === slug.toLowerCase()),
      );
      const jsonLd = [
        organizationJsonLd(),
        websiteJsonLd(locale),
        itemListJsonLd(matching.length ? matching : products.slice(0, 12), locale),
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl(locale, '/') },
            { '@type': 'ListItem', position: 2, name: 'Categories', item: absoluteUrl(locale, '/categories') },
            { '@type': 'ListItem', position: 3, name: category.name, item: absoluteUrl(locale, routePath) },
          ],
        },
      ];
      const productLinks = matching
        .slice(0, 40)
        .map((p) => {
          const href = localePath(locale, `/product/${String(p.slug).trim()}`);
          return `<li><a href="${escapeAttr(href)}">${escapeHtml(p.title)}</a></li>`;
        })
        .join('');
      const head = buildHeadInjection({
        locale,
        routePath,
        title,
        description: description.slice(0, 160),
        jsonLd,
      });
      const body = buildBodyMain({
        locale,
        routePath,
        h1: `${category.name} research peptides`,
        blurb: description,
        extraHtml: productLinks
          ? `<ul>${productLinks}</ul>`
          : `<p><a href="${escapeAttr(localePath(locale, '/shop'))}">Browse full catalog</a></p>`,
      });
      const html = injectIntoTemplate(template, locale, head, body);
      writeRouteHtml(distDir, locale, routePath, html);
      written += 1;
    }

    for (const product of products) {
      const slug = String(product.slug).trim();
      const routePath = `/product/${slug}`;
      const plain = stripHtml(String(product.description || '')).slice(0, 160);
      const title = `${product.title} | ${BRAND}`;
      const description =
        plain || `Research-grade ${product.title} — EUR pricing, EU dispatch. Laboratory research use only.`;
      const ogImage = product.images?.[0] || DEFAULT_OG;
      const jsonLd = [
        organizationJsonLd(),
        websiteJsonLd(locale),
        productJsonLd(product, locale, routePath),
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl(locale, '/') },
            { '@type': 'ListItem', position: 2, name: 'Shop', item: absoluteUrl(locale, '/shop') },
            { '@type': 'ListItem', position: 3, name: product.title, item: absoluteUrl(locale, routePath) },
          ],
        },
      ];
      const head = buildHeadInjection({
        locale,
        routePath,
        title,
        description,
        ogType: 'product',
        ogImage,
        jsonLd,
      });
      const priceLine = formatEur(Number(product.price) || 0);
      const body = buildBodyMain({
        locale,
        routePath,
        h1: product.title,
        blurb: description,
        extraHtml: `
          <p><strong>Price:</strong> ${escapeHtml(priceLine)} EUR</p>
          <p><a href="${escapeAttr(localePath(locale, '/shop'))}">Browse full catalog</a>
          · <a href="${escapeAttr(localePath(locale, '/coas'))}">COA library</a></p>
        `,
      });
      const html = injectIntoTemplate(template, locale, head, body);
      writeRouteHtml(distDir, locale, routePath, html);
      written += 1;
    }
  }

  // Manifest for verification / debugging
  const manifest = {
    generatedAt: new Date().toISOString(),
    origin: SITE_ORIGIN,
    locales: [...PRERENDER_LOCALES],
    staticPaths: STATIC_PATHS,
    categoryCount: categories.length,
    productCount: products.length,
    pagesWritten: written,
  };
  fs.writeFileSync(path.join(distDir, 'prerender-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(
    `[prerender] Wrote ${written} HTML pages (${PRERENDER_LOCALES.length} locales × ${STATIC_PATHS.length} static + ${categories.length} categories + ${products.length} products) → ${distDir}`,
  );
  if (products.length === 0) {
    console.warn('[prerender] Warning: 0 products prerendered. Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_*) for catalog pages.');
  }
}

main().catch((err) => {
  console.error('[prerender] Failed:', err);
  process.exit(1);
});
