import 'dotenv/config';
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { tweakForEu } from './sync-uk-product-descriptions';

async function main() {
  const payloads = JSON.parse(
    fs.readFileSync('scratch/uk-eu-description-payloads.json', 'utf8'),
  ) as Record<string, string>;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials');
  const supabase = createClient(url, key);

  const remnant = Object.entries(payloads).filter(([, t]) => /\b[Uu][Kk]\b/.test(t));
  console.log('Fixing', remnant.length, 'slugs');

  for (const [slug, text] of remnant) {
    let fixed = text
      .replace(/buy Uk peptides/gi, 'buy EU peptides')
      .replace(/\bin uk peptides\b/gi, 'in EU peptides')
      .replace(/via Uk peptides/gi, 'via EU peptides')
      .replace(/\s+[Uu][Kk]\b/g, ' EU')
      .replace(/\bEU EU\b/g, 'EU');
    fixed = tweakForEu(fixed);
    payloads[slug] = fixed;
    const still = /\b[Uu][Kk]\b/.test(fixed);
    const { error } = await supabase
      .from('products')
      .update({ description: fixed })
      .eq('slug', slug);
    console.log(slug, error ? error.message : 'updated', 'stillUk=', still);
  }

  fs.writeFileSync(
    'scratch/uk-eu-description-payloads.json',
    JSON.stringify(payloads, null, 2),
  );
  const left = Object.entries(payloads).filter(([, t]) => /\b[Uu][Kk]\b/.test(t));
  console.log('remaining remnants', left.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
