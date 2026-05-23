import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type PageSeoConfig = {
  title?: string;
  description?: string;
  /** Path without locale prefix, e.g. `/shop` or `/product/bpc-157` */
  canonicalPath?: string;
  ogType?: 'website' | 'product';
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown>[];
};

type SeoContextValue = {
  override: PageSeoConfig | null;
  setOverride: (config: PageSeoConfig | null) => void;
};

const SeoContext = createContext<SeoContextValue | null>(null);

export function SeoProvider({ children }: { children: React.ReactNode }) {
  const [override, setOverrideState] = useState<PageSeoConfig | null>(null);
  const setOverride = useCallback((config: PageSeoConfig | null) => {
    setOverrideState(config);
  }, []);

  const value = useMemo(() => ({ override, setOverride }), [override, setOverride]);

  return <SeoContext.Provider value={value}>{children}</SeoContext.Provider>;
}

export function useSeoOverride() {
  const ctx = useContext(SeoContext);
  if (!ctx) throw new Error('useSeoOverride must be used within SeoProvider');
  return ctx;
}

/** Set per-page SEO (product, etc.); cleared on unmount. */
export function usePageSeo(config: PageSeoConfig | null) {
  const { setOverride } = useSeoOverride();
  React.useEffect(() => {
    setOverride(config);
    return () => setOverride(null);
  }, [config, setOverride]);
}
