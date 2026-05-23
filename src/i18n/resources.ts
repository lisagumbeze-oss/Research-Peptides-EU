import type { LocaleCode } from './locales';
import { supportedLocales } from './locales';

const modules = import.meta.glob('./locales/*/*.json', { eager: true }) as Record<
  string,
  Record<string, unknown>
>;

type NamespaceBundle = Record<string, object>;

/** All locale JSON under src/i18n/locales/{lng}/{ns}.json */
export function buildI18nResources(): Record<string, NamespaceBundle> {
  const resources: Record<string, NamespaceBundle> = {};

  for (const path of Object.keys(modules)) {
    const match = path.match(/\.\/locales\/([^/]+)\/([^/]+)\.json$/);
    if (!match) continue;
    const [, lng, ns] = match;
    const data = modules[path];
    const payload = (data && 'default' in data ? data.default : data) as object;
    if (!resources[lng]) resources[lng] = {};
    resources[lng][ns] = payload;
  }

  return resources;
}

export const translatedLocales: LocaleCode[] = supportedLocales.map((l) => l.code);

export const i18nNamespaces = [
  'common',
  'nav',
  'home',
  'checkout',
  'shop',
  'shipping',
  'legal',
  'product',
] as const;
