import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envRaw = fs.readFileSync('.env', 'utf-8');
const getEnv = (name: string) => {
  const m = envRaw.match(new RegExp(`^${name}="?([^"\\n\\r]+)"?$`, 'm'));
  return m?.[1] || '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const { data: firstOrder, error: readError } = await supabase
    .from('orders')
    .select('id,status')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (readError) {
    console.error('READ ERROR', readError);
    return;
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({ status: firstOrder.status })
    .eq('id', firstOrder.id);

  console.log('ORDER', firstOrder);
  console.log('UPDATE ERROR', updateError);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
