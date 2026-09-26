/**
 * Restore original GLP-3 Pen product images (do not edit / re-composite).
 * Points the product at the existing pen JPG (+ box) that predate the vial bulk overwrite.
 *
 *   npx tsx scripts/restore-glp3-pen-images.ts
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key);
const SLUG = 'glp-3-pen-40mg';
const PEN_PATH = `rebrand/${SLUG}.jpg`;
const BOX_PATH = `rebrand/${SLUG}-box.jpg`;

async function main() {
  const {
    data: { publicUrl: penUrl },
  } = supabase.storage.from('products').getPublicUrl(PEN_PATH);
  const {
    data: { publicUrl: boxUrl },
  } = supabase.storage.from('products').getPublicUrl(BOX_PATH);

  const v = Date.now();
  const images = [`${penUrl}?v=${v}`, `${boxUrl}?v=${v}`];

  // Confirm objects exist (HEAD via download of 1 byte not available — list check)
  const { data: files, error: listErr } = await supabase.storage.from('products').list('rebrand', {
    search: SLUG,
    limit: 20,
  });
  if (listErr) throw listErr;
  const names = new Set((files || []).map((f) => f.name));
  if (!names.has(`${SLUG}.jpg`)) {
    console.error('Missing original pen image in storage:', PEN_PATH);
    process.exit(1);
  }
  if (!names.has(`${SLUG}-box.jpg`)) {
    console.warn('Box JPG missing — restoring pen primary only');
    images.length = 1;
  }

  const { data, error } = await supabase
    .from('products')
    .update({ images })
    .eq('slug', SLUG)
    .select('id, slug, title, images')
    .single();

  if (error) {
    console.error('DB update failed:', error.message);
    process.exit(1);
  }

  console.log('Restored original images (unedited) for', data.title);
  for (const img of data.images || []) console.log(' ', img);
  console.log('https://www.researchpeptide.eu/en/product/' + SLUG);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
