/**
 * Writes a local preview sitemap (scratch/sitemap.xml) with locale hreflang alternates
 * (+ product / category / blog URLs from Supabase).
 *
 *   npm run sitemap:generate
 *
 * Production serves /sitemap.xml via api/sitemap.ts (Vercel rewrite). Do NOT write
 * public/sitemap.xml — a static file there overrides the rewrite and can strand an
 * incomplete build-time sitemap (static pages only).
 *
 * Canonical host must match production redirects (apex → www) or Google Search Console
 * reports "Sitemap could not be read" / discovers 0 URLs.
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

/** Prefer www — production redirects researchpeptide.eu → www.researchpeptide.eu */
function canonicalOrigin(raw: string): string {
  let origin = raw.replace(/\/+$/, '');
  origin = origin.replace('://researchpeptide.eu', '://www.researchpeptide.eu');
  return origin;
}

const SITE_ORIGIN = canonicalOrigin(process.env.VITE_SITE_URL || 'https://www.researchpeptide.eu');

/** Keep in sync with src/i18n/locales.ts supportedLocales */
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

function loc(locale: string, p: string) {
  const base = p === '/' ? `/${locale}` : `/${locale}${p}`;
  return `${SITE_ORIGIN}${base}`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function hreflangLinks(pathName: string): string {
  const lines = LOCALES.map(
    (locale) =>
      `    <xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(loc(locale, pathName))}" />`,
  );
  lines.push(
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(loc('en', pathName))}" />`,
  );
  return lines.join('\n');
}

function urlEntry(pathName: string, priority: string, changefreq: string) {
  const lastmod = new Date().toISOString().slice(0, 10);
  return `  <url>
    <loc>${escapeXml(loc('en', pathName))}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${hreflangLinks(pathName)}
  </url>`;
}

function supabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function productPaths(): Promise<string[]> {
  const supabase = supabaseClient();
  if (!supabase) {
    console.warn('Skipping product URLs (no Supabase credentials).');
    return [];
  }
  const { data, error } = await supabase
    .from('products')
    .select('slug')
    .not('slug', 'is', null)
    .limit(2000);
  if (error) {
    console.warn('Product fetch failed:', error.message);
    return [];
  }
  return (data ?? [])
    .map((row) => (row.slug ? `/product/${String(row.slug).trim()}` : null))
    .filter((p): p is string => Boolean(p));
}

async function categoryPaths(): Promise<string[]> {
  const supabase = supabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('categories')
    .select('slug')
    .not('slug', 'is', null)
    .limit(500);
  if (error) return [];
  return (data ?? [])
    .map((row) => (row.slug ? `/category/${String(row.slug).trim()}` : null))
    .filter((p): p is string => Boolean(p));
}

async function blogPaths(): Promise<string[]> {
  const supabase = supabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from('blog_posts').select('id, title').limit(500);
  if (error) {
    console.warn('Blog fetch failed:', error.message);
    return [];
  }
  return (data ?? []).map((row) => {
    // Matches src/lib/blogUrl.ts blogSlug() — blog_posts has no slug column.
    const id = String(row.id || '').trim();
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
  });
}

async function main() {
  const [productRoutes, categoryRoutes, blogRoutes] = await Promise.all([
    productPaths(),
    categoryPaths(),
    blogPaths(),
  ]);
  const entries: string[] = [];

  for (const p of STATIC_PATHS) {
    const priority = p === '/' ? '1.0' : p === '/shop' ? '0.9' : '0.7';
    const changefreq = p === '/' || p === '/shop' ? 'daily' : 'weekly';
    entries.push(urlEntry(p, priority, changefreq));
  }

  for (const p of categoryRoutes) {
    entries.push(urlEntry(p, '0.85', 'weekly'));
  }

  for (const p of productRoutes) {
    entries.push(urlEntry(p, '0.8', 'weekly'));
  }

  for (const p of blogRoutes) {
    entries.push(urlEntry(p, '0.6', 'weekly'));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;

  const scratchDir = path.join(process.cwd(), 'scratch');
  fs.mkdirSync(scratchDir, { recursive: true });
  const out = path.join(scratchDir, 'sitemap.xml');
  fs.writeFileSync(out, xml, 'utf8');

  // Build-time JSON cache — api/sitemap.ts fetches /sitemap-routes.json when
  // runtime Supabase credentials are missing on Vercel.
  const productSlugs = productRoutes.map((p) => p.replace(/^\/product\//, ''));
  const categorySlugs = categoryRoutes.map((p) => p.replace(/^\/category\//, ''));
  const blogSlugs = blogRoutes.map((p) => p.replace(/^\/blog\//, ''));
  const publicDir = path.join(process.cwd(), 'public');
  fs.mkdirSync(publicDir, { recursive: true });
  const jsonPath = path.join(publicDir, 'sitemap-routes.json');

  // Never overwrite a populated cache with empty results (common on Vercel builds
  // that lack SUPABASE_* / VITE_SUPABASE_* env for the generate script).
  if (productSlugs.length === 0 && fs.existsSync(jsonPath)) {
    console.warn('Skipping sitemap-routes.json update: 0 products fetched; keeping existing cache.');
  } else {
    const payload = {
      generatedAt: new Date().toISOString(),
      products: productSlugs,
      categories: categorySlugs,
      blogs: blogSlugs,
    };
    fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), 'utf8');
    console.log(`Wrote fallback route cache to ${jsonPath}`);
  }

  // Remove obsolete TS cache if present (previous approach crashed the serverless import).
  const obsoleteTs = path.join(process.cwd(), 'api', 'sitemap-routes.generated.ts');
  if (fs.existsSync(obsoleteTs)) {
    fs.unlinkSync(obsoleteTs);
    console.log('Removed api/sitemap-routes.generated.ts');
  }

  // Remove stale public copy so Vercel rewrite → /api/sitemap is not shadowed.
  const publicCopy = path.join(process.cwd(), 'public', 'sitemap.xml');
  if (fs.existsSync(publicCopy)) {
    fs.unlinkSync(publicCopy);
    console.log('Removed public/sitemap.xml (was shadowing /api/sitemap rewrite).');
  }

  console.log(
    `Wrote ${entries.length} URL groups (${LOCALES.length} locales + x-default) to ${out} using origin ${SITE_ORIGIN}`,
  );
  console.log(
    `Breakdown: static=${STATIC_PATHS.length} categories=${categoryRoutes.length} products=${productRoutes.length} blogs=${blogRoutes.length}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
