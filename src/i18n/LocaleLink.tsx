import { Link, NavLink, type LinkProps, type NavLinkProps } from 'react-router-dom';
import { useLocalizedPath } from './useLocalizedPath';

type LocaleLinkProps = Omit<LinkProps, 'to'> & { to: string };

export function LocaleLink({ to, ...props }: LocaleLinkProps) {
  const localized = useLocalizedPath(to);
  return <Link to={localized} {...props} />;
}

type LocaleNavLinkProps = Omit<NavLinkProps, 'to'> & { to: string };

export function LocaleNavLink({ to, ...props }: LocaleNavLinkProps) {
  const localized = useLocalizedPath(to);
  return <NavLink to={localized} {...props} />;
}
