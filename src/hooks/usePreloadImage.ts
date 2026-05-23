import { useEffect } from 'react';

/** Injects a one-time `<link rel="preload">` for an LCP image. */
export function usePreloadImage(src: string, enabled = true) {
  useEffect(() => {
    if (!enabled || !src) return;

    const existing = document.querySelector(`link[data-rp-preload="${src}"]`);
    if (existing) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    link.setAttribute('data-rp-preload', src);
    document.head.appendChild(link);

    return () => {
      link.remove();
    };
  }, [src, enabled]);
}
