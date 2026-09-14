/**
 * Restore Retatrutide/Semaglutide product images to individual vial rebrands
 * (undo accidental trio assignment).
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(url!, key!);

const SLUGS = [
  'retatrutide',
  'retatrutide-glp-3',
  'semaglutide',
  'semaglutide-glp-1',
];

async function main() {
  const v = Date.now();
  for (const slug of SLUGS) {
    const storagePath = `rebrand/${slug}.png`;
    const {
      data: { publicUrl },
    } = supabase.storage.from('products').getPublicUrl(storagePath);
    const busted = `${publicUrl}?v=${v}`;

    const { data, error } = await supabase
      .from('products')
      .update({ images: [busted] })
      .eq('slug', slug)
      .select('slug, title, images')
      .maybeSingle();

    if (error) {
      console.error(slug, error.message);
      continue;
    }
    console.log('Restored', data?.title, '->', data?.images?.[0]);
  }
}

main();
