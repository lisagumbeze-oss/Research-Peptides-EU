/**
 * Also set the exact "CJC 1295 NO DAC 5MG" product primary image
 * to the same rebrand sample (live preview).
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(url!, key!);

const publicUrl =
  'https://cdpwpggnjdknryhkjccd.supabase.co/storage/v1/object/public/products/rebrand/cjc-1295-without-dac-eu-sample.png';
const busted = `${publicUrl}?v=${Date.now()}`;

const SLUGS = ['cjc-1295-no-dac-5mg', 'cjc-1295-without-dac'];

async function main() {
  for (const slug of SLUGS) {
    const { data: product, error } = await supabase
      .from('products')
      .select('id, slug, title, images')
      .eq('slug', slug)
      .single();

    if (error || !product) {
      console.error('Skip', slug, error?.message);
      continue;
    }

    const prev = Array.isArray(product.images) ? product.images : [];
    const rest = prev.filter((u) => u && !String(u).includes('cjc-1295-without-dac-eu-sample'));
    const nextImages = [busted, ...rest].slice(0, 4);

    const { error: updErr } = await supabase
      .from('products')
      .update({ images: nextImages })
      .eq('id', product.id);

    if (updErr) {
      console.error('Update failed', slug, updErr.message);
      continue;
    }

    console.log('Updated', product.title, '→', nextImages[0]);
    console.log('  https://www.researchpeptide.eu/product/' + slug);
  }
}

main();
