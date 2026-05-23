import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { buildI18nResources } from './resources';
import { supportedLocales } from './locales';

const supportedLngs = supportedLocales.map((l) => l.code);

const fallbackLng: Record<string, string[]> = {
  default: ['en'],
};
for (const code of supportedLngs) {
  if (code !== 'en') fallbackLng[code] = ['en'];
}

void i18n.use(initReactI18next).init({
  resources: buildI18nResources(),
  lng: 'en',
  fallbackLng,
  supportedLngs,
  ns: ['common', 'nav', 'home', 'checkout', 'shop', 'shipping', 'legal', 'product'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
