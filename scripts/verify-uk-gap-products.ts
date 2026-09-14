import 'dotenv/config';
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

async function main() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials');
  const supabase = createClient(url, key);

  const slugs = [
    'tesamorelin-13mg-ipamorelin-3mg-16mg-blend',
    'glp-3-pen-40mg',
  ];

  const { data, error } = await supabase
    .from('products')
    .select('slug, title, price, currency, inventory, images, description, categories')
    .in('slug', slugs);
  if (error) throw new Error(error.message);

  let ok = 0;
  for (const slug of slugs) {
    const row = (data || []).find((r) => r.slug === slug);
    if (!row) {
      console.log('MISSING', slug);
      continue;
    }
    const desc = String(row.description || '');
    const hasUk = /\b[Uu][Kk]\b/.test(desc) || /researchpeptide\.co\.uk/i.test(desc);
    const images = (row.images as string[]) || [];
    const status =
      !hasUk && desc.length >= 200 && Number(row.price) > 0 && images.length > 0
        ? 'OK'
        : 'FAIL';
    if (status === 'OK') ok++;
    console.log(
      status,
      slug,
      `| €${row.price}`,
      `| imgs=${images.length}`,
      `| desc=${desc.length}`,
      `| cats=${JSON.stringify(row.categories)}`,
    );
    console.log(' ', desc.slice(0, 140).replace(/\n/g, ' / '));
  }

  // Refresh mapping gaps → matched
  const mapPath = 'scratch/uk-eu-description-mapping.json';
  if (fs.existsSync(mapPath)) {
    const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
    map.gaps = [];
    map.matched = (map.mapping || []).length;
    for (const m of map.mapping || []) {
      if (slugs.includes(m.ukSlug)) {
        m.status = 'matched';
        m.ourSlug = m.ukSlug;
        m.ourTitle =
          (data || []).find((r) => r.slug === m.ukSlug)?.title || m.ukName;
      }
    }
    map.updatedAt = new Date().toISOString();
    map.note = 'Gap products added via scripts/add-uk-gap-products.ts';
    fs.writeFileSync(mapPath, JSON.stringify(map, null, 2));
    console.log('\nUpdated', mapPath);
  }

  console.log(`\nVerify: ${ok}/${slugs.length} ok`);
  if (ok !== slugs.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
