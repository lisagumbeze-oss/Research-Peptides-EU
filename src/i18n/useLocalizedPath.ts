import { useMemo } from 'react';
import { useLocale } from './LocaleProvider';
import { pathWithLocale } from './routing';

export function useLocalizedPath(path = '/'): string {
  const { locale } = useLocale();
  return useMemo(() => pathWithLocale(locale, path), [locale, path]);
}
