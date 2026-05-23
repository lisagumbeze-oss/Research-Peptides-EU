import { useCallback } from 'react';
import { useNavigate, type NavigateOptions } from 'react-router-dom';
import { useLocale } from './LocaleProvider';
import { pathWithLocale } from './routing';

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
      navigate(pathWithLocale(locale, path), options);
    },
    [navigate, locale],
  );
}
