/**
 * Live XML sitemap for Google Search Console.
 * Served via rewrite from /sitemap.xml (do not ship a public/sitemap.xml —
 * static files override rewrites on Vercel and can strand an incomplete build).
 */
type ProductRow = { slug: string | null };
type CategoryRow = { slug: string | null };
type BlogRow = { id: string; title?: string | null };

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

function supabaseConfig(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  // Prefer service role; fall back to anon (products/categories are typically public-read).
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

/** Paginate through PostgREST (default max-rows is often 1000). */
async function supabaseRows<T>(table: string, select: string, pageSize = 1000): Promise<T[]> {
  const cfg = supabaseConfig();
  if (!cfg) return [];

  const out: T[] = [];
  let from = 0;

  while (true) {
    const to = from + pageSize - 1;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(`${cfg.url}/rest/v1/${table}?select=${encodeURIComponent(select)}`, {
        headers: {
          apikey: cfg.key,
          Authorization: `Bearer ${cfg.key}`,
          Range: `${from}-${to}`,
          Prefer: 'count=exact',
        },
        signal: controller.signal,
      });
      if (!res.ok) break;
      const chunk = (await res.json()) as T[];
      if (!Array.isArray(chunk) || chunk.length === 0) break;
      out.push(...chunk);
      if (chunk.length < pageSize) break;
      from += pageSize;
      if (out.length >= 5000) break;
    } catch {
      break;
    } finally {
      clearTimeout(timer);
    }
  }

  return out;
}

async function buildSitemapXml(): Promise<{ xml: string; stats: { products: number; categories: number; blogs: number; static: number } }> {
  const origin = siteOrigin();
  const [products, categories, blogs] = await Promise.all([
    supabaseRows<ProductRow>('products', 'slug'),
    supabaseRows<CategoryRow>('categories', 'slug'),
    supabaseRows<BlogRow>('blog_posts', 'id,title'),
  ]);

  const entries: string[] = [];
  for (const p of STATIC_PATHS) {
    const priority = p === '/' ? '1.0' : p === '/shop' ? '0.9' : '0.7';
    const changefreq = p === '/' || p === '/shop' ? 'daily' : 'weekly';
    entries.push(urlEntry(origin, p, priority, changefreq));
  }

  let categoryCount = 0;
  for (const row of categories) {
    const slug = (row.slug || '').trim();
    if (!slug) continue;
    categoryCount++;
    entries.push(urlEntry(origin, `/category/${slug}`, '0.85', 'weekly'));
  }

  let productCount = 0;
  for (const row of products) {
    const slug = (row.slug || '').trim();
    if (!slug) continue;
    productCount++;
    entries.push(urlEntry(origin, `/product/${slug}`, '0.8', 'weekly'));
  }

  let blogCount = 0;
  for (const row of blogs) {
    if (!row.id) continue;
    blogCount++;
    // Matches src/lib/blogUrl.ts blogSlug() — blog_posts has no slug column.
    const id = String(row.id).trim();
    const looksLikeUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    let pathSlug = id && !looksLikeUuid ? id : '';
    if (!pathSlug) {
      const base =
        String(row.title || 'post')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 80) || 'post';
      const shortId = id.replace(/-/g, '').slice(0, 8);
      pathSlug = shortId ? `${base}-${shortId}` : base;
    }
    entries.push(urlEntry(origin, `/blog/${pathSlug}`, '0.6', 'weekly'));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;

  return {
    xml,
    stats: {
      products: productCount,
      categories: categoryCount,
      blogs: blogCount,
      static: STATIC_PATHS.length,
    },
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { xml, stats } = await buildSitemapXml();
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader(
      'X-Sitemap-Counts',
      `static=${stats.static};products=${stats.products};categories=${stats.categories};blogs=${stats.blogs}`,
    );
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
