/**
 * Live XML sitemap for Google Search Console.
 * Served via rewrite from /sitemap.xml (do not ship a public/sitemap.xml —
 * static files override rewrites on Vercel and can strand an incomplete build).
 *
 * Prefers live Supabase rows; falls back to /sitemap-routes.json (written at
 * build by npm run sitemap:generate) when runtime Supabase env is missing.
 */
type ProductRow = { slug: string | null };
type CategoryRow = { slug: string | null };
type BlogRow = { id: string; title?: string | null };

type RouteCache = {
  generatedAt?: string;
  products: string[];
  categories: string[];
  blogs: string[];
};

const LOCALES = [
  'en',
  'nl',
  'fr',
  'de',
  'es',
  'it',
  'pt',
  'hr',
  'pl',
  'ro',
  'cs',
  'da',
  'sv',
  'fi',
  'el',
  'hu',
  'sk',
  'sl',
  'bg',
] as const;

const STATIC_PATHS = [
  '/',
  '/shop',
  '/categories',
  '/faq',
  '/shipping',
  '/contact',
  '/about-us',
  '/peptide-guide',
  '/peptide-calculator',
  '/coas',
  '/peptide-information',
  '/peptide-research',
  '/terms',
  '/privacy',
  '/refund-returns',
  '/blog',
];

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Always www — matches production redirects and the GSC www property. */
function siteOrigin(): string {
  const raw = (process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://www.researchpeptide.eu').replace(
    /\/+$/,
    '',
  );
  return raw.replace('://researchpeptide.eu', '://www.researchpeptide.eu');
}

function loc(origin: string, locale: string, p: string) {
  const base = p === '/' ? `/${locale}` : `/${locale}${p}`;
  return `${origin}${base}`;
}

function hreflangLinks(origin: string, pathName: string): string {
  const lines = LOCALES.map(
    (locale) =>
      `    <xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(loc(origin, locale, pathName))}" />`,
  );
  lines.push(
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(loc(origin, 'en', pathName))}" />`,
  );
  return lines.join('\n');
}

function urlEntry(origin: string, pathName: string, priority: string, changefreq: string) {
  const lastmod = new Date().toISOString().slice(0, 10);
  return `  <url>
    <loc>${escapeXml(loc(origin, 'en', pathName))}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${hreflangLinks(origin, pathName)}
  </url>`;
}

function supabaseConfig(): { url: string; key: string; keyKind: string } | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && url) {
    return { url, key: process.env.SUPABASE_SERVICE_ROLE_KEY, keyKind: 'service' };
  }
  const anon = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (anon && url) return { url, key: anon, keyKind: 'anon' };
  return null;
}

function blogPathFromRow(row: BlogRow): string | null {
  if (!row.id) return null;
  const id = String(row.id).trim();
  const looksLikeUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
  if (id && !looksLikeUuid) return `/blog/${id}`;
  const base =
    String(row.title || 'post')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'post';
  const shortId = id.replace(/-/g, '').slice(0, 8);
  return `/blog/${shortId ? `${base}-${shortId}` : base}`;
}

async function supabaseRows<T>(table: string, select: string, pageSize = 1000): Promise<T[]> {
  const cfg = supabaseConfig();
  if (!cfg) return [];

  const out: T[] = [];
  let offset = 0;

  while (offset < 5000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const qs = new URLSearchParams({
        select,
        limit: String(pageSize),
        offset: String(offset),
      });
      const res = await fetch(`${cfg.url}/rest/v1/${table}?${qs.toString()}`, {
        headers: {
          apikey: cfg.key,
          Authorization: `Bearer ${cfg.key}`,
        },
        signal: controller.signal,
      });
      if (!res.ok) break;
      const chunk = (await res.json()) as T[];
      if (!Array.isArray(chunk) || chunk.length === 0) break;
      out.push(...chunk);
      if (chunk.length < pageSize) break;
      offset += pageSize;
    } catch {
      break;
    } finally {
      clearTimeout(timer);
    }
  }

  return out;
}

async function loadRouteCache(origin: string): Promise<RouteCache | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${origin}/sitemap-routes.json`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as RouteCache;
    if (!data || !Array.isArray(data.products)) return null;
    return {
      generatedAt: data.generatedAt,
      products: data.products.filter(Boolean),
      categories: Array.isArray(data.categories) ? data.categories.filter(Boolean) : [],
      blogs: Array.isArray(data.blogs) ? data.blogs.filter(Boolean) : [],
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function loadDynamicPaths(origin: string): Promise<{
  productPaths: string[];
  categoryPaths: string[];
  blogPaths: string[];
  source: 'live' | 'cache' | 'none';
  diag: string;
}> {
  const cfg = supabaseConfig();
  const diagParts: string[] = [`url=${cfg ? 'yes' : 'no'}`, `key=${cfg?.keyKind || 'missing'}`];

  if (cfg) {
    const [products, categories, blogs] = await Promise.all([
      supabaseRows<ProductRow>('products', 'slug'),
      supabaseRows<CategoryRow>('categories', 'slug'),
      supabaseRows<BlogRow>('blog_posts', 'id,title'),
    ]);

    const productPaths = products
      .map((row) => (row.slug || '').trim())
      .filter(Boolean)
      .map((slug) => `/product/${slug}`);
    const categoryPaths = categories
      .map((row) => (row.slug || '').trim())
      .filter(Boolean)
      .map((slug) => `/category/${slug}`);
    const blogPaths = blogs.map(blogPathFromRow).filter((p): p is string => Boolean(p));

    diagParts.push(`liveProducts=${productPaths.length}`);

    if (productPaths.length > 0) {
      return {
        productPaths,
        categoryPaths,
        blogPaths,
        source: 'live',
        diag: diagParts.join(';'),
      };
    }
  }

  const cache = await loadRouteCache(origin);
  diagParts.push(`cacheProducts=${cache?.products.length ?? 0}`);
  if (cache && cache.products.length > 0) {
    return {
      productPaths: cache.products.map((slug) => `/product/${slug}`),
      categoryPaths: cache.categories.map((slug) => `/category/${slug}`),
      blogPaths: cache.blogs.map((slug) => `/blog/${slug}`),
      source: 'cache',
      diag: diagParts.join(';'),
    };
  }

  return {
    productPaths: [],
    categoryPaths: [],
    blogPaths: [],
    source: 'none',
    diag: diagParts.join(';'),
  };
}

async function buildSitemapXml(): Promise<{
  xml: string;
  stats: { products: number; categories: number; blogs: number; static: number };
  source: string;
  diag: string;
}> {
  const origin = siteOrigin();
  const { productPaths, categoryPaths, blogPaths, source, diag } = await loadDynamicPaths(origin);

  const entries: string[] = [];
  for (const p of STATIC_PATHS) {
    const priority = p === '/' ? '1.0' : p === '/shop' ? '0.9' : '0.7';
    const changefreq = p === '/' || p === '/shop' ? 'daily' : 'weekly';
    entries.push(urlEntry(origin, p, priority, changefreq));
  }
  for (const p of categoryPaths) entries.push(urlEntry(origin, p, '0.85', 'weekly'));
  for (const p of productPaths) entries.push(urlEntry(origin, p, '0.8', 'weekly'));
  for (const p of blogPaths) entries.push(urlEntry(origin, p, '0.6', 'weekly'));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;

  return {
    xml,
    stats: {
      products: productPaths.length,
      categories: categoryPaths.length,
      blogs: blogPaths.length,
      static: STATIC_PATHS.length,
    },
    source,
    diag,
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { xml, stats, source, diag } = await buildSitemapXml();
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader(
      'X-Sitemap-Counts',
      `static=${stats.static};products=${stats.products};categories=${stats.categories};blogs=${stats.blogs}`,
    );
    res.setHeader('X-Sitemap-Source', source);
    res.setHeader('X-Sitemap-Diag', diag);
    if (req.method === 'HEAD') {
      res.setHeader('Content-Length', Buffer.byteLength(xml, 'utf8'));
      return res.status(200).end();
    }
    return res.status(200).send(xml);
  } catch (error: any) {
    console.error('sitemap handler:', error);
    return res.status(500).send('Sitemap generation failed');
  }
}
