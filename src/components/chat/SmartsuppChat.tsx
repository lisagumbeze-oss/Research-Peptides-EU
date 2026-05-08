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
 * Smartsupp loader with brand color support and custom trigger.
 * This component hides the default Smartsupp bubble to use a custom branded one.
 */
export default function SmartsuppChat() {
  const key = (import.meta.env.VITE_SMARTSUPP_KEY as string | undefined)?.trim();

  useEffect(() => {
    if (!key) return;

    const brandColor =
      (import.meta.env.VITE_SMARTSUPP_COLOR as string | undefined)?.trim() || '#2563eb';
    
    // Initialize Smartsupp configuration
    window._smartsupp = window._smartsupp || {};
    window._smartsupp.key = key;
    window._smartsupp.color = brandColor;
    
    // Hide default bubble as we provide our own custom button
    window._smartsupp.hideWidget = true;
    window._smartsupp.hideMobileWidget = true;

    // Official loader pattern
    if (!window.smartsupp) {
      const queue = ((...args: unknown[]) => {
        (queue._ = queue._ || []).push(args);
      }) as ((...args: unknown[]) => void) & { _: unknown[] };
      queue._ = [];
      window.smartsupp = queue;
    }

    // Prevent multiple script injections
    if (document.getElementById('smartsupp-loader')) return;

    const script = document.createElement('script');
    script.id = 'smartsupp-loader';
    script.type = 'text/javascript';
    script.charset = 'utf-8';
    script.async = true;
    script.src = `https://www.smartsuppchat.com/loader.js?key=${key}`;
    
    script.onload = () => {
      window.__smartsuppLoaded = true;
      if (window.smartsupp) {
        // Double down on hiding the default widget bubble
        window.smartsupp('widget:hide');
        window.smartsupp('chat:hide');
      }
    };
    
    document.head.appendChild(script);

    // Injection of CSS to hide the default bubble iframe specifically
    // while allowing the chat window to appear when triggered.
    const styleId = 'smartsupp-hide-default-bubble';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* Hide the default Smartsupp bubble iframe and container */
        #smartsupp-widget-container iframe[id*="bubble"],
        .smartsupp-widget-bubble,
        #smartsupp-widget-bubble,
        /* Smartsupp v3 specific selectors */
        #smartsupp-widget-container div[aria-label="Open Smartsupp chat"],
        #smartsupp-widget-container button[aria-label="Open Smartsupp chat"],
        .smartsupp-widget-v3 div[aria-label*="chat"],
        [data-testid="widget-button"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          width: 0 !important;
          height: 0 !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, [key]);

  const openChat = () => {
    try {
      if (window.smartsupp) {
        // Show and open the chat
        window.smartsupp('chat:show');
        window.smartsupp('chat:open');
      }
    } catch (err) {
      console.warn('Smartsupp open failed:', err);
    }
  };

  if (!key) return null;

  return (
    <button
      type="button"
      onClick={openChat}
      className="fixed bottom-24 md:bottom-8 left-4 md:left-8 z-[100] bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center group ring-4 ring-white/10"
      aria-label="Open live chat"
      title="Open live chat"
    >
      <MessageCircle className="h-6 w-6 transition-transform group-hover:rotate-12" aria-hidden />
      <span className="sr-only">Live Chat</span>
      
      {/* Subtle notification dot to attract attention */}
      <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
    </button>
  );
}



