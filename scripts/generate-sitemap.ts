/**
 * Writes public/sitemap.xml with locale hreflang alternates (+ product URLs from Supabase).
 *
 *   npm run sitemap:generate
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

async function productPaths(): Promise<string[]> {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn('Skipping product URLs (no Supabase credentials).');
    return [];
  }
  const supabase = createClient(url, key);
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

async function blogPaths(): Promise<string[]> {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return [];
  const supabase = createClient(url, key);
  const { data, error } = await supabase.from('blog_posts').select('id').limit(500);
  if (error) return [];
  return (data ?? []).map((row) => `/blog/${row.id}`);
}

async function main() {
  const productRoutes = await productPaths();
  const blogRoutes = await blogPaths();
  const entries: string[] = [];

  for (const p of STATIC_PATHS) {
    const priority = p === '/' ? '1.0' : p === '/shop' ? '0.9' : '0.7';
    const changefreq = p === '/' || p === '/shop' ? 'daily' : 'weekly';
    entries.push(urlEntry(p, priority, changefreq));
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

  const out = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(out, xml, 'utf8');
  console.log(
    `Wrote ${entries.length} URL groups (${LOCALES.length} locales + x-default) to ${out} using origin ${SITE_ORIGIN}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
