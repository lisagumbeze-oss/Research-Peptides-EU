import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const outDir = path.resolve('scratch/product-rebrand-samples/source-thumbs');
fs.mkdirSync(outDir, { recursive: true });

async function main() {
  const { data, error } = await supabase
    .from('products')
    .select('id, slug, title, images')
    .order('title');
  if (error) throw error;

  // Sample a diverse set by title keywords + first N
  const keywords = [
    'pen',
    'tablet',
    'capsule',
    'water',
    'insulin',
    'bottle',
    'blend',
    '5mg',
    'HGH',
    'BPC',
  ];
  const picks: typeof data = [];
  for (const kw of keywords) {
    const hit = (data || []).find(
      (p) =>
        new RegExp(kw, 'i').test(p.title) &&
        !picks.some((x) => x.id === p.id) &&
        p.images?.[0]
    );
    if (hit) picks.push(hit);
  }
  // add a few random vials
  for (const p of data || []) {
    if (picks.length >= 12) break;
    if (!picks.some((x) => x.id === p.id) && p.images?.[0] && !String(p.images[0]).includes('/rebrand/')) {
      picks.push(p);
    }
  }

  const meta: any[] = [];
  for (const p of picks) {
    const url = String(p.images[0]).split('?')[0];
    const ext = path.extname(new URL(url).pathname) || '.png';
    const file = path.join(outDir, `${p.slug}${ext}`);
    const res = await fetch(url);
    if (!res.ok) {
      console.log('FAIL', p.slug, res.status);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(file, buf);
    const hash = createHash('md5').update(buf).digest('hex').slice(0, 10);
    console.log(p.slug, res.headers.get('content-type'), buf.length, hash);
    meta.push({ slug: p.slug, title: p.title, file, bytes: buf.length, hash, url });
  }
  fs.writeFileSync(path.join(outDir, 'sample-meta.json'), JSON.stringify(meta, null, 2));
}

main();
