import type {
  FocusEvent,
  FocusEventHandler,
  MouseEvent,
  MouseEventHandler,
  PointerEvent,
  PointerEventHandler,
} from 'react';
import { Link, NavLink, type LinkProps, type NavLinkProps } from 'react-router-dom';
import { useLocalizedPath } from './useLocalizedPath';
import { prefetchFromPath } from '../routes/prefetchRoute';

function jumpToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

type PrefetchHandlers = {
  onMouseEnter?: MouseEventHandler<HTMLAnchorElement>;
  onFocus?: FocusEventHandler<HTMLAnchorElement>;
  onPointerDown?: PointerEventHandler<HTMLAnchorElement>;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

function attachNavHandlers(to: string, handlers: PrefetchHandlers = {}) {
  const prefetch = () => prefetchFromPath(to);
  return {
    onPointerDown: (e: PointerEvent<HTMLAnchorElement>) => {
      prefetch();
      handlers.onPointerDown?.(e);
    },
    onMouseEnter: (e: MouseEvent<HTMLAnchorElement>) => {
      prefetch();
      handlers.onMouseEnter?.(e);
    },
    onFocus: (e: FocusEvent<HTMLAnchorElement>) => {
      prefetch();
      handlers.onFocus?.(e);
    },
    onClick: (e: MouseEvent<HTMLAnchorElement>) => {
      jumpToTop();
      handlers.onClick?.(e);
    },
  };
}

type LocaleLinkProps = Omit<LinkProps, 'to'> & { to: string };

export function LocaleLink({
  to,
  onMouseEnter,
  onFocus,
  onPointerDown,
  onClick,
  ...props
}: LocaleLinkProps) {
  const localized = useLocalizedPath(to);
  return (
    <Link
      to={localized}
      {...props}
      {...attachNavHandlers(to, { onMouseEnter, onFocus, onPointerDown, onClick })}
    />
  );
}

type LocaleNavLinkProps = Omit<NavLinkProps, 'to'> & { to: string };

export function LocaleNavLink({
  to,
  onMouseEnter,
  onFocus,
  onPointerDown,
  onClick,
  ...props
}: LocaleNavLinkProps) {
  const localized = useLocalizedPath(to);
  return (
    <NavLink
      to={localized}
      {...props}
      {...attachNavHandlers(to, { onMouseEnter, onFocus, onPointerDown, onClick })}
    />
  );
}
