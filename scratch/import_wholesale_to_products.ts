import fs from 'fs';
import { pool } from '../server/src/db';

type SourceVariant = {
  id: number;
  name: string;
  sourcePrice: number;
  discountedPrice: number;
};

type SourceProduct = {
  sourceUrl: string;
  handle: string;
  title: string;
  image: string | null;
  description: string;
  variants: SourceVariant[];
  discountedBasePrice: number;
};

const CATEGORY_MAP: Record<string, string[]> = {
  'bpc-157': ['peptides'],
  'bpc-157-tb500-ghk-cu-glowpen': ['peptide-blends', 'peptides'],
  'bpc-tb': ['peptide-blends', 'peptides'],
  'diosa-glow-70mg-prefilled-pen': ['peptide-blends', 'peptides'],
  'ghk-cu': ['peptides', 'research-chemicals'],
  'hcg': ['peptides', 'research-chemicals'],
  'mots-c-x-10-vials': ['peptides', 'research-chemicals'],
  'tirzepatide-100mg-one-vial': ['peptides', 'research-chemicals'],
  'vio-labs-retatrutide-40mg-3ml-prefilled-pen': ['peptides', 'research-chemicals']
};

const TITLE_MAP: Record<string, string> = {
  'bpc-157': 'BPC 157 x 10 Vials',
  'bpc-157-tb500-ghk-cu-glowpen': 'BPC 157 + GHK-CU + TB500 x 10 Vials',
  'bpc-tb': 'BPC 157 + TB500 x 10 Vials',
  'diosa-glow-70mg-prefilled-pen': 'DIOSA GLOW 70mg Prefilled Pen',
  'ghk-cu': 'GHK-CU x 10 Vials',
  'hcg': 'HCG x 10 Vials',
  'mots-c-x-10-vials': 'MOTS-c x 10 Vials',
  'tirzepatide-100mg-one-vial': 'Tirzepatide 100mg One Vial',
  'vio-labs-retatrutide-40mg-3ml-prefilled-pen': 'Vio Labs Retatrutide 40mg / 3ml Prefilled Pen'
};

function makeSpecifications(item: SourceProduct): string[] {
  const variantNames = item.variants.map((v) => v.name).join(', ');
  return [
    'Research use only',
    '10% below source site pricing',
    `Variant options: ${variantNames}`
  ];
}

async function main() {
  const raw = fs.readFileSync('scratch/wholesale_products_discounted.jsonl', 'utf-8');
  const items: SourceProduct[] = raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));

  const titles = items.map((item) => TITLE_MAP[item.handle] || item.title.trim());
  await pool.query('DELETE FROM products WHERE title = ANY($1::text[])', [titles]);

  for (const item of items) {
    const title = TITLE_MAP[item.handle] || item.title.trim();
    const categories = CATEGORY_MAP[item.handle] || ['peptides'];
    const variants = item.variants.map((variant) => ({
      variation_id: variant.id,
      display_name: `${title} - ${variant.name}`,
      display_price: variant.discountedPrice,
      display_regular_price: variant.discountedPrice,
      attributes: {
        attribute_pa_peptides: variant.name
      }
    }));

    await pool.query(
      `INSERT INTO products (title, description, price, inventory, images, categories, specifications, rating, review_count, variants)
       VALUES ($1, $2, $3, $4, $5::text[], $6::text[], $7::text[], $8, $9, $10::jsonb)`,
      [
        title,
        item.description,
        item.discountedBasePrice,
        100,
        item.image ? [item.image.replace('http://', 'https://')] : [],
        categories,
        makeSpecifications(item),
        4.8,
        12,
        JSON.stringify(variants)
      ]
    );
  }

  console.log(`Imported ${items.length} discounted wholesale products.`);
  await pool.end();
}

main().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
