import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setActiveLocale } from '../lib/currency';
import {
  detectBrowserLocale,
  getLocaleDefinition,
  isLocaleCode,
  type LocaleCode,
} from './locales';

const STORAGE_KEY = 'rp-eu-locale';

type LocaleContextValue = {
  locale: LocaleCode;
  setLocale: (code: LocaleCode) => void;
  localeLabel: string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): LocaleCode | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isLocaleCode(stored)) return stored;
  } catch {
    /* private browsing */
  }
  return null;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(() => readStoredLocale() ?? detectBrowserLocale());

  const setLocale = useCallback((code: LocaleCode) => {
    setLocaleState(code);
  }, []);

  useEffect(() => {
    setActiveLocale(locale);
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      localeLabel: getLocaleDefinition(locale).nativeName,
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return ctx;
}
