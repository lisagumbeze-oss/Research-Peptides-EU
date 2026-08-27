import type { CatalogProduct } from '../components/products/ProductCard';
import type { CategoryOption } from '../components/catalog/types';

type CatalogSnapshot = {
  products: CatalogProduct[];
  categories: CategoryOption[];
  complete: boolean;
};

let snapshot: CatalogSnapshot | null = null;

export function peekCatalog(): CatalogSnapshot | null {
  return snapshot;
}

function mergeProducts(incoming: CatalogProduct[]) {
  const existing = snapshot?.products ?? [];
  const byId = new Map(existing.map((product) => [product.id, product]));
  for (const product of incoming) {
    byId.set(product.id, { ...byId.get(product.id), ...product });
  }
  return Array.from(byId.values());
}

export function rememberCatalog(next: { products: CatalogProduct[]; categories: CategoryOption[] }) {
  snapshot = {
    products: mergeProducts(next.products),
    categories: next.categories.length ? next.categories : snapshot?.categories ?? [],
    complete: true,
  };
}

export function rememberProducts(products: CatalogProduct[]) {
  snapshot = {
    products: mergeProducts(products),
    categories: snapshot?.categories ?? [],
    complete: snapshot?.complete ?? false,
  };
}

export function rememberProduct(product: CatalogProduct) {
  rememberProducts([product]);
}

export function findCachedProduct(slugOrId: string | undefined): CatalogProduct | undefined {
  if (!slugOrId || !snapshot) return undefined;
  return snapshot.products.find(
    (product) => product.slug === slugOrId || String(product.id) === slugOrId,
  );
}
