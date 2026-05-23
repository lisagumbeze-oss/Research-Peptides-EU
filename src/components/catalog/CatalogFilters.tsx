import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Filter } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { formatCurrency } from '../../lib/utils';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { Button, GlassPanel } from '../../design-system';
import type { CategoryOption } from './types';
import { cn } from '../../lib/utils';

export type CatalogFiltersProps = {
  categories: CategoryOption[];
  selectedCategorySlugs: string[];
  onToggleCategory: (slug: string) => void;
  priceRange: number;
  priceSliderMax: number;
  priceSliderStep: number;
  onPriceChange: (value: number) => void;
  onClear: () => void;
  showMobile: boolean;
  onCloseMobile: () => void;
  onOpenMobile: () => void;
  className?: string;
  /** desktop sidebar | mobile trigger button | mobile drawer panel */
  mode?: 'sidebar' | 'trigger' | 'drawer';
};

function FiltersPanel({
  categories,
  selectedCategorySlugs,
  onToggleCategory,
  priceRange,
  priceSliderMax,
  priceSliderStep,
  onPriceChange,
  onClear,
  idPrefix = '',
}: Omit<CatalogFiltersProps, 'showMobile' | 'onCloseMobile' | 'onOpenMobile' | 'className' | 'mode'> & {
  idPrefix?: string;
}) {
  const { t } = useTranslation('shop');
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-caption text-brand-600 mb-4">{t('filters.categories')}</h3>
        <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {categories.map((cat) => (
            <li key={cat.slug}>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  id={`${idPrefix}cat-${cat.slug}`}
                  className="h-4 w-4 rounded border-brand-200 text-brand-600 focus:ring-brand-400"
                  checked={selectedCategorySlugs.includes(cat.slug)}
                  onChange={() => onToggleCategory(cat.slug)}
                />
                <span
                  className={cn(
                    'text-sm font-medium transition-colors',
                    selectedCategorySlugs.includes(cat.slug)
                      ? 'text-brand-700'
                      : 'text-steel-600 group-hover:text-navy-950',
                  )}
                >
                  {cat.name}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-caption text-brand-600">{t('filters.maxPrice')}</h3>
          <span className="text-sm font-semibold text-brand-600 tabular-nums">
            {formatCurrency(priceRange)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={priceSliderMax}
          step={priceSliderStep}
          value={Math.min(priceRange, priceSliderMax)}
          onChange={(e) => onPriceChange(parseInt(e.target.value, 10))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer accent-brand-500 bg-brand-100"
          aria-label="Maximum price filter"
        />
        <div className="flex justify-between text-[10px] font-semibold text-silver-400 mt-2 uppercase tracking-wider">
          <span>{formatCurrency(0)}</span>
          <span>{formatCurrency(priceSliderMax)}+</span>
        </div>
      </div>

      <Button variant="outline" fullWidth onClick={onClear} className="gap-2 text-steel-600">
        <X className="h-4 w-4" />
        {t('filters.clearShort')}
      </Button>
    </div>
  );
}

export function CatalogFilters(props: CatalogFiltersProps) {
  const { t } = useTranslation('shop');
  const { showMobile, onCloseMobile, onOpenMobile, className, mode = 'sidebar' } = props;

  const mobileRef = useRef<HTMLDivElement>(null);
  useFocusTrap(showMobile && mode === 'drawer', mobileRef, onCloseMobile);

  if (mode === 'trigger') {
    return (
      <button
        type="button"
        onClick={onOpenMobile}
        className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-100 bg-white text-sm font-semibold text-steel-600 shadow-card"
        aria-expanded={showMobile}
        aria-controls="catalog-mobile-filters"
      >
        <Filter className="h-4 w-4" aria-hidden />
        {t('filters.filters')}
      </button>
    );
  }

  if (mode === 'sidebar') {
    return (
      <aside
        className={cn('hidden lg:block sticky top-24 self-start', className)}
      >
        <GlassPanel variant="light" padding="md" className="space-y-6 shadow-glow">
          <h2 className="font-display font-bold text-navy-950">{t('filters.refine')}</h2>
          <FiltersPanel {...props} idPrefix="desktop-" />
        </GlassPanel>
      </aside>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showMobile && (
          <>
            <motion.div
              className="fixed inset-0 bg-navy-950/40 z-50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              aria-hidden
            />
            <motion.div
              ref={mobileRef}
              id="catalog-mobile-filters"
              role="dialog"
              aria-modal="true"
              aria-label="Product filters"
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-white z-[60] p-6 shadow-elevated lg:hidden flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display font-bold text-lg">{t('filters.filters')}</h2>
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="p-2 rounded-lg hover:bg-brand-50"
                  aria-label={t('filters.close')}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <FiltersPanel {...props} idPrefix="mobile-" />
              </div>
              <Button className="mt-6 w-full" onClick={onCloseMobile}>
                {t('filters.showResults')}
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/** @deprecated use mode prop — kept for mobile drawer mount at page root */
export function CatalogFiltersDrawer(props: CatalogFiltersProps) {
  return <CatalogFilters {...props} mode="drawer" />;
}

export function CatalogActiveChips(props: CatalogFiltersProps) {
  const { categories, selectedCategorySlugs, onToggleCategory, priceRange, priceSliderMax, onPriceChange } =
    props;

  const chips = [
    ...selectedCategorySlugs.map((slug) => ({
      key: `cat-${slug}`,
      label: categories.find((c) => c.slug === slug)?.name ?? slug,
      onRemove: () => onToggleCategory(slug),
    })),
    ...(priceRange < priceSliderMax
      ? [
          {
            key: 'price',
            label: `Under ${formatCurrency(priceRange)}`,
            onRemove: () => onPriceChange(priceSliderMax),
          },
        ]
      : []),
  ];

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-100"
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            className="hover:text-brand-900"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  );
}
