import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageSeo } from '../seo/SeoProvider';
import { breadcrumbJsonLd, itemListJsonLd } from '../seo/structuredData';
import type { LocaleCode } from '../i18n/locales';
import { supabase } from '../supabase';
import { sortProducts, type CatalogSortKey } from '../lib/productSort';
import { catalogPriceSliderMax, productEffectiveMaxPrice } from '../lib/catalogPriceSlider';
import { SHOP_PAGE_SIZE, SHOP_PRODUCT_COLUMNS } from '../lib/shopCatalogQuery';
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
import { CatalogPagination } from '../components/catalog/CatalogPagination';
import { useProductCatalogActions } from '../hooks/useProductCatalogActions';
import type { CategoryOption } from '../components/catalog/types';
import type { CatalogProduct } from '../components/products/ProductCard';

export default function Shop() {
  const { t, i18n } = useTranslation('shop');
  const locale = i18n.language as LocaleCode;
  const [searchParams, setSearchParams] = useSearchParams();
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

  const shopSeo = useMemo(() => {
    if (allProducts.length === 0) return null;
    return {
      title: undefined,
      description: t('header.description'),
      canonicalPath: '/shop',
      jsonLd: [
        breadcrumbJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Shop', path: '/shop' },
          ],
          locale,
        ),
        itemListJsonLd(allProducts, locale),
      ],
    };
  }, [allProducts, locale, t]);

  usePageSeo(shopSeo);

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

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / SHOP_PAGE_SIZE));
  const rawPage = parseInt(searchParams.get('page') ?? '1', 10);
  const currentPage = Number.isFinite(rawPage) ? Math.min(Math.max(1, rawPage), totalPages) : 1;

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * SHOP_PAGE_SIZE;
    return filteredProducts.slice(start, start + SHOP_PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  const resultsFrom = filteredProducts.length === 0 ? 0 : (currentPage - 1) * SHOP_PAGE_SIZE + 1;
  const resultsTo = Math.min(currentPage * SHOP_PAGE_SIZE, filteredProducts.length);

  const setPage = (page: number) => {
    const next = new URLSearchParams(searchParams);
    if (page <= 1) next.delete('page');
    else next.set('page', String(page));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetPage = () => {
    setSearchParams(
      (prev) => {
        if (!prev.has('page')) return prev;
        const next = new URLSearchParams(prev);
        next.delete('page');
        return next;
      },
      { replace: true },
    );
  };

  useEffect(() => {
    if (rawPage !== currentPage) {
      const next = new URLSearchParams(searchParams);
      if (currentPage <= 1) next.delete('page');
      else next.set('page', String(currentPage));
      setSearchParams(next, { replace: true });
    }
  }, [rawPage, currentPage, searchParams, setSearchParams]);

  const toggleCategory = (slug: string) => {
    resetPage();
    setSelectedCategorySlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  const clearFilters = () => {
    resetPage();
    setSelectedCategorySlugs([]);
    setPriceRange(priceSliderMax);
    setSortBy('newest');
  };

  const handlePriceChange = (value: number) => {
    resetPage();
    setPriceRange(value);
  };

  const handleSortChange = (value: CatalogSortKey) => {
    resetPage();
    setSortBy(value);
  };

  const filterProps: CatalogFiltersProps = {
    categories,
    selectedCategorySlugs,
    onToggleCategory: toggleCategory,
    priceRange,
    priceSliderMax,
    priceSliderStep,
    onPriceChange: handlePriceChange,
    onClear: clearFilters,
    showMobile: showMobileFilters,
    onCloseMobile: () => setShowMobileFilters(false),
    onOpenMobile: () => setShowMobileFilters(true),
  };

  return (
    <div className="min-h-screen bg-mist-50">
      <CatalogPageHeader
        eyebrow={t('header.eyebrow')}
        title={
          <>
            {t('header.title')}{' '}
            <span className="text-brand-400">{t('header.titleHighlight')}</span>
          </>
        }
        description={t('header.description')}
      />
      <CatalogTrustBar />

      <Container className="py-10 md:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <p className="text-sm text-steel-600">
            {t('results', {
              from: resultsFrom,
              to: resultsTo,
              count: filteredProducts.length,
              total: allProducts.length,
            })}
          </p>
          <div className="flex items-center gap-3">
            <CatalogFilters {...filterProps} mode="trigger" />
            <CatalogSortSelect value={sortBy} onChange={(v) => handleSortChange(v as CatalogSortKey)} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <CatalogFilters {...filterProps} mode="sidebar" />

          <div className="lg:col-span-3">
            <CatalogActiveChips {...filterProps} />

            {!loading && filteredProducts.length === 0 ? (
              <CatalogEmptyState
                title={t('empty.title')}
                description={t('empty.description')}
                onClear={clearFilters}
                clearLabel={t('filters.clearAll')}
              />
            ) : (
              <>
                <ProductGrid
                  products={paginatedProducts}
                  loading={loading}
                  showDescription
                  inWishlist={isInWishlist}
                  onToggleWishlist={handleToggleWishlist}
                  onAddToCart={handleAddToCart}
                />
                <CatalogPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
        </div>
      </Container>

      <CatalogFilters {...filterProps} mode="drawer" />
    </div>
  );
}
