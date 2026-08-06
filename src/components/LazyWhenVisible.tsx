import { useEffect, useRef, useState, type ReactNode } from 'react';

type LazyWhenVisibleProps = {
  children: ReactNode;
  fallback?: ReactNode;
  /** Intersection root margin — load slightly before entering viewport */
  rootMargin?: string;
  className?: string;
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
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, visible]);

  return (
    <div ref={ref} className={className}>
      {visible ? children : fallback}
    </div>
  );
}
