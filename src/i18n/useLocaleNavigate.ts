import { useCallback } from 'react';
import { useNavigate, type NavigateOptions } from 'react-router-dom';
import { useLocale } from './LocaleProvider';
import { pathWithLocale } from './routing';
import { prefetchFromPath } from '../routes/prefetchRoute';

function jumpToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

export function useLocaleNavigate() {
  const navigate = useNavigate();
  const { locale } = useLocale();

  return useCallback(
    (to: string, options?: NavigateOptions) => {
      if (/^https?:\/\//i.test(to)) {
        window.location.assign(to);
        return;
      }
      const path = to.startsWith('/') ? to : `/${to}`;
      prefetchFromPath(path);
      jumpToTop();
      navigate(pathWithLocale(locale, path), options);
    },
    [navigate, locale],
  );
}
