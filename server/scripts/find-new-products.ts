import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const s = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data, error } = await s
    .from('products')
    .select('id,slug,title,images,created_at')
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw error;

  for (const p of data || []) {
    const img = String(p.images?.[0] || '');
    const rebranded = img.includes('/rebrand/');
    console.log(`${rebranded ? '[R]' : '[ ]'} ${p.created_at} | ${p.slug} | ${p.title}`);
    console.log(`    ${img.slice(0, 140)}`);
  }

  console.log('--- tesamorelin / ipamorelin ---');
  const { data: tesa } = await s
    .from('products')
    .select('id,slug,title,images')
    .or(
      'slug.ilike.%tesamorelin%,slug.ilike.%ipamorelin%,title.ilike.%Tesamorelin%,title.ilike.%Ipamorelin%'
    );
  for (const p of tesa || []) {
    console.log(
      p.slug,
      '|',
      p.title,
      '|',
      String(p.images?.[0] || '').includes('/rebrand/')
    );
  }
}

main();
