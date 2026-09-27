import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

function jumpToTop() {
  const scrolling = document.scrollingElement;
  if (scrolling) scrolling.scrollTop = 0;
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function scrollForLocation(hash: string) {
  if (hash.length > 1) {
    const id = decodeURIComponent(hash.slice(1));
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ block: 'start' });
      return;
    }
  }
  jumpToTop();
}

/** Resets scroll as soon as the route changes, before the next page paints. */
export default function ScrollToTop() {
  const { pathname, search, hash, key } = useLocation();

  useLayoutEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    scrollForLocation(hash);
    const frame = requestAnimationFrame(() => scrollForLocation(hash));
    return () => cancelAnimationFrame(frame);
  }, [pathname, search, hash, key]);

  return null;
}

/** Runs inside the page suspense boundary, after the new page has committed. */
export function ScrollPageToTop() {
  const { pathname, search, hash, key } = useLocation();

  useLayoutEffect(() => {
    scrollForLocation(hash);
  }, [pathname, search, hash, key]);

  return null;
}
