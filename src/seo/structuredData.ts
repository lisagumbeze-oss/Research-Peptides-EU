import { BRAND_NAME, SITE_URL, SUPPORT_EMAIL } from '../config/brand';
import { DEFAULT_CURRENCY } from '../lib/currency';
import { pathWithLocale } from '../i18n/routing';
import type { LocaleCode } from '../i18n/locales';
import { productPath } from '../lib/productUrl';

export function siteOrigin(): string {
  return SITE_URL.replace(/\/+$/, '');
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND_NAME,
    url: siteOrigin(),
    email: SUPPORT_EMAIL,
    areaServed: 'European Union',
  };
}

export function websiteJsonLd(locale: LocaleCode) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND_NAME,
    url: `${siteOrigin()}${pathWithLocale(locale, '/')}`,
    inLanguage: locale,
  };
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
    image: images.length ? images : undefined,
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
