import { useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

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
  const key = (import.meta.env.VITE_SMARTSUPP_KEY as string | undefined)?.trim();

  useEffect(() => {
    if (!key) return;

    const brandColor =
      (import.meta.env.VITE_SMARTSUPP_COLOR as string | undefined)?.trim() || '#2563eb';
    const mobileOffsetY = Number(import.meta.env.VITE_SMARTSUPP_MOBILE_OFFSET_Y ?? 88);
    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    window._smartsupp = window._smartsupp || {};
    window._smartsupp.key = key;
    window._smartsupp.color = brandColor;
    window._smartsupp.offsetY = isMobile ? mobileOffsetY : 0;

    // Official loader pattern: keep a queue function available before script loads.
    if (!window.smartsupp) {
      const queue = ((...args: unknown[]) => {
        (queue._ = queue._ || []).push(args);
      }) as ((...args: unknown[]) => void) & { _: unknown[] };
      queue._ = [];
      window.smartsupp = queue;
    }

    if (window.__smartsuppLoaded) return;

    const existing = document.getElementById('smartsupp-loader');
    if (existing) return;

    const script = document.createElement('script');
    script.id = 'smartsupp-loader';
    script.type = 'text/javascript';
    script.charset = 'utf-8';
    script.async = true;
    script.src = 'https://www.smartsuppchat.com/loader.js?';
    script.onload = () => {
      window.__smartsuppLoaded = true;
    };
    script.onerror = () => {
      window.__smartsuppLoaded = false;
    };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!key) return;

    const styleId = 'smartsupp-left-dock-style';
    const existing = document.getElementById(styleId);
    if (existing) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Force Smartsupp widget and bubble to the left side */
      #smartsupp-widget-container,
      .smartsupp-widget-container,
      iframe[id*="smartsupp"],
      iframe[src*="smartsuppchat.com"] {
        left: 16px !important;
        right: auto !important;
      }
      @media (min-width: 768px) {
        #smartsupp-widget-container,
        .smartsupp-widget-container,
        iframe[id*="smartsupp"],
        iframe[src*="smartsuppchat.com"] {
          left: 32px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }, [key]);

  const openChat = () => {
    try {
      if (window.smartsupp) {
        window.smartsupp('chat:open');
      }
    } catch {
      // no-op
    }
  };

  if (!key) return null;

  return (
    <button
      type="button"
      onClick={openChat}
      className="fixed bottom-24 md:bottom-8 left-4 md:left-8 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-xl shadow-blue-600/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      aria-label="Open live chat"
      title="Open live chat"
    >
      <MessageCircle className="h-5 w-5" aria-hidden />
    </button>
  );
}
