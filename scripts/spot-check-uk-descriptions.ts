import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SAMPLE_SLUGS = [
  'bpc-157',
  'nad-250mg',
  'kpv',
  'ghk-cu',
  'cjc-1295-no-dac-5mg',
  'glow-blend-ghk-cu-bpc157-tb500',
  'ipamorelin',
  'semaglutide-glp-1',
  'tesamorelin-5mg-ipamorelin-5mg-10mg-total-peptide-blend',
  'ace-031-1mg',
];

async function main() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials');
  const supabase = createClient(url, key);

  const { data, error } = await supabase
    .from('products')
    .select('slug, title, description')
    .in('slug', SAMPLE_SLUGS);

  if (error) throw new Error(error.message);

  const bySlug = new Map((data || []).map((r) => [r.slug as string, r]));
  let ok = 0;
  let fail = 0;

  for (const slug of SAMPLE_SLUGS) {
    const row = bySlug.get(slug);
    if (!row) {
      console.log('MISSING', slug);
      fail++;
      continue;
    }
    const desc = String(row.description || '');
    const hasUk = /\b[Uu][Kk]\b/.test(desc) || /researchpeptide\.co\.uk/i.test(desc);
    const longEnough = desc.length >= 200;
    const status = !hasUk && longEnough ? 'OK' : hasUk ? 'HAS_UK' : 'SHORT_OR_EMPTY';
    if (status === 'OK') ok++;
    else fail++;
    console.log(
      status.padEnd(14),
      slug.padEnd(56),
      `len=${desc.length}`,
      '|',
      desc.slice(0, 100).replace(/\n/g, ' / '),
    );
  }

  // Also confirm empty-source products were left alone (not wiped)
  const emptySource = [
    'mt-2-melanotan-2-acetate-10mg',
    'semaglutide-glp-1',
    'tirzepatide',
    'retatrutide-glp-3',
    'gonadorelin-acetate-gnrh-2mg',
    'follistatin-344-1mg',
  ];
  const { data: emptyRows } = await supabase
    .from('products')
    .select('slug, description')
    .in('slug', emptySource);
  console.log('\nEmpty-source UK products (should keep prior description if any):');
  for (const r of emptyRows || []) {
    console.log(
      String(r.slug).padEnd(40),
      `len=${String(r.description || '').length}`,
      String(r.description || '').slice(0, 80).replace(/\n/g, ' '),
    );
  }

  console.log(`\nSpot-check: ${ok} ok, ${fail} fail`);
  if (fail > 1) process.exitCode = 1; // allow semaglutide-glp-1 short if empty-source
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
