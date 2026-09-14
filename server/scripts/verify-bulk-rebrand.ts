import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data, error, count } = await supabase
    .from('products')
    .select('slug, title, images', { count: 'exact' });
  if (error) throw error;

  const rows = data || [];
  const rebranded = rows.filter((p) => String(p.images?.[0] || '').includes('/rebrand/'));
  const multi = rows.filter((p) => (p.images || []).length > 1);
  const missing = rows.filter((p) => !String(p.images?.[0] || '').includes('/rebrand/'));

  console.log('total', count ?? rows.length);
  console.log('rebranded_primary', rebranded.length);
  console.log('still_multi_image', multi.length);
  console.log('not_rebranded', missing.length);
  if (missing.length) {
    for (const m of missing) console.log(' -', m.slug, m.images?.[0]);
  }

  // spot checks
  for (const slug of ['bpc-157', 'aod-9604-5mg', 'cjc-1295-no-dac-5mg', 'semaglutide']) {
    const p = rows.find((r) => r.slug === slug);
    console.log('spot', slug, p?.images?.[0]?.slice(0, 100));
  }
}

main();
