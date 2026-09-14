/**
 * Smoke-check prerendered HTML in dist/ (run after npm run prerender).
 *
 *   npm run prerender:verify
 */
import fs from 'fs';
import path from 'path';

const dist = path.join(process.cwd(), 'dist');
const required = [
  'en/index.html',
  'en/shop/index.html',
  'en/faq/index.html',
  'en/about-us/index.html',
  'en/contact/index.html',
  'en/peptide-guide/index.html',
  'nl/index.html',
  'de/shop/index.html',
];

let failed = 0;

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    failed += 1;
  } else {
    console.log(`OK: ${msg}`);
  }
}

assert(fs.existsSync(path.join(dist, 'index.html')), 'SPA shell dist/index.html exists');

for (const rel of required) {
  const full = path.join(dist, rel);
  assert(fs.existsSync(full), `${rel} exists`);
  if (!fs.existsSync(full)) continue;
  const html = fs.readFileSync(full, 'utf8');
  assert(html.includes('data-rp-prerender="1"'), `${rel} has prerender body`);
  assert(html.includes('application/ld+json'), `${rel} has JSON-LD`);
  assert(html.includes('rel="canonical"'), `${rel} has canonical`);
  assert(/<h1>[^<]+<\/h1>/.test(html), `${rel} has H1`);
  assert(html.includes('id="root"'), `${rel} keeps #root for SPA boot`);
}

// Product sample if any products were prerendered
const productDir = path.join(dist, 'en', 'product');
if (fs.existsSync(productDir)) {
  const slugs = fs.readdirSync(productDir).filter((name) => {
    return fs.existsSync(path.join(productDir, name, 'index.html'));
  });
  assert(slugs.length > 0, `en/product/* prerendered (${slugs.length} slugs)`);
  if (slugs.length > 0) {
    const sample = fs.readFileSync(path.join(productDir, slugs[0], 'index.html'), 'utf8');
    assert(sample.includes('"@type":"Product"') || sample.includes('"@type": "Product"'), 'product JSON-LD Product type');
    assert(sample.includes(slugs[0]) || sample.includes('<h1>'), 'product page has content');
  }
} else {
  console.warn('WARN: no en/product/* — products skipped (missing Supabase credentials at build time?)');
}

const manifestPath = path.join(dist, 'prerender-manifest.json');
assert(fs.existsSync(manifestPath), 'prerender-manifest.json exists');

if (failed > 0) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log('\nAll prerender checks passed');
