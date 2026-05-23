import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabase';
import { sortProducts, type CatalogSortKey } from '../lib/productSort';
import { catalogPriceSliderMax, productEffectiveMaxPrice } from '../lib/catalogPriceSlider';
import { SHOP_PRODUCT_COLUMNS } from '../lib/shopCatalogQuery';
import { Container } from '../design-system';
import { CatalogPageHeader } from '../components/catalog/CatalogPageHeader';
import { CatalogTrustBar } from '../components/catalog/CatalogTrustBar';
import {
  CatalogFilters,
  CatalogActiveChips,
  type CatalogFiltersProps,
} from '../components/catalog/CatalogFilters';
import { CatalogSortSelect } from '../components/catalog/CatalogSortSelect';
import { CatalogEmptyState } from '../components/catalog/CatalogEmptyState';
import { ProductGrid } from '../components/catalog/ProductGrid';
import { useProductCatalogActions } from '../hooks/useProductCatalogActions';
import type { CategoryOption } from '../components/catalog/types';
import type { CatalogProduct } from '../components/products/ProductCard';

export default function Shop() {
  const [allProducts, setAllProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategorySlugs, setSelectedCategorySlugs] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState(500);
  const [sortBy, setSortBy] = useState<CatalogSortKey>('newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { isInWishlist, handleToggleWishlist, handleAddToCart } = useProductCatalogActions();

  useEffect(() => {
    void (async () => {
      try {
        const [prodResult, catResult] = await Promise.all([
          supabase.from('products').select(SHOP_PRODUCT_COLUMNS).order('created_at', { ascending: false }),
          supabase.from('categories').select('name, slug').order('name'),
        ]);

        if (!prodResult.error && prodResult.data) {
          setAllProducts(prodResult.data as CatalogProduct[]);
          setPriceRange(catalogPriceSliderMax(prodResult.data));
        }

        if (!catResult.error && catResult.data) {
          setCategories(catResult.data as CategoryOption[]);
        }
      } catch (error) {
        console.error('Error fetching shop data:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const priceSliderMax = useMemo(() => catalogPriceSliderMax(allProducts), [allProducts]);
  const priceSliderStep = priceSliderMax > 2000 ? 50 : 10;

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];
    if (selectedCategorySlugs.length > 0) {
      result = result.filter(
        (p) =>
          p.categories &&
          p.categories.some((c: string) => selectedCategorySlugs.includes(c)),
      );
    }
    result = result.filter((p) => productEffectiveMaxPrice(p) <= priceRange);
    return sortProducts(result, sortBy);
  }, [allProducts, selectedCategorySlugs, priceRange, sortBy]);

  const toggleCategory = (slug: string) => {
    setSelectedCategorySlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  const clearFilters = () => {
    setSelectedCategorySlugs([]);
    setPriceRange(priceSliderMax);
    setSortBy('newest');
  };

  const filterProps: CatalogFiltersProps = {
    categories,
    selectedCategorySlugs,
    onToggleCategory: toggleCategory,
    priceRange,
    priceSliderMax,
    priceSliderStep,
    onPriceChange: setPriceRange,
    onClear: clearFilters,
    showMobile: showMobileFilters,
    onCloseMobile: () => setShowMobileFilters(false),
    onOpenMobile: () => setShowMobileFilters(true),
  };

  return (
    <div className="min-h-screen bg-mist-50">
      <CatalogPageHeader
        eyebrow="Research catalog"
        title={
          <>
            Shop <span className="text-brand-400">peptides</span>
          </>
        }
        description="Browse verified research compounds with EU fulfillment, batch documentation, and transparent specifications."
      />
      <CatalogTrustBar />

      <Container className="py-10 md:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <p className="text-sm text-steel-600">
            Showing <span className="font-semibold text-navy-950">{filteredProducts.length}</span> of{' '}
            <span className="font-semibold text-navy-950">{allProducts.length}</span> products
          </p>
          <div className="flex items-center gap-3">
            <CatalogFilters {...filterProps} mode="trigger" />
            <CatalogSortSelect value={sortBy} onChange={(v) => setSortBy(v as CatalogSortKey)} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <CatalogFilters {...filterProps} mode="sidebar" />

          <div className="lg:col-span-3">
            <CatalogActiveChips {...filterProps} />

            {!loading && filteredProducts.length === 0 ? (
              <CatalogEmptyState
                title="No products match your filters"
                description="Try widening the price range or clearing category selections."
                onClear={clearFilters}
              />
            ) : (
              <ProductGrid
                products={filteredProducts}
                loading={loading}
                showDescription
                inWishlist={isInWishlist}
                onToggleWishlist={handleToggleWishlist}
                onAddToCart={handleAddToCart}
              />
            )}
          </div>
        </div>
      </Container>

      <CatalogFilters {...filterProps} mode="drawer" />
    </div>
  );
}
