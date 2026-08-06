import React from 'react';
// #region agent log
import { agentLog } from '../debug/agentLog';
// #endregion

type Props = { children: React.ReactNode };

type State = { failed: boolean };

/** Detects lazy-route chunk failures after a deploy (404 on hashed asset filenames). */
function isStaleChunkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Importing a module script failed') ||
    message.includes('Loading chunk') ||
    message.includes('ChunkLoadError')
  );
}

const RELOAD_GUARD_KEY = 'rp-eu-chunk-reload';

function reloadOnceForStaleChunks(reason: string): boolean {
  try {
    const last = sessionStorage.getItem(RELOAD_GUARD_KEY);
    if (last && Date.now() - Number(last) < 15_000) return false;
    sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now()));
  } catch {
    /* sessionStorage unavailable */
  }
  // #region agent log
  agentLog('L', 'RouteChunkErrorBoundary.tsx:33', 'stale chunk recovery reload', {
    reason,
    href: window.location.href,
  });
  // #endregion
  window.location.reload();
  return true;
}

/**
 * Without this boundary, a stale lazy chunk leaves Suspense on PageLoader forever.
 * On chunk failure we reload once so the browser picks up the current asset manifest.
 */
export class RouteChunkErrorBoundary extends React.Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    if (isStaleChunkError(error) && reloadOnceForStaleChunks('error-boundary')) return;
    console.error('Route render failed:', error);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="mx-auto max-w-lg px-6 py-20 text-center">
          <h1 className="text-xl font-black text-navy-950">Page failed to load</h1>
          <p className="mt-3 text-sm font-medium text-steel-600">
            A new version of the site may be available. Refresh to continue.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-2xl bg-brand-500 px-8 py-3 text-sm font-black text-white hover:bg-brand-600"
          >
            Refresh page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/** Vite emits this when a dynamic import fails in production builds. */
export function installStaleChunkRecovery() {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    reloadOnceForStaleChunks('vite-preload-error');
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (isStaleChunkError(event.reason)) {
      event.preventDefault();
      reloadOnceForStaleChunks('unhandled-rejection');
    }
  });
}
