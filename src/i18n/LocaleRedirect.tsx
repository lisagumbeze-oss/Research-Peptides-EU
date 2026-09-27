import { Navigate } from 'react-router-dom';
import { DEFAULT_LOCALE, pathWithLocale } from './routing';

/** Site entry is always English. Another language is chosen from the language control. */
export function LocaleRedirect() {
  return <Navigate to={pathWithLocale(DEFAULT_LOCALE, '/')} replace />;
}
