import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
// #region agent log
import { agentLog } from '../debug/agentLog';
// #endregion

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    // #region agent log
    const navType = (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined)?.type;
    agentLog('A,B', 'ScrollToTop.tsx:13', 'route change: before scrollTo', {
      pathname,
      beforeY: window.scrollY,
      scrollRestoration: history.scrollRestoration,
      navType,
      docHeight: document.documentElement.scrollHeight,
    });
    // #endregion
    window.scrollTo(0, 0);
    // #region agent log
    agentLog('A,B', 'ScrollToTop.tsx:23', 'route change: immediately after scrollTo', {
      pathname,
      afterY: window.scrollY,
      docHeight: document.documentElement.scrollHeight,
    });
    const samples = [400, 1500].map((delay) =>
      window.setTimeout(() => {
        agentLog('A,B', 'ScrollToTop.tsx:29', `scrollY sample +${delay}ms after route change`, {
          pathname,
          delay,
          scrollY: window.scrollY,
          docHeight: document.documentElement.scrollHeight,
        });
      }, delay),
    );
    return () => samples.forEach((id) => window.clearTimeout(id));
    // #endregion
  }, [pathname]);

  return null;
}
