import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing database URL / Key');
  process.exit(1);
}

const supabase = createClient(url, key);

const SLUG = 'tesamorelin-13mg-ipamorelin-3mg-16mg-blend';
const LOCAL_IMAGE = path.resolve('scratch/product-rebrand-samples/tesamorelin-13mg-ipamorelin-3mg-16mg-blend-rebranded.png');
const STORAGE_PATH = `rebrand/${SLUG}.png`;

async function main() {
  if (!fs.existsSync(LOCAL_IMAGE)) {
    console.error('Missing local file:', LOCAL_IMAGE);
    process.exit(1);
  }

  console.log('Uploading rebranded image to storage...');
  const buffer = fs.readFileSync(LOCAL_IMAGE);
  const { error: upErr } = await supabase.storage.from('products').upload(STORAGE_PATH, buffer, {
    contentType: 'image/png',
    upsert: true,
    cacheControl: '3600',
  });

  if (upErr) {
    console.error('Storage upload failed:', upErr.message);
    process.exit(1);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('products').getPublicUrl(STORAGE_PATH);
  const cacheBustedUrl = `${publicUrl}?v=${Date.now()}`;

  console.log('Updating database record for product:', SLUG);
  console.log('New image URL:', cacheBustedUrl);

  const { data, error } = await supabase
    .from('products')
    .update({ images: [cacheBustedUrl] })
    .eq('slug', SLUG)
    .select('id, title, slug, images')
    .single();

  if (error) {
    console.error('Database update failed:', error.message);
    process.exit(1);
  }

  console.log('Successfully updated product record in database!');
  console.log('Product:', data.title);
  console.log('Image:', data.images?.[0]);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
