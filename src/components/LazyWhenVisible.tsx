import { useEffect, useRef, useState, type ReactNode } from 'react';
// #region agent log
import { agentLog } from '../debug/agentLog';
// #endregion

type LazyWhenVisibleProps = {
  children: ReactNode;
  fallback?: ReactNode;
  /** Intersection root margin — load slightly before entering viewport */
  rootMargin?: string;
  className?: string;
  // #region agent log
  debugLabel?: string;
  // #endregion
};

/**
 * Defers mounting children until the placeholder nears the viewport.
 * Reduces main-thread work and network contention on the home page.
 */
export function LazyWhenVisible({
  children,
  fallback = null,
  rootMargin = '200px 0px',
  className,
  // #region agent log
  debugLabel,
  // #endregion
}: LazyWhenVisibleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // #region agent log
        agentLog('J', 'LazyWhenVisible.tsx:36', 'intersection callback', {
          isIntersecting: entry?.isIntersecting ?? null,
          ratio: entry?.intersectionRatio ?? null,
          top: Math.round(entry?.boundingClientRect?.top ?? -1),
          height: Math.round(entry?.boundingClientRect?.height ?? -1),
          label: el.dataset.debugLabel ?? null,
        });
        // #endregion
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 },
    );

    // #region agent log
    const rect = el.getBoundingClientRect();
    agentLog('J', 'LazyWhenVisible.tsx:52', 'observer attached', {
      label: el.dataset.debugLabel ?? null,
      top: Math.round(rect.top),
      height: Math.round(rect.height),
      viewportHeight: window.innerHeight,
      rootMargin,
    });
    // #endregion
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, visible]);

  return (
    <div ref={ref} className={className} data-debug-label={debugLabel}>
      {visible ? children : fallback}
    </div>
  );
}
