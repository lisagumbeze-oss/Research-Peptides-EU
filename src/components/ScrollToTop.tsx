import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

function jumpToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

export default function ScrollToTop() {
  const { pathname, search, hash, key } = useLocation();

  useLayoutEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  useLayoutEffect(() => {
    if (hash) return;
    jumpToTop();
  }, [pathname, search, hash, key]);

  return null;
}
