import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data, error, count } = await supabase
    .from('products')
    .select('id, slug, title, images', { count: 'exact' })
    .order('title');

  if (error) throw error;

  const rows = (data || []).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    imageCount: (p.images || []).length,
    primary: p.images?.[0] || null,
    alreadyRebranded: String(p.images?.[0] || '').includes('/rebrand/'),
  }));

  const uniqueUrls = new Set(rows.map((r) => (r.primary || '').split('?')[0]).filter(Boolean));

  console.log('total_products', count ?? rows.length);
  console.log('unique_primary_urls', uniqueUrls.size);
  console.log('already_rebranded', rows.filter((r) => r.alreadyRebranded).length);

  fs.writeFileSync(
    'scratch/product-rebrand-samples/catalog-inventory.json',
    JSON.stringify({ generatedAt: new Date().toISOString(), rows }, null, 2)
  );
  console.log('wrote scratch/product-rebrand-samples/catalog-inventory.json');

  for (const r of rows) {
    console.log(
      `${r.alreadyRebranded ? '[R]' : '[ ]'} ${r.slug} | ${r.title} | imgs=${r.imageCount}`
    );
  }
}

main();
