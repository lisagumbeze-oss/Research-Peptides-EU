import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(url!, key!);

const primary =
  'https://cdpwpggnjdknryhkjccd.supabase.co/storage/v1/object/public/products/rebrand/cjc-1295-without-dac-eu-sample.png?v=' +
  Date.now();

const slugs = ['cjc-1295-no-dac-5mg', 'cjc-1295-without-dac'];

async function main() {
  for (const slug of slugs) {
    const { data, error } = await supabase
      .from('products')
      .update({ images: [primary] })
      .eq('slug', slug)
      .select('id, slug, title, images')
      .single();

    if (error) {
      console.error(slug, error.message);
      continue;
    }
    console.log(JSON.stringify(data, null, 2));
  }
}

main();
