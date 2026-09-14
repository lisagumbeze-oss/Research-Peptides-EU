import { stripLocaleFromPath } from '../i18n/routing';

/** Prefetch lazy route chunks on pointer-down / hover so navigation feels instant. */
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
  '/admin': () => import('../pages/AdminDashboard'),
};

const prefetched = new Set<string>();

function routeKey(to: string) {
  const pathOnly = to.split(/[?#]/)[0] || '/';
  return stripLocaleFromPath(pathOnly).replace(/\/$/, '') || '/';
}

export function prefetchRoutePath(to: string) {
  const key = routeKey(to);
  if (prefetched.has(key)) return;
  const loader = ROUTE_PRELOADERS[key];
  if (!loader) return;
  prefetched.add(key);
  void loader();
}

/** Product detail pages share one chunk regardless of slug. */
export function prefetchProductRoute() {
  if (prefetched.has('__product__')) return;
  prefetched.add('__product__');
  void import('../pages/ProductDetails');
}

function prefetchCategoryRoute() {
  if (prefetched.has('__category__')) return;
  prefetched.add('__category__');
  void import('../pages/CategoryLanding');
}

function prefetchBlogPostRoute() {
  if (prefetched.has('__blog_post__')) return;
  prefetched.add('__blog_post__');
  void import('../pages/BlogPost');
}

export function prefetchFromPath(to: string) {
  const path = routeKey(to);
  if (path.startsWith('/product/')) {
    prefetchProductRoute();
    return;
  }
  if (path.startsWith('/category/')) {
    prefetchCategoryRoute();
    return;
  }
  if (path.startsWith('/blog/') && path !== '/blog') {
    prefetchRoutePath('/blog');
    prefetchBlogPostRoute();
    return;
  }
  prefetchRoutePath(path);
}

/** Warm remaining storefront chunks after first paint (mobile has no hover). */
export function prefetchAllStorefrontRoutes() {
  prefetchProductRoute();
  prefetchCategoryRoute();
  prefetchBlogPostRoute();
  for (const key of Object.keys(ROUTE_PRELOADERS)) {
    prefetchRoutePath(key);
  }
}
