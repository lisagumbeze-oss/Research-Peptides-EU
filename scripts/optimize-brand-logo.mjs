/**
 * Sync & compress brand logo for UI, OG, favicon, and email.
 * Run: npm run logo:optimize
 *
 * Canonical source: src/assets/logo.png
 * Outputs:
 *   - src/assets/logo.webp          (UI / LCP)
 *   - public/brand_logo.png         (OG + schema + email)
 *   - public/brand_logo.webp
 *   - public/favicon.png            (512)
 *   - public/favicon.webp           (192)
 *   - public/apple-touch-icon.png   (180)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const srcPng = path.join(root, 'src/assets/logo.png');
const outWebp = path.join(root, 'src/assets/logo.webp');
const publicDir = path.join(root, 'public');
const brandPng = path.join(publicDir, 'brand_logo.png');
const brandWebp = path.join(publicDir, 'brand_logo.webp');
const faviconPng = path.join(publicDir, 'favicon.png');
const faviconWebp = path.join(publicDir, 'favicon.webp');
const appleTouch = path.join(publicDir, 'apple-touch-icon.png');

function kb(file) {
  return `${(fs.statSync(file).size / 1024).toFixed(1)} KB`;
}

async function main() {
  const sharp = (await import('sharp')).default;
  if (!fs.existsSync(srcPng)) {
    console.error('Missing src/assets/logo.png');
    process.exit(1);
  }

  const meta = await sharp(srcPng).metadata();
  console.log(`Source: ${srcPng} (${meta.width}×${meta.height}, ${kb(srcPng)})`);

  // Full-res PNG for OG / schema / email
  await sharp(srcPng)
    .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9, quality: 80 })
    .toFile(brandPng);
  console.log(`Wrote ${brandPng} (${kb(brandPng)})`);

  await sharp(srcPng)
    .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 90, effort: 6 })
    .toFile(brandWebp);
  console.log(`Wrote ${brandWebp} (${kb(brandWebp)})`);

  // UI mark (header / footer / login)
  await sharp(srcPng)
    .resize(256, 256, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 90, effort: 6 })
    .toFile(outWebp);
  console.log(`Wrote ${outWebp} (${kb(outWebp)})`);

  // Favicons
  await sharp(srcPng)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png({ compressionLevel: 9, quality: 80 })
    .toFile(faviconPng);
  console.log(`Wrote ${faviconPng} (${kb(faviconPng)})`);

  await sharp(srcPng)
    .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .webp({ quality: 92, effort: 6 })
    .toFile(faviconWebp);
  console.log(`Wrote ${faviconWebp} (${kb(faviconWebp)})`);

  await sharp(srcPng)
    .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png({ compressionLevel: 9, quality: 80 })
    .toFile(appleTouch);
  console.log(`Wrote ${appleTouch} (${kb(appleTouch)})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
