export function slugifyProductName(input: string): string {
  const cleaned = input
    .replace(/\s*\(powder list[^)]*\)/gi, '')
    .trim();

  return cleaned
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 80) || 'product';
}

export function productPath(product: { slug?: string | null; title?: string | null }): string {
  const slug = (product.slug && String(product.slug).trim()) || slugifyProductName(String(product.title || 'product'));
  return `/product/${slug}`;
}
