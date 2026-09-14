/**
 * Upload local bulk-rebrand PNGs to Supabase Storage and set products.images
 * to a single primary URL each. Does NOT commit or push git.
 *
 * Usage (from repo root):
 *   npx tsx server/scripts/upload-bulk-rebrand.ts
 *   npx tsx server/scripts/upload-bulk-rebrand.ts --dry-run
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const dryRun = process.argv.includes('--dry-run');

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key);

const MANIFEST = path.resolve('scratch/product-rebrand-samples/bulk-local/manifest.json');
const OUT_DIR = path.resolve('scratch/product-rebrand-samples/bulk-local');
const REPORT = path.resolve('scratch/product-rebrand-samples/bulk-upload-report.json');

type ManifestItem = {
  id?: string;
  slug: string;
  title: string;
  file: string;
};

async function main() {
  if (!fs.existsSync(MANIFEST)) {
    console.error('Missing manifest:', MANIFEST);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) as {
    count: number;
    items: ManifestItem[];
  };

  console.log(`Uploading ${manifest.items.length} products${dryRun ? ' (dry-run)' : ''}...`);

  const results: Array<Record<string, unknown>> = [];
  let ok = 0;
  let fail = 0;

  for (let i = 0; i < manifest.items.length; i++) {
    const item = manifest.items[i];
    const localPath = path.join(OUT_DIR, item.file);
    const storagePath = `rebrand/${item.slug}.png`;

    try {
      if (!fs.existsSync(localPath)) {
        throw new Error(`Missing local file: ${localPath}`);
      }

      if (!dryRun) {
        const buffer = fs.readFileSync(localPath);
        const { error: upErr } = await supabase.storage.from('products').upload(storagePath, buffer, {
          contentType: 'image/png',
          upsert: true,
          cacheControl: '3600',
        });
        if (upErr) throw new Error(`upload: ${upErr.message}`);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('products').getPublicUrl(storagePath);
      const busted = `${publicUrl}?v=${Date.now()}`;

      if (!dryRun) {
        let q = supabase.from('products').update({ images: [busted] });
        q = item.id ? q.eq('id', item.id) : q.eq('slug', item.slug);
        const { data: updated, error: updErr } = await q.select('id, slug').maybeSingle();
        if (updErr) throw new Error(`db: ${updErr.message}`);
        if (!updated) throw new Error(`product not found for slug ${item.slug}`);
      }

      ok++;
      results.push({ slug: item.slug, status: 'ok', url: busted });
    } catch (e: any) {
      fail++;
      results.push({ slug: item.slug, status: 'error', error: e?.message || String(e) });
      console.error(`[FAIL] ${item.slug}:`, e?.message || e);
    }

    if ((i + 1) % 20 === 0 || i + 1 === manifest.items.length) {
      console.log(`[${i + 1}/${manifest.items.length}] ok=${ok} fail=${fail}`);
    }
  }

  const report = {
    finishedAt: new Date().toISOString(),
    dryRun,
    ok,
    fail,
    results,
  };
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2));
  console.log(`\nDone. ok=${ok} fail=${fail}`);
  console.log('Report:', REPORT);
  if (!dryRun) {
    console.log('Live site should now serve the rebranded primary images (hard-refresh).');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
