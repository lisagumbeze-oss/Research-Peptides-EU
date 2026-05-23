import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, ArrowRight } from 'lucide-react';
import { supabase } from '../supabase';
import { sortProducts, type CatalogSortKey } from '../lib/productSort';
import { Container } from '../design-system';
import { CatalogPageHeader } from '../components/catalog/CatalogPageHeader';
import { CatalogTrustBar } from '../components/catalog/CatalogTrustBar';
import { CatalogSortSelect } from '../components/catalog/CatalogSortSelect';
import { CatalogEmptyState } from '../components/catalog/CatalogEmptyState';
import { ProductGrid } from '../components/catalog/ProductGrid';
import { useProductCatalogActions } from '../hooks/useProductCatalogActions';
import type { CategoryOption } from '../components/catalog/types';
import type { CatalogProduct } from '../components/products/ProductCard';

export default function Search() {
  const [allProducts, setAllProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState<CatalogSortKey | 'relevance'>('relevance');

  const selectedCategorySlug = searchParams.get('category') || '';
  const { isInWishlist, handleToggleWishlist, handleAddToCart } = useProductCatalogActions();

  useEffect(() => {
    void (async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          supabase.from('products').select('*'),
          supabase.from('categories').select('name, slug').order('name'),
        ]);
        if (prodRes.data) setAllProducts(prodRes.data as CatalogProduct[]);
        if (catRes.data) setCategories(catRes.data as CategoryOption[]);
      } catch (error) {
        console.error('Error fetching search data:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = allProducts.filter((product) => {
      const q = searchTerm.toLowerCase();
      const matchesText =
        product.title?.toLowerCase().includes(q) ||
        product.description?.toLowerCase().includes(q);

      if (!selectedCategorySlug) return matchesText;
      return (
        matchesText &&
        Array.isArray(product.categories) &&
        product.categories.includes(selectedCategorySlug)
      );
    });

    if (sortBy !== 'relevance') {
      result = sortProducts(result, sortBy);
    }
    return result;
  }, [allProducts, searchTerm, selectedCategorySlug, sortBy]);

  const hasNoCatalog = !loading && allProducts.length === 0;
  const hasNoMatches = !loading && allProducts.length > 0 && filteredProducts.length === 0;

  const clearSearchFilters = () => {
    setSearchTerm('');
    setSearchParams({});
  };

  const categoryName =
    categories.find((c) => c.slug === selectedCategorySlug)?.name ?? selectedCategorySlug;

  return (
    <div className="min-h-screen bg-mist-50">
      <CatalogPageHeader
        eyebrow="Catalog search"
        title={
          <>
            Find <span className="text-brand-400">compounds</span>
          </>
        }
        description="Search by name, description, or filter by research category."
      />
      <CatalogTrustBar />

      <Container className="py-8 md:py-10">
        <div className="relative max-w-2xl mx-auto mb-10">
          <SearchIcon
            className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-silver-400 pointer-events-none"
            aria-hidden
          />
          <label htmlFor="global-product-search" className="sr-only">
            Search products
          </label>
          <input
            id="global-product-search"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search research compounds…"
            className="w-full pl-14 pr-4 py-4 rounded-2xl border border-brand-100 bg-white text-navy-950 placeholder:text-silver-400 shadow-card focus:outline-none focus:ring-2 focus:ring-brand-400 text-base font-medium"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <label htmlFor="search-category" className="text-caption text-brand-600 block mb-2">
              Category
            </label>
            <select
              id="search-category"
              value={selectedCategorySlug}
              onChange={(e) => {
                const next = e.target.value;
                setSearchParams(next ? { category: next } : {});
              }}
              className="w-full py-3 px-4 rounded-xl border border-brand-100 bg-white text-sm font-semibold text-steel-600 focus:outline-none focus:ring-2 focus:ring-brand-400 shadow-card"
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="search-sort" className="text-caption text-brand-600 block mb-2">
              Sort
            </label>
            <CatalogSortSelect
              value={sortBy}
              onChange={setSortBy}
              includeRelevance
              className="w-full"
            />
          </div>
        </div>

        {!loading && !hasNoCatalog && (
          <p className="text-sm text-steel-600 mb-6">
            Showing <span className="font-semibold text-navy-950">{filteredProducts.length}</span> of{' '}
            <span className="font-semibold text-navy-950">{allProducts.length}</span> products
            {searchTerm ? ` matching “${searchTerm}”` : ''}
            {selectedCategorySlug && !searchTerm ? ` in ${categoryName}` : ''}
          </p>
        )}

        {loading ? (
          <ProductGrid
            products={[]}
            loading
            inWishlist={isInWishlist}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
          />
        ) : hasNoCatalog ? (
          <CatalogEmptyState
            title="No products available"
            description="The catalog is empty or still loading. Check your connection or add products in admin."
            onClear={undefined}
          />
        ) : hasNoMatches ? (
          <CatalogEmptyState
            title="No matches found"
            description={
              searchTerm
                ? `Nothing matched “${searchTerm}”. Try different keywords or clear filters.`
                : selectedCategorySlug
                  ? `No products in “${categoryName}” right now.`
                  : 'Adjust your search or filters.'
            }
            onClear={clearSearchFilters}
            clearLabel="Clear search & filters"
          />
        ) : (
          <ProductGrid
            products={filteredProducts}
            inWishlist={isInWishlist}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
          />
        )}

        {!hasNoCatalog && !hasNoMatches && (
          <p className="text-center mt-10">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Browse full shop <ArrowRight className="h-4 w-4" />
            </Link>
          </p>
        )}
      </Container>
    </div>
  );
}
