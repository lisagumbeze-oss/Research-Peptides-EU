import {
  BRAND_DESCRIPTION,
  BRAND_NAME,
  HQ_ADDRESS,
  LEGAL_ENTITY,
  SUPPORT_EMAIL,
  defaultOgImageUrl,
  siteOriginFromConfig,
} from '../config/brand';
import { DEFAULT_CURRENCY } from '../lib/currency';
import { pathWithLocale } from '../i18n/routing';
import type { LocaleCode } from '../i18n/locales';
import { productPath } from '../lib/productUrl';

export function siteOrigin(): string {
  return siteOriginFromConfig();
}

export function defaultOgImage(): string {
  return defaultOgImageUrl(siteOrigin());
}

export function organizationJsonLd() {
  const origin = siteOrigin();
  const logo = defaultOgImage();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${origin}/#organization`,
    name: BRAND_NAME,
    legalName: LEGAL_ENTITY,
    url: origin,
    email: SUPPORT_EMAIL,
    logo: {
      '@type': 'ImageObject',
      url: logo,
    },
    image: logo,
    description: BRAND_DESCRIPTION,
    areaServed: {
      '@type': 'Place',
      name: 'European Union',
    },
    address: {
      '@type': 'PostalAddress',
      ...HQ_ADDRESS,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: SUPPORT_EMAIL,
      areaServed: 'EU',
      availableLanguage: ['en', 'nl', 'de', 'fr', 'es'],
    },
  };
}

export function websiteJsonLd(locale: LocaleCode) {
  const origin = siteOrigin();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    name: BRAND_NAME,
    url: `${origin}${pathWithLocale(locale, '/')}`,
    inLanguage: locale,
    publisher: { '@id': `${origin}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${origin}${pathWithLocale(locale, '/search')}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function localBusinessJsonLd() {
  const origin = siteOrigin();
  const logo = defaultOgImage();
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${origin}/#localbusiness`,
    name: BRAND_NAME,
    legalName: LEGAL_ENTITY,
    url: origin,
    email: SUPPORT_EMAIL,
    logo,
    image: logo,
    description: BRAND_DESCRIPTION,
    address: {
      '@type': 'PostalAddress',
      ...HQ_ADDRESS,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: SUPPORT_EMAIL,
      areaServed: 'EU',
      availableLanguage: ['en', 'nl', 'de', 'fr', 'es'],
    },
    areaServed: {
      '@type': 'Place',
      name: 'European Union',
    },
  };
}

/** Single source for global entity graphs — use once per page (LocaleHead only). */
export function globalEntityJsonLd(locale: LocaleCode) {
  return [organizationJsonLd(), websiteJsonLd(locale), localBusinessJsonLd()];
}

type ProductRow = {
  id: string;
  title: string;
  slug?: string | null;
  description?: string | null;
  price: number;
  compare_at_price?: number | null;
  inventory?: number;
  images?: string[] | null;
  rating?: number | null;
  review_count?: number | null;
};

export function productJsonLd(product: ProductRow, locale: LocaleCode) {
  const path = productPath(product);
  const url = `${siteOrigin()}${pathWithLocale(locale, path)}`;
  const images = (product.images ?? []).filter(Boolean);
  const inStock = Number(product.inventory ?? 0) > 0;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description ?? undefined,
    image: images.length ? images : [defaultOgImage()],
    sku: product.slug ?? String(product.id),
    url,
    brand: { '@type': 'Brand', name: BRAND_NAME },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: DEFAULT_CURRENCY,
      price: Number(product.price) || 0,
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    ...(product.rating != null && Number(product.review_count) > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.review_count,
          },
        }
      : {}),
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
  locale: LocaleCode,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteOrigin()}${pathWithLocale(locale, item.path)}`,
    })),
  };
}

type ListProduct = { title: string; slug?: string | null; id?: string };

export function itemListJsonLd(products: ListProduct[], locale: LocaleCode, limit = 48) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${BRAND_NAME} catalog`,
    numberOfItems: Math.min(products.length, limit),
    itemListElement: products.slice(0, limit).map((product, index) => {
      const path = productPath(product);
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: product.title,
        url: `${siteOrigin()}${pathWithLocale(locale, path)}`,
      };
    }),
  };
}
