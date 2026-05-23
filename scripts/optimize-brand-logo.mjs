/**
 * Compress brand logo for LCP — run: node scripts/optimize-brand-logo.mjs
 * Requires: npm install -D sharp (or npx will fetch on first run via dynamic import)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const srcPng = path.join(root, 'src/assets/logo.png');
const outWebp = path.join(root, 'src/assets/logo.webp');
const faviconPng = path.join(root, 'public/favicon.png');
const faviconWebp = path.join(root, 'public/favicon.webp');

async function main() {
  const sharp = (await import('sharp')).default;
  if (!fs.existsSync(srcPng)) {
    console.error('Missing src/assets/logo.png');
    process.exit(1);
  }

  await sharp(srcPng)
    .resize(256, 256, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 86, effort: 6 })
    .toFile(outWebp);

  const webpStat = fs.statSync(outWebp);
  console.log(`Wrote ${outWebp} (${(webpStat.size / 1024).toFixed(1)} KB)`);

  if (fs.existsSync(faviconPng)) {
    await sharp(faviconPng)
      .resize(192, 192, { fit: 'inside' })
      .webp({ quality: 90 })
      .toFile(faviconWebp);
    console.log(`Wrote ${faviconWebp}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
