import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { LocaleLink } from '../../i18n/LocaleLink';
import { stripLocaleFromPath } from '../../i18n/routing';
import { Heart, Search, ShoppingCart } from 'lucide-react';
import logo from '../../assets/logo.webp';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { useSearchStore } from '../../store/useSearchStore';
import { primaryNav, type MegaMenuId } from '../../navigation/config';
import { Button } from '../../design-system';
import { cn } from '../../lib/utils';
import LanguageSwitcher from './LanguageSwitcher';
import MegaMenu from './MegaMenu';
import AccountMenu from './AccountMenu';

type HeaderProps = {
  onLogin: () => void;
  onLogout: () => void;
  onMobileMenuOpen: () => void;
  mobileMenuOpen: boolean;
};

function isMegaItem(item: (typeof primaryNav)[number]): item is { labelKey: string; megaMenu: MegaMenuId } {
  return 'megaMenu' in item;
}

export default function Header({
  onLogin,
  onLogout,
  onMobileMenuOpen,
  mobileMenuOpen,
}: HeaderProps) {
  const { user, profile } = useAuthStore();
  const { items, openCart } = useCartStore();
  const { openSearch } = useSearchStore();
  const { t } = useTranslation('common');
  const { t: tNav } = useTranslation('nav');
  const location = useLocation();
  const pathWithoutLocale = stripLocaleFromPath(location.pathname);
  const [scrolled, setScrolled] = useState(false);
  const [activeMega, setActiveMega] = useState<MegaMenuId | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);

  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setActiveMega(null);
    setAccountOpen(false);
  }, [location.pathname]);

  const iconBtnClass =
    'relative flex h-10 w-10 items-center justify-center rounded-xl text-steel-600 hover:text-brand-600 hover:bg-brand-50/80 transition-colors';

  return (
    <header
      className={cn(
        'sticky top-0 z-50 relative transition-all duration-300',
        scrolled
          ? 'bg-white/90 backdrop-blur-xl border-b border-brand-100/80 shadow-card'
          : 'bg-white/70 backdrop-blur-md border-b border-transparent',
      )}
      onMouseLeave={() => setActiveMega(null)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-[4.25rem] items-center justify-between gap-4">
          <LocaleLink
            to="/"
            className="shrink-0 flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
            aria-label="Research Peptides EU home"
          >
            <img src={logo} alt="" className="h-9 md:h-10 w-auto" />
          </LocaleLink>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
            {primaryNav.map((item) => {
              if (isMegaItem(item)) {
                const open = activeMega === item.megaMenu;
                return (
                  <div
                    key={item.labelKey}
                    className="relative"
                    onMouseEnter={() => setActiveMega(item.megaMenu)}
                  >
                    <button
                      type="button"
                      className={cn(
                        'px-4 py-2 rounded-xl text-sm font-semibold transition-colors',
                        open
                          ? 'text-brand-600 bg-brand-50'
                          : 'text-steel-600 hover:text-brand-600 hover:bg-brand-50/60',
                      )}
                      aria-expanded={open}
                      aria-controls="mega-menu-panel"
                      onClick={() => setActiveMega(open ? null : item.megaMenu)}
                    >
                      {tNav(item.labelKey)}
                    </button>
                  </div>
                );
              }
              return (
                <LocaleLink
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-semibold transition-colors',
                    pathWithoutLocale === item.href
                      ? 'text-brand-600 bg-brand-50'
                      : 'text-steel-600 hover:text-brand-600 hover:bg-brand-50/60',
                  )}
                >
                  {tNav(item.labelKey)}
                </LocaleLink>
              );
            })}
          </nav>

          <div
            className="hidden md:flex items-center gap-1"
            role="navigation"
            aria-label="Search, language, wishlist, and cart"
          >
            <LanguageSwitcher />
            <button type="button" className={iconBtnClass} onClick={openSearch} aria-label="Open product search">
              <Search className="h-5 w-5" aria-hidden />
            </button>
            {user ? (
              <LocaleLink
                to="/wishlist"
                className={iconBtnClass}
                aria-label={t('wishlist')}
              >
                <Heart className="h-5 w-5" aria-hidden />
              </LocaleLink>
            ) : null}
            <button
              type="button"
              className={iconBtnClass}
              onClick={openCart}
              aria-label={
                cartItemCount > 0 ? `Open cart, ${cartItemCount} items` : 'Open cart'
              }
            >
              <ShoppingCart className="h-5 w-5" aria-hidden />
              {cartItemCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-0.5 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums"
                  aria-hidden
                >
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </button>
            {user ? (
              <AccountMenu
                open={accountOpen}
                onOpenChange={setAccountOpen}
                photoUrl={profile?.photo_url}
                isAdmin={profile?.role === 'admin'}
                onLogout={onLogout}
              />
            ) : (
              <Button size="sm" onClick={onLogin} className="ml-1">
                {t('login')}
              </Button>
            )}
          </div>

          <div className="flex md:hidden items-center gap-1">
            <button type="button" className={iconBtnClass} onClick={openSearch} aria-label="Open product search">
              <Search className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              className={iconBtnClass}
              onClick={openCart}
              aria-label={
                cartItemCount > 0 ? `Open cart, ${cartItemCount} items` : 'Open cart'
              }
            >
              <ShoppingCart className="h-5 w-5" aria-hidden />
              {cartItemCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-0.5 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  aria-hidden
                >
                  {cartItemCount}
                </span>
              )}
            </button>
            <button
              type="button"
              className={cn(iconBtnClass, mobileMenuOpen && 'bg-brand-50 text-brand-600')}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-drawer"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              onClick={onMobileMenuOpen}
            >
              <span className="sr-only">{mobileMenuOpen ? 'Close' : 'Menu'}</span>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      <MegaMenu activeMenu={activeMega} onClose={() => setActiveMega(null)} />
    </header>
  );
}
