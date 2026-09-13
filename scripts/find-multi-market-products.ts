import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function main() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url!, key);
  const { data } = await supabase
    .from('products')
    .select('slug,title')
    .or(
      'title.ilike.%hgh%,title.ilike.%176%,title.ilike.%hexarelin%,title.ilike.%glutathione%,title.ilike.%peg%,title.ilike.%mgf%,title.ilike.%gonadorelin%,title.ilike.%aicar%,title.ilike.%fragment%'
    );
  for (const row of (data || []).sort((a, b) => a.slug.localeCompare(b.slug))) {
    console.log(row.slug, '|', row.title);
  }
  console.log('count', (data || []).length);
}
main();
