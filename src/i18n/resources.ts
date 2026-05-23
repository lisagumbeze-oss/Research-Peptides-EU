import type { LocaleCode } from './locales';

import enCommon from './locales/en/common.json';
import enNav from './locales/en/nav.json';
import enHome from './locales/en/home.json';
import enCheckout from './locales/en/checkout.json';

import nlCommon from './locales/nl/common.json';
import nlNav from './locales/nl/nav.json';
import nlHome from './locales/nl/home.json';
import nlCheckout from './locales/nl/checkout.json';

import deCommon from './locales/de/common.json';
import deNav from './locales/de/nav.json';
import deHome from './locales/de/home.json';
import deCheckout from './locales/de/checkout.json';

import frCommon from './locales/fr/common.json';
import frNav from './locales/fr/nav.json';
import frHome from './locales/fr/home.json';
import frCheckout from './locales/fr/checkout.json';

const bundle = (common: object, nav: object, home: object, checkout: object) => ({
  common,
  nav,
  home,
  checkout,
});

const fullBundles: Partial<Record<LocaleCode, ReturnType<typeof bundle>>> = {
  en: bundle(enCommon, enNav, enHome, enCheckout),
  nl: bundle(nlCommon, nlNav, nlHome, nlCheckout),
  de: bundle(deCommon, deNav, deHome, deCheckout),
  fr: bundle(frCommon, frNav, frHome, frCheckout),
};

/** Locales with dedicated JSON; all others fall back to English via i18next. */
export const translatedLocales: LocaleCode[] = ['en', 'nl', 'de', 'fr'];

export function buildI18nResources(): Record<string, ReturnType<typeof bundle>> {
  return { ...fullBundles } as Record<string, ReturnType<typeof bundle>>;
}
