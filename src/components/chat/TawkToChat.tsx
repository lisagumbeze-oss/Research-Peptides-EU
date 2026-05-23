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
      onChatMaximized?: () => void;
      onChatMinimized?: () => void;
    };
    Tawk_LoadStart?: Date;
    __tawkLoaded?: boolean;
    _smartsupp?: Record<string, unknown>;
    smartsupp?: ((...args: unknown[]) => void) & { _: unknown[] };
    __smartsuppLoaded?: boolean;
  }
}

const TAWK_HIDE_STYLE_ID = 'rp-tawk-hide-launcher';
const LEGACY_SMARTSUPP_STYLE_ID = 'smartsupp-hide-default-bubble';

function getTawkIds(): { propertyId: string; widgetId: string } | null {
  const propertyId = (import.meta.env.VITE_TAWK_PROPERTY_ID as string | undefined)?.trim();
  const widgetId = (import.meta.env.VITE_TAWK_WIDGET_ID as string | undefined)?.trim();
  if (propertyId && widgetId) return { propertyId, widgetId };

  const combined = (import.meta.env.VITE_TAWK_EMBED_ID as string | undefined)?.trim();
  if (combined?.includes('/')) {
    const [p, w] = combined.split('/').map((s) => s.trim());
    if (p && w) return { propertyId: p, widgetId: w };
  }

  return null;
}

/** Remove legacy Smartsupp scripts/DOM so only tawk + our trigger remain. */
function removeLegacySmartsupp() {
  document.getElementById('smartsupp-loader')?.remove();
  document.getElementById(LEGACY_SMARTSUPP_STYLE_ID)?.remove();
  document.querySelectorAll('script[src*="smartsuppchat.com"]').forEach((el) => el.remove());
  document.getElementById('smartsupp-widget-container')?.remove();
  document.querySelectorAll('[id^="smartsupp"]').forEach((el) => {
    if (el.id === 'smartsupp-widget-container' || el.id.includes('smartsupp')) {
      el.remove();
    }
  });
  delete window.smartsupp;
  delete window._smartsupp;
  delete window.__smartsuppLoaded;
}

function injectTawkLauncherHideStyles(mobileOffset: number) {
  if (document.getElementById(TAWK_HIDE_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = TAWK_HIDE_STYLE_ID;
  style.textContent = `
    /* Hide tawk.to default launcher — branded trigger is .rp-live-chat-trigger */
    #tawk-bubble-container,
    .tawk-min-container,
    .tawk-button,
    .tawk-branding,
    .tawk-branding-small {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
      width: 0 !important;
      height: 0 !important;
    }
    @media (max-width: 768px) {
      .tawk-max-container {
        bottom: ${mobileOffset}px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function hideTawkLauncher() {
  try {
    window.Tawk_API?.hideWidget?.();
  } catch {
    /* ignore */
  }
}

/**
 * tawk.to live chat with EU branded floating trigger (default bubble hidden).
 */
export default function TawkToChat() {
  const ids = getTawkIds();
  const mobileOffset =
    Number(import.meta.env.VITE_TAWK_MOBILE_OFFSET_Y as string | undefined) || 88;

  useEffect(() => {
    removeLegacySmartsupp();

    if (!ids) return;

    injectTawkLauncherHideStyles(mobileOffset);

    if (document.getElementById('tawk-loader')) {
      hideTawkLauncher();
      return;
    }

    window.Tawk_API = window.Tawk_API || {};
    const previousOnLoad = window.Tawk_API.onLoad;
    window.Tawk_API.onLoad = function onTawkLoad() {
      previousOnLoad?.();
      hideTawkLauncher();
    };

    const previousOnMinimized = window.Tawk_API.onChatMinimized;
    window.Tawk_API.onChatMinimized = function onTawkMinimized() {
      previousOnMinimized?.();
      hideTawkLauncher();
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
      hideTawkLauncher();
    };
    document.head.appendChild(script);

    hideTawkLauncher();
    const poll = window.setInterval(hideTawkLauncher, 400);
    const stopPoll = window.setTimeout(() => window.clearInterval(poll), 12_000);

    return () => {
      window.clearInterval(poll);
      window.clearTimeout(stopPoll);
    };
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
      className="rp-live-chat-trigger fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[100] bg-brand-500 hover:bg-brand-600 text-white rounded-full p-4 shadow-glow transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center group ring-4 ring-white/10"
      aria-label="Open live chat"
      title="Open live chat"
    >
      <MessageCircle className="h-6 w-6 transition-transform group-hover:rotate-12" aria-hidden />
      <span className="sr-only">Live Chat</span>
      <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
    </button>
  );
}
