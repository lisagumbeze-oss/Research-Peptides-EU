import { supabase } from '../supabase';
import { SHOP_PRODUCT_COLUMNS } from './shopCatalogQuery';
import { rememberProducts } from './catalogCache';
import { sortProducts } from './productSort';
import type { CatalogProduct } from '../components/products/ProductCard';
import type { CategoryOption } from '../components/catalog/types';

export const HOME_SEGMENT_SIZE = 8;
export const HOME_CATEGORY_RAIL_SIZE = 4;
export const HOME_CATALOG_LIMIT = 120;

export type HomeCategoryRail = {
  category: CategoryOption;
  products: CatalogProduct[];
};

export type HomeCatalog = {
  products: CatalogProduct[];
  categories: CategoryOption[];
};

export type HomeSegments = {
  featured: CatalogProduct[];
  newest: CatalogProduct[];
  bestsellers: CatalogProduct[];
  categoryRails: HomeCategoryRail[];
};

let inflight: Promise<HomeCatalog> | null = null;
let loaded: HomeCatalog | null = null;

function categoryTokens(value: unknown): string[] {
  if (!value) return [];
  if (typeof value === 'string') return [value.trim().toLowerCase()].filter(Boolean);
  if (Array.isArray(value)) return value.flatMap(categoryTokens);
  if (typeof value === 'object') {
    const record = value as { slug?: string; name?: string; id?: string };
    return [record.slug, record.name, record.id]
      .filter(Boolean)
      .map((token) => String(token).trim().toLowerCase());
  }
  return [];
}

function productInCategory(product: CatalogProduct, category: CategoryOption) {
  const tags = new Set(categoryTokens(product.categories));
  return tags.has(category.slug.toLowerCase()) || tags.has(category.name.toLowerCase());
}

function takeUnused(
  sorted: CatalogProduct[],
  count: number,
  used: Set<string>,
): CatalogProduct[] {
  const picked = sorted.filter((product) => !used.has(product.id)).slice(0, count);
  for (const product of picked) used.add(product.id);
  return picked;
}

export function pickHomeSegments(
  products: CatalogProduct[],
  categories: CategoryOption[],
): HomeSegments {
  const used = new Set<string>();
  const featured = takeUnused(sortProducts(products, 'rating-desc'), HOME_SEGMENT_SIZE, used);
  const newest = takeUnused(sortProducts(products, 'newest'), HOME_SEGMENT_SIZE, used);
  const bestsellers = takeUnused(sortProducts(products, 'featured'), HOME_SEGMENT_SIZE, used);

  const categoryRails: HomeCategoryRail[] = categories
    .map((category) => ({
      category,
      products: products.filter((product) => productInCategory(product, category)),
    }))
    .filter((rail) => rail.products.length >= 2)
    .sort((a, b) => b.products.length - a.products.length)
    .map((rail) => ({
      category: rail.category,
      products: takeUnused(
        sortProducts(rail.products, 'featured'),
        HOME_CATEGORY_RAIL_SIZE,
        used,
      ),
    }))
    .filter((rail) => rail.products.length >= 2)
    .slice(0, 2);

  return { featured, newest, bestsellers, categoryRails };
}

export function loadHomeCatalog(): Promise<HomeCatalog> {
  if (loaded?.products.length) return Promise.resolve(loaded);
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const [prodResult, catResult] = await Promise.all([
        supabase
          .from('products')
          .select(SHOP_PRODUCT_COLUMNS)
          .order('created_at', { ascending: false })
          .limit(HOME_CATALOG_LIMIT),
        supabase.from('categories').select('name, slug').order('name'),
      ]);

      if (prodResult.error) {
        console.error('Error loading home products:', prodResult.error);
      }
      if (catResult.error) {
        console.error('Error loading home categories:', catResult.error);
      }

      const products = (!prodResult.error && prodResult.data
        ? prodResult.data
        : []) as CatalogProduct[];
      const categories = (!catResult.error && catResult.data
        ? catResult.data
        : []) as CategoryOption[];

      const catalog = { products, categories };
      if (products.length) {
        rememberProducts(products);
        loaded = catalog;
      }
      return catalog;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}
