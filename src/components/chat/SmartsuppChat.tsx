import { useEffect } from 'react';

declare global {
  interface Window {
    _smartsupp?: Record<string, unknown>;
    smartsupp?: ((...args: unknown[]) => void) & { _: unknown[] };
    __smartsuppLoaded?: boolean;
  }
}

/**
 * Smartsupp loader with brand color support.
 * Docs: https://docs.smartsupp.com/chat-box/configuration/
 */
export default function SmartsuppChat() {
  useEffect(() => {
    const key = import.meta.env.VITE_SMARTSUPP_KEY as string | undefined;
    if (!key) return;

    const brandColor =
      (import.meta.env.VITE_SMARTSUPP_COLOR as string | undefined)?.trim() || '#2563eb';
    const mobileOffsetY = Number(import.meta.env.VITE_SMARTSUPP_MOBILE_OFFSET_Y ?? 88);
    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    window._smartsupp = window._smartsupp || {};
    window._smartsupp.key = key;
    window._smartsupp.color = brandColor;
    window._smartsupp.offsetY = isMobile ? mobileOffsetY : 0;

    if (window.__smartsuppLoaded) return;
    window.__smartsuppLoaded = true;

    const existing = document.getElementById('smartsupp-loader');
    if (existing) return;

    const script = document.createElement('script');
    script.id = 'smartsupp-loader';
    script.type = 'text/javascript';
    script.charset = 'utf-8';
    script.async = true;
    script.src = 'https://www.smartsuppchat.com/loader.js?';
    document.head.appendChild(script);
  }, []);

  return null;
}
