import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import Search from './pages/Search';
import Categories from './pages/Categories';
import Login from './pages/Login';
import FAQ from './pages/FAQ';
import Shipping from './pages/Shipping';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import RefundReturns from './pages/RefundReturns';
import PeptideGuide from './pages/PeptideGuide';
import AboutUs from './pages/AboutUs';
import PeptideCalculator from './pages/PeptideCalculator';
import COALibrary from './pages/COALibrary';
import PeptideInformation from './pages/PeptideInformation';
import PeptideResearch from './pages/PeptideResearch';
import { useAuthStore } from './store/useAuthStore';
import { useWishlistStore } from './store/useWishlistStore';
import { supabase } from './supabase';
import { AnimatePresence } from 'motion/react';

export default function App() {
  const { setUser, fetchProfile, setAuthReady } = useAuthStore();
  const { fetchWishlist } = useWishlistStore();

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(
          session.user.id, 
          session.user.email || '', 
          session.user.user_metadata?.full_name || null, 
          session.user.user_metadata?.avatar_url || null
        );
        fetchWishlist(session.user.id);
      }
      setAuthReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(
          session.user.id, 
          session.user.email || '', 
          session.user.user_metadata?.full_name || null, 
          session.user.user_metadata?.avatar_url || null
        );
        fetchWishlist(session.user.id);
      } else {
         useAuthStore.getState().setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, fetchProfile, setAuthReady, fetchWishlist]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  );
}

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:slug" element={<ProductDetails />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:id" element={<BlogPost />} />
          <Route path="profile" element={<Profile />} />
          <Route path="orders" element={<Orders />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="search" element={<Search />} />
          <Route path="categories" element={<Categories />} />
          <Route path="login" element={<Login />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="shipping" element={<Shipping />} />
          <Route path="contact" element={<Contact />} />
          <Route path="about-us" element={<AboutUs />} />
          <Route path="peptide-guide" element={<PeptideGuide />} />
          <Route path="peptide-calculator" element={<PeptideCalculator />} />
          <Route path="coas" element={<COALibrary />} />
          <Route path="peptide-information" element={<PeptideInformation />} />
          <Route path="peptide-research" element={<PeptideResearch />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="refund-returns" element={<RefundReturns />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
