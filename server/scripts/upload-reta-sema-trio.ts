/**
 * Upload Retatrutide/Semaglutide lifestyle trio rebrand and attach to matching products.
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(url!, key!);

const LOCAL = path.resolve(
  'scratch/product-rebrand-samples/retatrutide-semaglutide-trio-eu-rebrand.png'
);
const STORAGE = 'rebrand/retatrutide-semaglutide-trio-eu.png';

const SLUGS = [
  'retatrutide',
  'retatrutide-glp-3',
  'semaglutide',
  'semaglutide-glp-1',
];

async function main() {
  if (!fs.existsSync(LOCAL)) {
    console.error('Missing', LOCAL);
    process.exit(1);
  }

  const buffer = fs.readFileSync(LOCAL);
  const { error: upErr } = await supabase.storage.from('products').upload(STORAGE, buffer, {
    contentType: 'image/png',
    upsert: true,
    cacheControl: '3600',
  });
  if (upErr) throw upErr;

  const {
    data: { publicUrl },
  } = supabase.storage.from('products').getPublicUrl(STORAGE);
  const busted = `${publicUrl}?v=${Date.now()}`;
  console.log('Uploaded', busted);

  for (const slug of SLUGS) {
    const { data, error } = await supabase
      .from('products')
      .update({ images: [busted] })
      .eq('slug', slug)
      .select('id, slug, title, images')
      .maybeSingle();

    if (error) {
      console.error(slug, error.message);
      continue;
    }
    if (!data) {
      console.error('not found', slug);
      continue;
    }
    console.log('Updated', data.title, '->', data.images?.[0]);
    console.log('  https://www.researchpeptide.eu/product/' + slug);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
