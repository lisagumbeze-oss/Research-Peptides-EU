import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { rememberProducts, peekCatalog } from '../lib/catalogCache';
import type { BlogMatchableProduct } from '../lib/blogProductMatch';

const COLUMNS = 'id,slug,title,images' as const;

let inflight: Promise<BlogMatchableProduct[]> | null = null;
let cached: BlogMatchableProduct[] | null = null;

async function loadBlogProductCatalog(): Promise<BlogMatchableProduct[]> {
  if (cached?.length) return cached;

  const peek = peekCatalog()?.products;
  if (peek?.length) {
    cached = peek.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      images: p.images,
    }));
    return cached;
  }

  if (inflight) return inflight;

  inflight = (async () => {
    const { data, error } = await supabase
      .from('products')
      .select(COLUMNS)
      .order('created_at', { ascending: false })
      .limit(250);

    if (error) {
      console.error('Error loading products for blog images:', error);
      return cached ?? [];
    }

    const rows = (data ?? []) as BlogMatchableProduct[];
    cached = rows;
    rememberProducts(
      rows.map((row) => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        images: row.images,
        price: 0,
      })),
    );
    return rows;
  })().finally(() => {
    inflight = null;
  });

  return inflight;
}

export function useBlogProductCatalog() {
  const [products, setProducts] = useState<BlogMatchableProduct[]>(() => cached ?? []);
  const [loading, setLoading] = useState(!cached?.length);

  useEffect(() => {
    let cancelled = false;
    void loadBlogProductCatalog().then((rows) => {
      if (cancelled) return;
      setProducts(rows);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { products, loading };
}
