import { useEffect } from 'react';
import { Container } from '../design-system';
// #region agent log
import { agentLog } from '../debug/agentLog';
// #endregion

/** Route-level suspense fallback — minimal layout shift. */
export function PageLoader() {
  // #region agent log
  useEffect(() => {
    const path = window.location.pathname;
    const mountedAt = Date.now();
    agentLog('C,D', 'PageLoader.tsx:12', 'suspense fallback shown (lazy chunk loading)', { path });
    return () => {
      agentLog('C,D', 'PageLoader.tsx:15', 'suspense fallback hidden (chunk ready)', {
        path,
        visibleMs: Date.now() - mountedAt,
      });
    };
  }, []);
  // #endregion

  return (
    <Container className="py-20 flex justify-center" role="status" aria-live="polite">
      <span className="sr-only">Loading page</span>
      <div className="h-10 w-10 rounded-full border-2 border-brand-200 border-t-brand-500 animate-spin" />
    </Container>
  );
}
