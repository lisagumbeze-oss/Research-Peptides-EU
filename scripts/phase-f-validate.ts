/**
 * Phase F validation — prerender content + static mobile chrome invariants.
 * Run after build: npx tsx scripts/phase-f-validate.ts
 */
import fs from 'fs';
import path from 'path';

const dist = path.join(process.cwd(), 'dist');
let failed = 0;

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    failed += 1;
  } else {
    console.log(`OK: ${msg}`);
  }
}

function read(rel: string) {
  return fs.readFileSync(path.join(dist, rel), 'utf8');
}

assert(fs.existsSync(path.join(dist, 'index.html')), 'SPA shell exists');

const home = read('en/index.html');
assert(home.includes('<h1>'), 'home has H1');
assert(home.includes('"@type":"Organization"') || home.includes('"@type": "Organization"'), 'home Organization');
assert(home.includes('"@type":"LocalBusiness"') || home.includes('"@type": "LocalBusiness"'), 'home LocalBusiness');
assert(home.includes('potentialAction') || home.includes('SearchAction'), 'home SearchAction/WebSite');
assert(home.includes('og:image'), 'home og:image');
assert(home.includes('brand_logo.png'), 'home default brand logo OG');

const shop = read('en/shop/index.html');
assert(shop.includes('ItemList') || shop.includes('"@type":"ItemList"'), 'shop ItemList');

const catDir = path.join(dist, 'en', 'category');
assert(fs.existsSync(catDir), 'category prerender dir');
const catSlug = fs.existsSync(catDir) ? fs.readdirSync(catDir)[0] : '';
if (catSlug) {
  const cat = read(`en/category/${catSlug}/index.html`);
  assert(cat.includes('<h1>'), `category ${catSlug} H1`);
  assert(cat.includes('application/ld+json'), `category ${catSlug} JSON-LD`);
}

const prodDir = path.join(dist, 'en', 'product');
const prodSlug = fs.readdirSync(prodDir)[0];
const product = read(`en/product/${prodSlug}/index.html`);
assert(product.includes('"@type":"Product"') || product.includes('"@type": "Product"'), `product ${prodSlug} Product schema`);
assert(/<h1>[^<]+<\/h1>/.test(product), `product ${prodSlug} H1`);
assert(product.includes('og:image'), `product ${prodSlug} og:image`);

// Source invariants for mobile Trust Surface
const css = fs.readFileSync(path.join(process.cwd(), 'src/index.css'), 'utf8');
assert(css.includes('.pb-safe'), 'safe-area .pb-safe defined');
assert(css.includes('bottom-above-mobile-nav'), 'bottom-above-mobile-nav utility');
assert(css.includes('@fontsource-variable/dm-sans') || css.includes('DM Sans Variable'), 'self-hosted fonts');

const bottomNav = fs.readFileSync(path.join(process.cwd(), 'src/components/MobileBottomNav.tsx'), 'utf8');
assert(bottomNav.includes('pb-safe'), 'MobileBottomNav uses pb-safe');

const purchase = fs.readFileSync(
  path.join(process.cwd(), 'src/components/product-detail/ProductPurchasePanel.tsx'),
  'utf8',
);
assert(purchase.includes('mobile-buy-bar') || purchase.includes('ctaInView'), 'sticky mobile buy bar');

const app = fs.readFileSync(path.join(process.cwd(), 'src/App.tsx'), 'utf8');
assert(app.includes("lazy(() => import('./pages/Shop'))"), 'Shop is lazy-loaded');
assert(app.includes("import Home from './pages/Home'"), 'Home stays eager');

const layout = fs.readFileSync(path.join(process.cwd(), 'src/components/Layout.tsx'), 'utf8');
assert(!layout.includes('globalSchemas'), 'Layout no longer duplicates global schema');
assert(layout.includes('cookieBannerOpen'), 'overlay discipline wired');

const localeHead = fs.readFileSync(path.join(process.cwd(), 'src/i18n/LocaleHead.tsx'), 'utf8');
assert(localeHead.includes('globalEntityJsonLd'), 'LocaleHead uses schema factory');
assert(localeHead.includes('defaultOgImage'), 'LocaleHead default OG');

const manifest = JSON.parse(fs.readFileSync(path.join(dist, 'prerender-manifest.json'), 'utf8'));
console.log(
  `\nManifest: ${manifest.pagesWritten} pages · ${manifest.productCount} products · ${manifest.categoryCount ?? '?'} categories · locales ${manifest.locales?.join(',')}`,
);

if (failed > 0) {
  console.error(`\n${failed} Phase F check(s) failed`);
  process.exit(1);
}
console.log('\nPhase F static validation passed');
