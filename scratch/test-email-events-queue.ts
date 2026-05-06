import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envRaw = fs.readFileSync('.env', 'utf-8');
const getEnv = (name: string) => {
  const m = envRaw.match(new RegExp(`^${name}="?([^"\\n\\r]+)"?$`, 'm'));
  return m?.[1] || '';
};

const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('VITE_SUPABASE_ANON_KEY'));

async function main() {
  const testKey = `contact:test:${Date.now()}`;
  const { error: insertErr } = await supabase.from('email_events').insert([
    {
      event_type: 'contact_submitted',
      idempotency_key: testKey,
      payload: {
        fullName: 'Queue Test',
        email: 'queue-test@example.com',
        subject: 'Queue test',
        message: 'Queue insert smoke test'
      }
    }
  ]);
  if (insertErr) throw insertErr;

  const { data, error: readErr } = await supabase
    .from('email_events')
    .select('id,event_type,status,created_at')
    .eq('idempotency_key', testKey)
    .single();
  if (readErr) throw readErr;

  console.log('Inserted queue event:', data);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
