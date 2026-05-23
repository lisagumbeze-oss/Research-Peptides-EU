import { useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

declare global {
  interface Window {
    Tawk_API?: {
      hideWidget?: () => void;
      showWidget?: () => void;
      maximize?: () => void;
      toggle?: () => void;
      onLoad?: () => void;
    };
    Tawk_LoadStart?: Date;
    __tawkLoaded?: boolean;
  }
}

function getTawkIds(): { propertyId: string; widgetId: string } | null {
  const propertyId = (import.meta.env.VITE_TAWK_PROPERTY_ID as string | undefined)?.trim();
  const widgetId = (import.meta.env.VITE_TAWK_WIDGET_ID as string | undefined)?.trim();
  if (propertyId && widgetId) return { propertyId, widgetId };

  /** Optional: paste "propertyId/widgetId" from embed URL https://embed.tawk.to/{propertyId}/{widgetId} */
  const combined = (import.meta.env.VITE_TAWK_EMBED_ID as string | undefined)?.trim();
  if (combined?.includes('/')) {
    const [p, w] = combined.split('/').map((s) => s.trim());
    if (p && w) return { propertyId: p, widgetId: w };
  }

  return null;
}

/**
 * tawk.to live chat with a branded floating trigger (default bubble hidden).
 * Dashboard: Administration → Chat Widget → Direct Chat Link / embed code.
 */
export default function TawkToChat() {
  const ids = getTawkIds();
  const mobileOffset =
    Number(import.meta.env.VITE_TAWK_MOBILE_OFFSET_Y as string | undefined) || 88;

  useEffect(() => {
    if (!ids) return;

    if (document.getElementById('tawk-loader')) return;

    window.Tawk_API = window.Tawk_API || {};
    const previousOnLoad = window.Tawk_API.onLoad;
    window.Tawk_API.onLoad = function onTawkLoad() {
      previousOnLoad?.();
      window.Tawk_API?.hideWidget?.();
    };

    window.Tawk_LoadStart = new Date();

    const script = document.createElement('script');
    script.id = 'tawk-loader';
    script.async = true;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    script.src = `https://embed.tawk.to/${ids.propertyId}/${ids.widgetId}`;
    script.onload = () => {
      window.__tawkLoaded = true;
    };
    document.head.appendChild(script);

    const styleId = 'tawk-custom-offset';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @media (max-width: 768px) {
          #tawk-bubble-container,
          .tawk-min-container {
            bottom: ${mobileOffset}px !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, [ids?.propertyId, ids?.widgetId, mobileOffset]);

  const openChat = () => {
    try {
      if (window.Tawk_API?.maximize) {
        window.Tawk_API.showWidget?.();
        window.Tawk_API.maximize();
        return;
      }
      if (window.Tawk_API?.toggle) {
        window.Tawk_API.toggle();
      }
    } catch (err) {
      console.warn('tawk.to open failed:', err);
    }
  };

  if (!ids) return null;

  return (
    <button
      type="button"
      onClick={openChat}
      className="fixed bottom-24 md:bottom-8 left-4 md:left-8 z-[100] bg-brand-500 hover:bg-brand-600 text-white rounded-full p-4 shadow-glow transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center group ring-4 ring-white/10"
      aria-label="Open live chat"
      title="Open live chat"
    >
      <MessageCircle className="h-6 w-6 transition-transform group-hover:rotate-12" aria-hidden />
      <span className="sr-only">Live Chat</span>
      <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
    </button>
  );
}
