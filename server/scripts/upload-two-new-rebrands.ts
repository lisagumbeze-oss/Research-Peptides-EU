/**
 * Upload rebrand images for the two newly added products and set products.images.
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(url!, key!);

const PRODUCTS = [
  {
    slug: 'tesamorelin-13mg-ipamorelin-3mg-16mg-blend',
    local: path.resolve(
      'scratch/product-rebrand-samples/new-two/tesamorelin-13mg-ipamorelin-3mg-16mg-blend.png'
    ),
    storage: 'rebrand/tesamorelin-13mg-ipamorelin-3mg-16mg-blend.png',
  },
  {
    slug: 'glp-3-pen-40mg',
    local: path.resolve(
      'scratch/product-rebrand-samples/new-two/glp-3-pen-40mg-eu-rebrand.png'
    ),
    storage: 'rebrand/glp-3-pen-40mg.png',
  },
];

async function main() {
  // Prefer AI pen rebrand if present in cursor assets copy path
  const cursorPen = path.resolve(
    process.env.USERPROFILE || '',
    '.cursor/projects/d-PROJECTS-Home-Research-Peptides-EU/assets/glp-3-pen-40mg-eu-rebrand-v2.png'
  );
  const cursorPenFallback = path.resolve(
    process.env.USERPROFILE || '',
    '.cursor/projects/d-PROJECTS-Home-Research-Peptides-EU/assets/glp-3-pen-40mg-eu-rebrand.png'
  );
  const penSrc = fs.existsSync(cursorPen) ? cursorPen : cursorPenFallback;
  if (fs.existsSync(penSrc)) {
    const dest = PRODUCTS[1].local;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(penSrc, dest);
    console.log('Copied pen rebrand from', path.basename(penSrc));
  }

  const v = Date.now();
  for (const p of PRODUCTS) {
    if (!fs.existsSync(p.local)) {
      console.error('Missing file', p.local);
      continue;
    }
    const buffer = fs.readFileSync(p.local);
    const { error: upErr } = await supabase.storage.from('products').upload(p.storage, buffer, {
      contentType: 'image/png',
      upsert: true,
      cacheControl: '3600',
    });
    if (upErr) {
      console.error('Upload failed', p.slug, upErr.message);
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('products').getPublicUrl(p.storage);
    const busted = `${publicUrl}?v=${v}`;

    const { data, error } = await supabase
      .from('products')
      .update({ images: [busted] })
      .eq('slug', p.slug)
      .select('slug, title, images')
      .maybeSingle();

    if (error) {
      console.error('DB failed', p.slug, error.message);
      continue;
    }
    if (!data) {
      console.error('Not found', p.slug);
      continue;
    }
    console.log('Updated', data.title);
    console.log(' ', data.images?.[0]);
    console.log('  https://www.researchpeptide.eu/en/product/' + p.slug);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
