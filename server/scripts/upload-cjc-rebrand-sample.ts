/**
 * Upload rebranded CJC sample image to Supabase Storage and set products.images
 * for live preview approval.
 *
 * Usage (from project root):
 *   npx tsx server/scripts/upload-cjc-rebrand-sample.ts
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('Using URL:', url);
console.log('Key prefix:', key.slice(0, 8), 'len:', key.length);

const supabase = createClient(url, key);

const IMAGE_PATH = path.resolve(
  'scratch/product-rebrand-samples/cjc-1295-eu-sample-with-flag-v2.png'
);
const STORAGE_PATH = 'rebrand/cjc-1295-without-dac-eu-sample.png';

async function main() {
  if (!fs.existsSync(IMAGE_PATH)) {
    console.error('Image not found:', IMAGE_PATH);
    process.exit(1);
  }

  const { data: products, error: findErr } = await supabase
    .from('products')
    .select('id, slug, title, images')
    .or('slug.ilike.%cjc%,title.ilike.%CJC%');

  if (findErr) {
    console.error('Find error:', findErr.message);
    process.exit(1);
  }

  console.log('CJC-related products:');
  for (const p of products || []) {
    console.log(`  - ${p.slug} | ${p.title}`);
  }

  const target =
    (products || []).find((p) => p.slug === 'cjc-1295-without-dac') ||
    (products || []).find(
      (p) =>
        /cjc/i.test(p.slug || '') &&
        /(without.?dac|no.?dac)/i.test(`${p.slug} ${p.title}`) &&
        !/ipamorelin|blend/i.test(`${p.slug} ${p.title}`)
    );

  if (!target) {
    console.error('No CJC-1295 without DAC product found');
    process.exit(1);
  }

  console.log('\nUpdating product:', target.id, target.slug, target.title);

  const buffer = fs.readFileSync(IMAGE_PATH);
  const { error: upErr } = await supabase.storage.from('products').upload(STORAGE_PATH, buffer, {
    contentType: 'image/png',
    upsert: true,
    cacheControl: '60',
  });

  if (upErr) {
    console.error('Upload error:', upErr.message);
    process.exit(1);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('products').getPublicUrl(STORAGE_PATH);

  const publicUrlBusted = `${publicUrl}?v=${Date.now()}`;
  console.log('Public URL:', publicUrlBusted);

  const prev = Array.isArray(target.images) ? target.images : [];
  const rest = prev.filter(
    (u) => u && !String(u).includes('cjc-1295-without-dac-eu-sample')
  );
  const nextImages = [publicUrlBusted, ...rest].slice(0, 4);

  const { error: updErr } = await supabase
    .from('products')
    .update({ images: nextImages })
    .eq('id', target.id);

  if (updErr) {
    console.error('DB update error:', updErr.message);
    process.exit(1);
  }

  const { data: verified } = await supabase
    .from('products')
    .select('id, slug, title, images')
    .eq('id', target.id)
    .single();

  console.log('\nDone. Verified:');
  console.log(JSON.stringify(verified, null, 2));
  console.log(`\nLive PDP: https://www.researchpeptide.eu/product/${target.slug}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
