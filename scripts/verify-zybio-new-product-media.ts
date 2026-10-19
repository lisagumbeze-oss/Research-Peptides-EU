/**
 * Verify media enrichment for ZYBIO Phase-2 create products.
 *
 *   npx tsx scripts/verify-zybio-new-product-media.ts
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { CREATE_SLUGS, getEnrichmentEntry } from './data/zybio-new-product-enrichment-map.ts';

async function main() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials');
  const supabase = createClient(url, key);

  const { data, error } = await supabase
    .from('products')
    .select('slug,title,description,images,specifications')
    .in('slug', [...CREATE_SLUGS]);
  if (error) throw new Error(error.message);

  const bySlug = new Map((data || []).map((p) => [p.slug as string, p]));
  let fails = 0;
  let exact = 0;
  let adapted = 0;

  console.log(`Checking ${CREATE_SLUGS.length} create products...\n`);

  for (const slug of CREATE_SLUGS) {
    const entry = getEnrichmentEntry(slug);
    const row = bySlug.get(slug);
    const minLen = entry?.minDescLen ?? 400;

    if (entry?.matchType === 'exact') exact++;
    if (entry?.matchType === 'adapted') adapted++;

    if (!row) {
      console.log('FAIL', slug, 'missing product');
      fails++;
      continue;
    }

    const img = ((row.images as string[]) || [])[0] || '';
    const desc = String(row.description || '');
    const problems: string[] = [];

    if (!img) problems.push('no image');
    if (/unsplash\.com/i.test(img)) problems.push('unsplash image');
    if (!/storage\/v1\/object\/public\/products\/rebrand\//i.test(img) && !FORCE_ALLOW_NON_STORAGE) {
      // Prefer storage rebrand; allow researchpeptide.eu product-images/rebrand as secondary
      if (!/product-images\/rebrand\//i.test(img)) problems.push(`image not on rebrand storage (${img.slice(0, 60)})`);
    }
    if (desc.length < minLen) problems.push(`desc len ${desc.length} < ${minLen}`);
    if (/\bResearch Peptides UK\b/i.test(desc) || /researchpeptide\.co\.uk/i.test(desc)) {
      problems.push('UK remnants in description');
    }

    if (problems.length) {
      console.log('FAIL', slug, problems.join('; '));
      fails++;
    } else {
      console.log('OK  ', slug, `| ${entry?.matchType} | desc=${desc.length} | img=rebrand`);
    }
  }

  console.log(`\nExact=${exact} Adapted=${adapted} (map)`);
  console.log(fails === 0 ? 'Verify: PASS' : `Verify: FAIL (${fails})`);
  if (fails) process.exitCode = 1;
}

/** Allow verify during iteration if we temporarily keep CDN mirrors — keep false for final gate. */
const FORCE_ALLOW_NON_STORAGE = false;

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
