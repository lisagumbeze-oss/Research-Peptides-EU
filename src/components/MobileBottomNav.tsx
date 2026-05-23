import React from 'react';
import { useTranslation } from 'react-i18next';
import { LocaleNavLink } from '../i18n/LocaleLink';
import { Home, List, ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { cn } from '../lib/utils';

export default function MobileBottomNav() {
  const { t } = useTranslation('common');
  const { items, openCart } = useCartStore();
  const { user } = useAuthStore();

  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors rounded-lg',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
      isActive ? 'text-brand-600' : 'text-steel-600 hover:text-brand-600',
    );

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-brand-100 pb-safe shadow-[0_-4px_24px_rgba(10,15,30,0.06)]"
      aria-label="Mobile primary navigation"
    >
      <div className="flex justify-around items-center h-16 px-2">
        <LocaleNavLink to="/" className={navClass} end>
          <Home className="h-6 w-6" aria-hidden />
          <span className="text-[10px] font-semibold">{t('home')}</span>
        </LocaleNavLink>

        <LocaleNavLink to="/shop" className={navClass}>
          <List className="h-6 w-6" aria-hidden />
          <span className="text-[10px] font-semibold">{t('shop')}</span>
        </LocaleNavLink>

        <button
          type="button"
          onClick={openCart}
          aria-label={cartItemCount > 0 ? `Open cart, ${cartItemCount} items` : 'Open cart'}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative text-steel-600 hover:text-brand-600 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
        >
          <div className="relative">
            <ShoppingCart className="h-6 w-6" aria-hidden />
            {cartItemCount > 0 && (
              <span
                className="absolute -top-1.5 -right-2 min-w-4 h-4 px-0.5 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums"
                aria-hidden
              >
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold">{t('cart')}</span>
        </button>

        <LocaleNavLink to={user ? '/profile' : '/login'} className={navClass}>
          <User className="h-6 w-6" aria-hidden />
          <span className="text-[10px] font-semibold">{user ? t('account') : t('login')}</span>
        </LocaleNavLink>
      </div>
    </nav>
  );
}
