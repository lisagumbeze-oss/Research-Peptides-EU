/**
 * Enrich ZYBIO Phase-2 create products with exact/adapted images + long EU descriptions.
 *
 *   npx tsx scripts/enrich-zybio-new-products.ts              # dry-run
 *   npx tsx scripts/enrich-zybio-new-products.ts --apply
 *   npx tsx scripts/enrich-zybio-new-products.ts --apply --force
 *   npx tsx scripts/enrich-zybio-new-products.ts --slugs=b7-33,humanin
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  ZYBIO_NEW_ENRICHMENT_MARKER,
  enrichmentMap,
  type EnrichmentEntry,
} from './data/zybio-new-product-enrichment-map.ts';
import { htmlToPlainText, tweakForEu } from './sync-uk-product-descriptions.ts';

const UA = 'ResearchPeptidesEUEnrichment/1.0 (internal catalogue tooling)';
const UK_STORE = 'https://researchpeptide.co.uk/wp-json/wc/store/v1/products';
const UK_WP = 'https://researchpeptide.co.uk/wp-json/wp/v2/product';
const APPLY = process.argv.includes('--apply');
const FORCE = process.argv.includes('--force');
const SLUG_FILTER = (() => {
  const raw = process.argv.find((a) => a.startsWith('--slugs='))?.slice('--slugs='.length);
  if (!raw) return null;
  return new Set(raw.split(',').map((s) => s.trim()).filter(Boolean));
})();

type ProductRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  images: string[] | null;
  specifications: string[] | null;
};

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'text/html,application/json' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.text();
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return (await res.json()) as T;
}

async function fetchUkDescriptionHtml(slug: string): Promise<string> {
  const store = await fetchJson<{ description?: string; name?: string }[]>(
    `${UK_STORE}?slug=${encodeURIComponent(slug)}`,
  );
  if (store[0]?.description?.trim()) return store[0].description!;
  const wp = await fetchJson<{ content?: { rendered?: string }; slug: string }[]>(
    `${UK_WP}?slug=${encodeURIComponent(slug)}`,
  );
  if (wp[0]?.content?.rendered?.trim()) return wp[0].content!.rendered!;
  throw new Error(`No UK description for ${slug}`);
}

async function fetchUkImage(slug: string): Promise<string> {
  const store = await fetchJson<{ images?: { src?: string }[] }[]>(
    `${UK_STORE}?slug=${encodeURIComponent(slug)}`,
  );
  const src = store[0]?.images?.[0]?.src?.replace(/^http:/, 'https:') || '';
  if (!src) throw new Error(`No UK image for ${slug}`);
  return src;
}

function extractOgImage(html: string): string | null {
  const patterns = [
    /property=["']og:image["']\s+content=["']([^"']+)["']/i,
    /content=["']([^"']+)["']\s+property=["']og:image["']/i,
    /rel=["']image_src["']\s+href=["']([^"']+)["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return m[1].replace(/^http:/, 'https:');
  }
  // WooCommerce product gallery fallback
  const m2 = html.match(
    /wp-content\/uploads\/[^"'\\]+\.(?:jpg|jpeg|png|webp)/i,
  );
  if (m2) {
    const pathPart = m2[0];
    if (pathPart.startsWith('http')) return pathPart;
    // Try absolute from common hosts later — return relative for caller to resolve
    return pathPart;
  }
  return null;
}

function extractPeerPlain(html: string): string {
  // Prefer main content chunks
  let chunk = html;
  const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0];
  if (main) chunk = main;
  else {
    const article = html.match(/<article[\s\S]*?<\/article>/i)?.[0];
    if (article) chunk = article;
  }
  let plain = htmlToPlainText(chunk);
  // Drop nav noise
  plain = plain
    .replace(/Dont Delay[\s\S]{0,80}/gi, '')
    .replace(/\(214\)[^\n]*/g, '')
    .replace(/support@purerawz\.co/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return plain;
}

function applyAdapt(plain: string, entry: EnrichmentEntry): string {
  let s = plain;
  const from = entry.adapt.renameFrom
    ? Array.isArray(entry.adapt.renameFrom)
      ? entry.adapt.renameFrom
      : [entry.adapt.renameFrom]
    : [];
  // Longest-first + placeholder avoids "Selank" → "NA-Selank" → "NA-NA-Selank"
  const renameTo = entry.adapt.renameTo || entry.title;
  const ph = `__RENAME_${entry.slug.toUpperCase().replace(/[^A-Z0-9]/g, '_')}__`;
  const sorted = [...from].filter(Boolean).sort((a, b) => b.length - a.length);
  for (const f of sorted) {
    const re = new RegExp(f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    s = s.replace(re, ph);
  }
  s = s.split(ph).join(renameTo);
  const bits: string[] = [];
  if (entry.adapt.extraPrefix) bits.push(entry.adapt.extraPrefix.trim());
  bits.push(s.trim());
  const notes: string[] = [];
  if (entry.adapt.formNote) notes.push(`Product format: ${entry.adapt.formNote}`);
  if (entry.adapt.strengthNote) notes.push(`Strength / pack: ${entry.adapt.strengthNote}`);
  if (notes.length) {
    bits.push('\n\nProduct Notes\n\n' + notes.map((n) => `• ${n}`).join('\n'));
  }
  bits.push(
    '\n\nImportant\n\nThis product is supplied strictly for scientific research and laboratory use and is not intended for human or veterinary consumption.',
  );
  return bits.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
}

async function resolveDescription(
  supabase: SupabaseClient,
  entry: EnrichmentEntry,
  cache: Map<string, string>,
): Promise<{ text: string; sourceLabel: string }> {
  const src = entry.descSource;

  const loadEu = async (slug: string) => {
    const key = `eu:${slug}`;
    if (cache.has(key)) return cache.get(key)!;
    const { data, error } = await supabase
      .from('products')
      .select('description')
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const d = String(data?.description || '').trim();
    if (!d) throw new Error(`Empty EU description for ${slug}`);
    cache.set(key, d);
    return d;
  };

  if (src.type === 'static') {
    return {
      text: applyAdapt(tweakForEu(src.text), entry),
      sourceLabel: 'static',
    };
  }

  if (src.type === 'eu-db') {
    const raw = await loadEu(src.slug);
    return { text: applyAdapt(tweakForEu(raw), entry), sourceLabel: `eu-db:${src.slug}` };
  }

  if (src.type === 'uk') {
    const key = `uk:${src.slug}`;
    let html = cache.get(key);
    if (!html) {
      html = await fetchUkDescriptionHtml(src.slug);
      cache.set(key, html);
    }
    const plain = tweakForEu(htmlToPlainText(html));
    return { text: applyAdapt(plain, entry), sourceLabel: `uk:${src.slug}` };
  }

  if (src.type === 'peer-url') {
    const key = `peer:${src.url}`;
    let plain = cache.get(key);
    if (!plain) {
      const html = await fetchText(src.url);
      plain = extractPeerPlain(html);
      cache.set(key, plain);
    }
    return { text: applyAdapt(tweakForEu(plain), entry), sourceLabel: `peer:${src.url}` };
  }

  // compose
  const parts: string[] = [];
  for (const slug of src.from) {
    try {
      parts.push(await loadEu(slug));
    } catch {
      // try UK same slug
      try {
        const html = await fetchUkDescriptionHtml(slug);
        parts.push(htmlToPlainText(html));
      } catch (e) {
        throw new Error(`compose: cannot load ${slug}: ${e}`);
      }
    }
  }
  const combined = parts
    .map((p, i) => `--- Source ${i + 1} ---\n\n${p}`)
    .join('\n\n');
  return {
    text: applyAdapt(tweakForEu(combined), entry),
    sourceLabel: `compose:${src.from.join('+')}`,
  };
}

async function resolveImageUrl(
  supabase: SupabaseClient,
  entry: EnrichmentEntry,
): Promise<{ url: string; sourceLabel: string }> {
  const src = entry.imageSource;
  if (src.type === 'direct') return { url: src.url, sourceLabel: 'direct' };

  if (src.type === 'uk') {
    return { url: await fetchUkImage(src.slug), sourceLabel: `uk:${src.slug}` };
  }

  if (src.type === 'eu-db') {
    const { data, error } = await supabase
      .from('products')
      .select('images')
      .eq('slug', src.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const url = ((data?.images as string[]) || [])[0] || '';
    if (!url) throw new Error(`No image on eu-db ${src.slug}`);
    if (/unsplash\.com/i.test(url)) throw new Error(`eu-db ${src.slug} still Unsplash`);
    return { url, sourceLabel: `eu-db:${src.slug}` };
  }

  // peer-url page → og:image
  const html = await fetchText(src.url);
  let img = extractOgImage(html);
  if (img && !/^https?:\/\//i.test(img)) {
    const base = new URL(src.url);
    img = `${base.origin}/${img.replace(/^\//, '')}`;
  }
  if (!img) throw new Error(`No og:image on ${src.url}`);
  return { url: img, sourceLabel: `peer:${src.url}` };
}

async function downloadBytes(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'image/*,*/*' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`download ${url} → ${res.status}`);
  const contentType = res.headers.get('content-type') || 'image/jpeg';
  const ab = await res.arrayBuffer();
  return { buffer: Buffer.from(ab), contentType };
}

function extFor(contentType: string, url: string): string {
  if (/png/i.test(contentType) || /\.png(\?|$)/i.test(url)) return 'png';
  if (/webp/i.test(contentType) || /\.webp(\?|$)/i.test(url)) return 'webp';
  return 'jpg';
}

function alreadyRebranded(images: string[] | null | undefined, slug: string): boolean {
  const img = images?.[0] || '';
  return (
    /\/storage\/v1\/object\/public\/products\/rebrand\//i.test(img) &&
    img.includes(`rebrand/${slug}.`)
  );
}

function mergeSpecs(
  existing: string[] | null | undefined,
  entry: EnrichmentEntry,
  sourceLabel: string,
  imageLabel: string,
): string[] {
  const base = (existing || []).filter(
    (s) => !s.startsWith(ZYBIO_NEW_ENRICHMENT_MARKER) && !s.startsWith('Enrichment '),
  );
  return [
    ZYBIO_NEW_ENRICHMENT_MARKER,
    `Enrichment matchType: ${entry.matchType}`,
    `Enrichment desc: ${sourceLabel}`,
    `Enrichment image: ${imageLabel}`,
    ...base,
  ];
}

async function main() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials');
  const supabase = createClient(url, key);

  const entries = enrichmentMap.filter((e) => !SLUG_FILTER || SLUG_FILTER.has(e.slug));
  console.log(`Enriching ${entries.length} products | mode=${APPLY ? 'APPLY' : 'DRY-RUN'} force=${FORCE}`);

  const { data: rows, error } = await supabase
    .from('products')
    .select('id,slug,title,description,images,specifications')
    .in(
      'slug',
      entries.map((e) => e.slug),
    );
  if (error) throw new Error(error.message);
  const bySlug = new Map((rows || []).map((r) => [r.slug as string, r as ProductRow]));

  const descCache = new Map<string, string>();
  const report: Record<string, unknown>[] = [];
  const mirrorDir = path.resolve('public/product-images/rebrand');
  const scratchDir = path.resolve('scratch/zybio-new-enrichment-images');
  ensureDir(mirrorDir);
  ensureDir(scratchDir);

  let ok = 0;
  let fail = 0;

  for (const entry of entries) {
    const row = bySlug.get(entry.slug);
    console.log(`\n=== ${entry.slug} (${entry.matchType}) ===`);
    if (!row) {
      console.log('FAIL: product not in DB');
      report.push({ slug: entry.slug, status: 'missing-product' });
      fail++;
      continue;
    }

    try {
      if (alreadyRebranded(row.images, entry.slug) && !FORCE) {
        console.log('SKIP image (already rebranded); will still refresh description unless --force-only-image');
      }

      const desc = await resolveDescription(supabase, entry, descCache);
      console.log(`desc source=${desc.sourceLabel} len=${desc.text.length}`);

      const img = await resolveImageUrl(supabase, entry);
      console.log(`image source=${img.sourceLabel} url=${img.url.slice(0, 90)}`);

      if (/unsplash\.com/i.test(img.url)) {
        throw new Error('Resolved image is still Unsplash — refusing');
      }

      const minLen = entry.minDescLen ?? 400;
      if (desc.text.length < minLen) {
        console.warn(`WARN: description shorter than ${minLen} (${desc.text.length})`);
      }

      const { buffer, contentType } = await downloadBytes(img.url);
      const ext = extFor(contentType, img.url);
      const storagePath = `rebrand/${entry.slug}.${ext === 'png' ? 'png' : ext === 'webp' ? 'webp' : 'jpg'}`;
      const localName = `${entry.slug}.${ext === 'png' ? 'png' : ext === 'webp' ? 'webp' : 'jpg'}`;
      fs.writeFileSync(path.join(scratchDir, localName), buffer);
      fs.writeFileSync(path.join(mirrorDir, localName), buffer);
      console.log(`downloaded ${buffer.length} bytes → ${localName}`);

      let publicUrl = '';
      if (APPLY) {
        const skipImage = alreadyRebranded(row.images, entry.slug) && !FORCE;
        if (!skipImage) {
          const { error: upErr } = await supabase.storage.from('products').upload(storagePath, buffer, {
            contentType: contentType.includes('image/') ? contentType : `image/${ext}`,
            upsert: true,
            cacheControl: '3600',
          });
          if (upErr) throw new Error(`upload: ${upErr.message}`);
          const {
            data: { publicUrl: pu },
          } = supabase.storage.from('products').getPublicUrl(storagePath);
          publicUrl = `${pu}?v=${Date.now()}`;
        } else {
          publicUrl = (row.images || [])[0];
        }

        const specs = mergeSpecs(row.specifications, entry, desc.sourceLabel, img.sourceLabel);
        const { error: updErr } = await supabase
          .from('products')
          .update({
            description: desc.text,
            images: [publicUrl],
            specifications: specs,
          })
          .eq('slug', entry.slug);
        if (updErr) throw new Error(`update: ${updErr.message}`);
        console.log('UPDATED', entry.slug);
      } else {
        console.log('dry-run preview:', desc.text.slice(0, 160).replace(/\n/g, ' / '));
      }

      report.push({
        slug: entry.slug,
        status: APPLY ? 'updated' : 'dry-run',
        matchType: entry.matchType,
        descSource: desc.sourceLabel,
        descLen: desc.text.length,
        imageSource: img.sourceLabel,
        imageUrl: img.url,
        storagePath,
      });
      ok++;
    } catch (e) {
      console.error('FAIL', entry.slug, e);
      report.push({
        slug: entry.slug,
        status: 'error',
        error: e instanceof Error ? e.message : String(e),
      });
      fail++;
    }
  }

  const out = path.resolve('scratch/zybio-new-enrichment-report.json');
  fs.writeFileSync(
    out,
    JSON.stringify({ at: new Date().toISOString(), apply: APPLY, ok, fail, report }, null, 2),
  );
  console.log(`\nDone ok=${ok} fail=${fail} → ${out}`);
  if (!APPLY) console.log('Dry-run only. Pass --apply to write.');
  if (fail) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
