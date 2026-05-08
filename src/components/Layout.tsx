import React, { useEffect, useRef, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, User, LogOut, Menu, X, Search, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useSearchStore } from '../store/useSearchStore';
import { useWizardStore } from '../store/useWizardStore';
import { supabase } from '../supabase';
import SelectorWizard from './wizard/SelectorWizard';
import RecentlyViewedSidebar from './products/RecentlyViewedSidebar';
import LiveTicker from './ticker/LiveTicker';
import ToastContainer from './ToastContainer';
import MobileBottomNav from './MobileBottomNav';
import SalesNotification from './SalesNotification';
import CartDrawer from './cart/CartDrawer';
import Omnisearch from './search/Omnisearch';
import SmartsuppChat from './chat/SmartsuppChat';
import logo from '../assets/logo.webp';

export default function Layout() {
  const { user, profile } = useAuthStore();
  const { items, openCart } = useCartStore();
  const { openSearch } = useSearchStore();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    if (!accountMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAccountMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [accountMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      <a
        href="#main-content"
        className="absolute left-4 -top-20 z-[100] rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-gray-900 shadow-lg ring-2 ring-blue-600 transition-[top] focus:top-4 focus:outline-none"
      >
        Skip to main content
      </a>
      <LiveTicker />
      {/* Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="group flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2" aria-label="Research Peptides UK home">
                <img src={logo} alt="" className="h-8 md:h-10 w-auto" />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-10" aria-label="Primary">
              <Link to="/shop" className="text-gray-500 hover:text-gray-900 font-bold uppercase tracking-widest text-[11px] transition-colors relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm">
                Shop
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" aria-hidden />
              </Link>
              <Link to="/categories" className="text-gray-500 hover:text-gray-900 font-bold uppercase tracking-widest text-[11px] transition-colors relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm">
                Categories
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" aria-hidden />
              </Link>
              <Link to="/blog" className="text-gray-500 hover:text-gray-900 font-bold uppercase tracking-widest text-[11px] transition-colors relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm">
                Research Blog
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" aria-hidden />
              </Link>
              <Link to="/peptide-guide" className="text-gray-500 hover:text-gray-900 font-bold uppercase tracking-widest text-[11px] transition-colors relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm">
                Guide
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" aria-hidden />
              </Link>
              <Link to="/contact" className="text-gray-500 hover:text-gray-900 font-bold uppercase tracking-widest text-[11px] transition-colors relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm">
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" aria-hidden />
              </Link>
            </nav>

            <div className="hidden md:flex items-center space-x-6" role="navigation" aria-label="Search, wishlist, and cart">
              <button
                type="button"
                onClick={openSearch}
                className="rounded-lg text-gray-500 hover:text-blue-600 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                aria-label="Open product search"
              >
                <Search className="h-5 w-5" aria-hidden />
              </button>
              
              {user && (
                <Link to="/wishlist" className="rounded-lg text-gray-500 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2" aria-label="Wishlist">
                  <Heart className="h-5 w-5" aria-hidden />
                </Link>
              )}

              <button 
                type="button"
                onClick={openCart}
                className="relative rounded-lg text-gray-500 hover:text-blue-600 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                aria-label={
                  cartItemCount > 0
                    ? `Open cart, ${cartItemCount} items`
                    : 'Open cart'
                }
              >
                <ShoppingCart className="h-5 w-5" aria-hidden />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center" aria-hidden>
                    {cartItemCount}
                  </span>
                )}
              </button>

              {user ? (
                <div className="relative" ref={accountMenuRef}>
                  <button
                    type="button"
                    className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-expanded={accountMenuOpen}
                    aria-haspopup="menu"
                    aria-controls="account-menu-dropdown"
                    aria-label="Account menu"
                    onClick={() => setAccountMenuOpen((o) => !o)}
                  >
                    {profile?.photo_url ? (
                      <img src={profile.photo_url} alt="" className="h-8 w-8 rounded-full" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="h-5 w-5" aria-hidden />
                    )}
                  </button>
                  {accountMenuOpen && (
                    <div
                      id="account-menu-dropdown"
                      role="menu"
                      aria-orientation="vertical"
                      className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-md shadow-xl border border-gray-100 z-50"
                    >
                      {profile?.role === 'admin' && (
                        <Link to="/admin" role="menuitem" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setAccountMenuOpen(false)}>Admin Dashboard</Link>
                      )}
                      <Link to="/profile" role="menuitem" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setAccountMenuOpen(false)}>My Profile</Link>
                      <Link to="/orders" role="menuitem" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setAccountMenuOpen(false)}>My Orders</Link>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => { setAccountMenuOpen(false); handleLogout(); }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" aria-hidden /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button type="button" onClick={handleLogin} className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white">
                  Login
                </button>
              )}
            </div>

            {/* Mobile: search + cart + menu */}
            <div className="flex md:hidden items-center gap-3" role="navigation" aria-label="Search and cart">
              <button
                type="button"
                onClick={openSearch}
                className="rounded-lg text-gray-500 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                aria-label="Open product search"
              >
                <Search className="h-6 w-6" aria-hidden />
              </button>
              <button 
                type="button"
                onClick={openCart}
                aria-label={cartItemCount > 0 ? `Open cart, ${cartItemCount} items` : 'Open cart'}
                className="relative rounded-lg text-gray-500 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                <ShoppingCart className="h-6 w-6" aria-hidden />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center" aria-hidden>
                    {cartItemCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-nav-menu"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="rounded-lg text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                {isMenuOpen ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav id="mobile-nav-menu" className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-4 space-y-1 shadow-lg" aria-label="Mobile primary">
            <Link to="/shop" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset">Shop</Link>
            <Link to="/categories" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset">Categories</Link>
            <Link to="/blog" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset">Blog</Link>
            <Link to="/peptide-guide" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset">Guide</Link>
            <Link to="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset">Contact</Link>
            <button 
              type="button"
              onClick={() => { openSearch(); setIsMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset"
            >
              Search
            </button>
            {user && (
              <>
                <Link to="/wishlist" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset">Wishlist</Link>
                <Link to="/orders" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset">My Orders</Link>
                {profile?.role === 'admin' && (
                  <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset">Admin Dashboard</Link>
                )}
                <button type="button" onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-inset">Logout</button>
              </>
            )}
            {!user && (
              <button type="button" onClick={handleLogin} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset">Login</button>
            )}
          </nav>
        )}
      </header>

      {/* Main Content - ensure padding on mobile to clear bottom nav */}
      <main id="main-content" className="flex-grow pb-20 md:pb-0 relative" tabIndex={-1}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent opacity-50" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
            <div className="md:col-span-4">
              <span className="text-3xl font-black tracking-tighter uppercase italic mb-6 block">
                RESEARCH <span className="text-blue-600">PEPTIDES UK</span>
              </span>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                The global benchmark in research-grade peptide synthesis and distribution. 
                Our laboratory-first approach ensures 99.8%+ purity on every compound shipped.
              </p>
              <address className="not-italic text-gray-500 text-sm leading-relaxed mt-8 max-w-sm">
                Contact: info@researchpeptide.uk<br />
                UK Support: +44 7508 227474
              </address>
            </div>
            
            <div className="md:col-span-2">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 mb-6">Inventory</h4>
              <ul className="space-y-4 text-sm text-gray-400 font-medium">
                <li><Link to="/shop" className="hover:text-white transition-colors">Full Catalog</Link></li>
                <li><Link to="/categories" className="hover:text-white transition-colors">By Application</Link></li>
                <li><Link to="/search" className="hover:text-white transition-colors">Advanced Search</Link></li>
              </ul>
            </div>
            
            <div className="md:col-span-2">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 mb-6">Assistance</h4>
              <ul className="space-y-4 text-sm text-gray-400 font-medium">
                <li><Link to="/faq" className="hover:text-white transition-colors">Researcher FAQ</Link></li>
                <li><Link to="/shipping" className="hover:text-white transition-colors">Stealth Logistics</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Liaison Contact</Link></li>
              </ul>
            </div>
            
            <div className="md:col-span-4">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 mb-6">Researcher Newsletter</h4>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Receive prioritized updates on supply chains, stability reports, and newly synthesized compounds.
              </p>
              <div className="flex flex-wrap gap-2 bg-white/5 backdrop-blur-md rounded-2xl p-1 border border-white/10 ring-1 ring-white/5 focus-within:ring-blue-500/50 transition-all">
                <label htmlFor="footer-newsletter-email" className="sr-only">
                  Email for researcher newsletter
                </label>
                <input 
                  id="footer-newsletter-email"
                  type="email" 
                  placeholder="Official Email Address"
                  autoComplete="email"
                  className="min-w-0 flex-1 px-4 py-3 bg-transparent text-white placeholder:text-gray-500 focus:outline-none text-sm font-medium" 
                />
                <button type="button" className="bg-blue-600 px-6 py-3 rounded-xl hover:bg-blue-700 font-bold text-sm tracking-wide transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
                  Subscribe
                </button>
              </div>
              <p className="mt-2 text-[10px] text-gray-500 font-medium">Preview only — wire to your email provider when ready.</p>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 pt-8 border-t border-white/5 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
            <span>&copy; {new Date().getFullYear()} Research Peptides UK Operations. Global Logistics.</span>
            <div className="flex gap-6">
              <Link to="/about-us" className="hover:text-blue-500 transition-colors">About</Link>
              <Link to="/peptide-guide" className="hover:text-blue-500 transition-colors">Guide</Link>
              <Link to="/peptide-calculator" className="hover:text-blue-500 transition-colors">Calculator</Link>
              <Link to="/coas" className="hover:text-blue-500 transition-colors">COAs</Link>
              <Link to="/peptide-information" className="hover:text-blue-500 transition-colors">Peptide Info</Link>
              <Link to="/peptide-research" className="hover:text-blue-500 transition-colors">Research</Link>
              <Link to="/terms" className="hover:text-blue-500 transition-colors">Protocols</Link>
              <Link to="/privacy" className="hover:text-blue-500 transition-colors">Confidentiality</Link>
              <Link to="/refund-returns" className="hover:text-blue-500 transition-colors">Returns</Link>
            </div>
          </div>
        </div>
      </footer>
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            type="button"
            onClick={handleBackToTop}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-xl shadow-blue-600/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-label="Back to top"
          >
            <ArrowUp className="h-5 w-5" aria-hidden />
          </motion.button>
        )}
      </AnimatePresence>
      <MobileBottomNav />
      <SalesNotification />
      <CartDrawer />
      <Omnisearch />
      <SelectorWizard />
      <RecentlyViewedSidebar />
      <ToastContainer />
      <SmartsuppChat />
    </div>
  );
}
