import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { buildI18nResources } from './resources';

void i18n.use(initReactI18next).init({
  resources: buildI18nResources(),
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs: ['en', 'nl', 'fr', 'de', 'es', 'it', 'pt', 'hr', 'pl', 'ro', 'cs', 'da', 'sv', 'fi', 'el', 'hu', 'sk', 'sl', 'bg'],
  ns: ['common', 'nav', 'home', 'checkout'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
