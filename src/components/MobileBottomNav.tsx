import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, List, ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';

export default function MobileBottomNav() {
  const { items, openCart } = useCartStore();
  const { user } = useAuthStore();

  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
      isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
    }`;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-gray-200 pb-safe"
      aria-label="Mobile primary navigation"
    >
      <div className="flex justify-around items-center h-16 px-2">
        <NavLink to="/" className={navClass} end>
          <Home className="h-6 w-6" aria-hidden />
          <span className="text-[10px] font-medium">Home</span>
        </NavLink>

        <NavLink to="/shop" className={navClass}>
          <List className="h-6 w-6" aria-hidden />
          <span className="text-[10px] font-medium">Shop</span>
        </NavLink>

        <button
          type="button"
          onClick={openCart}
          aria-label={cartItemCount > 0 ? `Open cart, ${cartItemCount} items` : 'Open cart'}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative text-gray-500 hover:text-gray-900 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <div className="relative">
            <ShoppingCart className="h-6 w-6" aria-hidden />
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums" aria-hidden>
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Cart</span>
        </button>

        <NavLink to={user ? '/profile' : '/login'} className={navClass}>
          <User className="h-6 w-6" aria-hidden />
          <span className="text-[10px] font-medium">{user ? 'Account' : 'Login'}</span>
        </NavLink>
      </div>
    </nav>
  );
}
