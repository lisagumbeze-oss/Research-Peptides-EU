/** Prefetch lazy route chunks on link hover so navigation feels instant. */
const ROUTE_PRELOADERS: Record<string, () => Promise<unknown>> = {
  '/': () => import('../pages/Home'),
  '/shop': () => import('../pages/Shop'),
  '/cart': () => import('../pages/Cart'),
  '/checkout': () => import('../pages/Checkout'),
  '/blog': () => import('../pages/Blog'),
  '/categories': () => import('../pages/Categories'),
  '/search': () => import('../pages/Search'),
  '/wishlist': () => import('../pages/Wishlist'),
  '/login': () => import('../pages/Login'),
  '/orders': () => import('../pages/Orders'),
  '/profile': () => import('../pages/Profile'),
  '/faq': () => import('../pages/FAQ'),
  '/shipping': () => import('../pages/Shipping'),
  '/contact': () => import('../pages/Contact'),
  '/about-us': () => import('../pages/AboutUs'),
  '/peptide-guide': () => import('../pages/PeptideGuide'),
  '/peptide-calculator': () => import('../pages/PeptideCalculator'),
  '/coas': () => import('../pages/COALibrary'),
  '/peptide-information': () => import('../pages/PeptideInformation'),
  '/peptide-research': () => import('../pages/PeptideResearch'),
  '/terms': () => import('../pages/Terms'),
  '/privacy': () => import('../pages/Privacy'),
  '/refund-returns': () => import('../pages/RefundReturns'),
};

const prefetched = new Set<string>();

export function prefetchRoutePath(to: string) {
  const key = to.split('?')[0].replace(/\/$/, '') || '/';
  if (prefetched.has(key)) return;
  const loader = ROUTE_PRELOADERS[key];
  if (!loader) return;
  prefetched.add(key);
  void loader();
}

/** Product detail pages share one lazy chunk regardless of slug. */
export function prefetchProductRoute() {
  if (prefetched.has('__product__')) return;
  prefetched.add('__product__');
  void import('../pages/ProductDetails');
}

export function prefetchFromPath(to: string) {
  const path = to.split('?')[0].replace(/\/$/, '') || '/';
  if (path.startsWith('/product/') || /^\/[^/]+\/product\//.test(path)) {
    prefetchProductRoute();
    return;
  }
  if (path.startsWith('/blog/')) {
    prefetchRoutePath('/blog');
    void import('../pages/BlogPost');
    return;
  }
  prefetchRoutePath(path.startsWith('/') ? path : `/${path}`);
}
