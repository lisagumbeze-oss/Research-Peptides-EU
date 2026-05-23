/**
 * Generates locale JSON from English sources + scripts/i18n/maps/{locale}.json
 *
 *   npx tsx scripts/generate-i18n-locales.ts
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const localesDir = path.join(root, 'src/i18n/locales');
const mapsDir = path.join(__dirname, 'i18n/maps');

const NAMESPACES = ['common', 'nav', 'home', 'shop', 'checkout', 'shipping', 'product'] as const;
const NEW_LOCALES = [
  'es', 'it', 'pt', 'hr', 'pl', 'ro', 'cs', 'da', 'sv', 'fi', 'el', 'hu', 'sk', 'sl', 'bg',
] as const;
const EXISTING = ['en', 'nl', 'de', 'fr'] as const;

function loadMap(locale: string): Record<string, string> {
  const file = path.join(mapsDir, `${locale}.json`);
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, string>;
}

function translateValue(value: string, map: Record<string, string>): string {
  return map[value] ?? value;
}

function translateTree<T>(node: T, map: Record<string, string>): T {
  if (typeof node === 'string') return translateValue(node, map) as T;
  if (Array.isArray(node)) return node.map((item) => translateTree(item, map)) as T;
  if (node && typeof node === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(node as Record<string, unknown>)) {
      out[key] = translateTree(val, map);
    }
    return out as T;
  }
  return node;
}

function writeLocaleFile(locale: string, ns: string, data: object) {
  const dir = path.join(localesDir, locale);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${ns}.json`), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function main() {
  for (const locale of NEW_LOCALES) {
    const map = loadMap(locale);
    if (Object.keys(map).length === 0) {
      console.warn(`Skip ${locale}: no map at scripts/i18n/maps/${locale}.json`);
      continue;
    }
    for (const ns of NAMESPACES) {
      const enPath = path.join(localesDir, 'en', `${ns}.json`);
      const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
      writeLocaleFile(locale, ns, translateTree(en, map));
    }
    console.log(`Generated ${locale} (${NAMESPACES.length} namespaces)`);
  }

  for (const locale of ['nl', 'de', 'fr'] as const) {
    const map = loadMap(locale);
    if (Object.keys(map).length === 0) continue;
    const enProduct = JSON.parse(
      fs.readFileSync(path.join(localesDir, 'en', 'product.json'), 'utf8'),
    );
    writeLocaleFile(locale, 'product', translateTree(enProduct, map));
    console.log(`Updated ${locale}/product.json`);
  }

  console.log('Done. Add legal.json for nl/de/fr manually or via scripts/i18n/legal/*.json');
}

main();
