/**
 * Live XML sitemap for Google Search Console.
 * Served via rewrite from /sitemap.xml so Content-Type and host stay correct.
 */
type ProductRow = { slug: string | null };
type CategoryRow = { slug: string | null };
type BlogRow = { id: string; title?: string | null; slug?: string | null };

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

async function supabaseRows<T>(table: string, select: string, limit: number): Promise<T[]> {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return [];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${url}/rest/v1/${table}?select=${select}&limit=${limit}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: controller.signal,
    });
    if (!res.ok) return [];
    return (await res.json()) as T[];
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

async function buildSitemapXml(): Promise<string> {
  const origin = siteOrigin();
  const [products, categories, blogs] = await Promise.all([
    supabaseRows<ProductRow>('products', 'slug', 2000),
    supabaseRows<CategoryRow>('categories', 'slug', 500),
    supabaseRows<BlogRow>('blog_posts', 'id,title,slug', 500),
  ]);

  const entries: string[] = [];
  for (const p of STATIC_PATHS) {
    const priority = p === '/' ? '1.0' : p === '/shop' ? '0.9' : '0.7';
    const changefreq = p === '/' || p === '/shop' ? 'daily' : 'weekly';
    entries.push(urlEntry(origin, p, priority, changefreq));
  }
  for (const row of categories) {
    const slug = (row.slug || '').trim();
    if (!slug) continue;
    entries.push(urlEntry(origin, `/category/${slug}`, '0.85', 'weekly'));
  }
  for (const row of products) {
    const slug = (row.slug || '').trim();
    if (!slug) continue;
    entries.push(urlEntry(origin, `/product/${slug}`, '0.8', 'weekly'));
  }
  for (const row of blogs) {
    if (!row.id) continue;
    const explicit = (row.slug || '').trim();
    if (explicit) {
      entries.push(urlEntry(origin, `/blog/${explicit}`, '0.6', 'weekly'));
      continue;
    }
    const base =
      String(row.title || 'post')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || 'post';
    const shortId = String(row.id).replace(/-/g, '').slice(0, 8);
    entries.push(urlEntry(origin, `/blog/${base}-${shortId}`, '0.6', 'weekly'));
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const xml = await buildSitemapXml();
    // text/xml is the most widely accepted type for GSC sitemap fetchers
    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');
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
