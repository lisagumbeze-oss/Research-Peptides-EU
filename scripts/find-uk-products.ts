import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function main() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(url!, key!);
  const { data } = await supabase.from('products').select('slug,title').or(
    'title.ilike.%cjc%,title.ilike.%ipamorelin%,title.ilike.%bpc%,title.ilike.%tb500%,title.ilike.%tb-500%,title.ilike.%TB 5%,title.ilike.%hcg%,title.ilike.%glow%,title.ilike.%kpv%,title.ilike.%hospira%,title.ilike.%5-amino%,title.ilike.%1mq%,title.ilike.%semax%'
  );
  for (const row of (data || []).sort((a, b) => a.slug.localeCompare(b.slug))) {
    console.log(row.slug, '|', row.title);
  }
  console.log('count', (data || []).length);
}
main();
