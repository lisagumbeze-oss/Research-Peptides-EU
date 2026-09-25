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

const SLUG = 'glp-3-pen-40mg';
const LOCAL_PEN_IMAGE = path.resolve('scratch/product-rebrand-samples/rebranded-glp-3-pen-40mg.jpg');
const LOCAL_BOX_IMAGE = path.resolve('scratch/product-rebrand-samples/rebranded-glp-3-pen-box-40mg.jpg');

const STORAGE_PEN_PATH = `rebrand/${SLUG}.jpg`;
const STORAGE_BOX_PATH = `rebrand/${SLUG}-box.jpg`;

async function main() {
  if (!fs.existsSync(LOCAL_PEN_IMAGE)) {
    console.error('Missing pen image:', LOCAL_PEN_IMAGE);
    process.exit(1);
  }

  console.log('Uploading rebranded GLP-3 Pen image to storage...');
  const penBuffer = fs.readFileSync(LOCAL_PEN_IMAGE);
  const { error: penUpErr } = await supabase.storage.from('products').upload(STORAGE_PEN_PATH, penBuffer, {
    contentType: 'image/jpeg',
    upsert: true,
    cacheControl: '3600',
  });

  if (penUpErr) {
    console.error('Pen storage upload failed:', penUpErr.message);
    process.exit(1);
  }

  const {
    data: { publicUrl: penPublicUrl },
  } = supabase.storage.from('products').getPublicUrl(STORAGE_PEN_PATH);
  const cacheBustedPenUrl = `${penPublicUrl}?v=${Date.now()}`;

  let imagesList = [cacheBustedPenUrl];

  if (fs.existsSync(LOCAL_BOX_IMAGE)) {
    console.log('Uploading rebranded GLP-3 Box image to storage...');
    const boxBuffer = fs.readFileSync(LOCAL_BOX_IMAGE);
    const { error: boxUpErr } = await supabase.storage.from('products').upload(STORAGE_BOX_PATH, boxBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
      cacheControl: '3600',
    });

    if (!boxUpErr) {
      const {
        data: { publicUrl: boxPublicUrl },
      } = supabase.storage.from('products').getPublicUrl(STORAGE_BOX_PATH);
      imagesList.push(`${boxPublicUrl}?v=${Date.now()}`);
    }
  }

  console.log('Updating database record for product:', SLUG);
  console.log('New image URLs:', imagesList);

  const { data, error } = await supabase
    .from('products')
    .update({ images: imagesList })
    .eq('slug', SLUG)
    .select('id, title, slug, images')
    .single();

  if (error) {
    console.error('Database update failed:', error.message);
    process.exit(1);
  }

  console.log('Successfully updated GLP-3 Pen product record in database!');
  console.log('Product:', data.title);
  console.log('Images:', data.images);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
