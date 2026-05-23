import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BRAND_NAME } from '../config/brand';
import { supportedLocales } from './locales';
import { pathWithLocale, stripLocaleFromPath } from './routing';
import { useSeoOverride } from '../seo/SeoProvider';
import { DEFAULT_DESCRIPTION, titleForPath } from '../seo/pageTitles';
import { organizationJsonLd, siteOrigin, websiteJsonLd } from '../seo/structuredData';
import { JsonLd } from '../components/seo/JsonLd';
import type { LocaleCode } from './locales';

const META_ATTR = 'data-rp-seo';

function upsertMeta(name: string, content: string, property = false) {
  const attr = property ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"][${META_ATTR}]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    el.setAttribute(META_ATTR, '1');
    document.head.appendChild(el);
  }
  el.content = content;
}

function upsertCanonical(href: string) {
  let el = document.querySelector(`link[rel="canonical"][${META_ATTR}]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    el.setAttribute(META_ATTR, '1');
    document.head.appendChild(el);
  }
  el.href = href;
}

function upsertRobots(noindex: boolean) {
  if (!noindex) {
    document.querySelector(`meta[name="robots"][${META_ATTR}]`)?.remove();
    return;
  }
  upsertMeta('robots', 'noindex, nofollow');
}

export function LocaleHead() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const { override } = useSeoOverride();
  const locale = i18n.language as LocaleCode;
  const path = stripLocaleFromPath(location.pathname);
  const origin = siteOrigin();

  const globalJsonLd = useMemo(
    () => [organizationJsonLd(), websiteJsonLd(locale)],
    [locale],
  );

  const pageJsonLd = override?.jsonLd ?? [];
  const allJsonLd = useMemo(() => [...globalJsonLd, ...pageJsonLd], [globalJsonLd, pageJsonLd]);

  useEffect(() => {
    document.documentElement.lang = locale;

    const title = override?.title ?? titleForPath(path, locale);
    const description = override?.description ?? DEFAULT_DESCRIPTION;
    const canonicalPath = override?.canonicalPath ?? path;
    const canonical = `${origin}${pathWithLocale(locale, canonicalPath === '/' ? '/' : canonicalPath)}`;

    document.title = title;
    upsertMeta('description', description);
    upsertCanonical(canonical);
    upsertRobots(override?.noindex ?? false);

    upsertMeta('og:title', title, true);
    upsertMeta('og:description', description, true);
    upsertMeta('og:url', canonical, true);
    upsertMeta('og:type', override?.ogType ?? 'website', true);
    upsertMeta('og:site_name', BRAND_NAME, true);
    if (override?.ogImage) {
      upsertMeta('og:image', override.ogImage, true);
    }

    upsertMeta('twitter:card', 'summary_large_image');
    upsertMeta('twitter:title', title);
    upsertMeta('twitter:description', description);

    const existing = document.querySelectorAll('link[data-rp-hreflang]');
    existing.forEach((el) => el.remove());

    const basePath = path === '/' ? '' : path;
    const hrefPath = override?.canonicalPath?.startsWith('/product/')
      ? override.canonicalPath
      : basePath;

    for (const loc of supportedLocales) {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = loc.code;
      link.href = `${origin}${pathWithLocale(loc.code, hrefPath || '/')}`;
      link.setAttribute('data-rp-hreflang', '1');
      document.head.appendChild(link);
    }

    const xDefault = document.createElement('link');
    xDefault.rel = 'alternate';
    xDefault.hreflang = 'x-default';
    xDefault.href = `${origin}${pathWithLocale('en', hrefPath || '/')}`;
    xDefault.setAttribute('data-rp-hreflang', '1');
    document.head.appendChild(xDefault);
  }, [locale, path, location.search, override, origin]);

  return <JsonLd data={allJsonLd} />;
}
