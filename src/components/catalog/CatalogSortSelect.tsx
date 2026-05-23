import { ChevronDown } from 'lucide-react';
import type { CatalogSortKey } from '../../lib/productSort';
import { cn } from '../../lib/utils';

type SortValue = CatalogSortKey | 'relevance';

type CatalogSortSelectProps = {
  value: SortValue;
  onChange: (value: SortValue) => void;
  includeRelevance?: boolean;
  className?: string;
};

export function CatalogSortSelect({
  value,
  onChange,
  includeRelevance = false,
  className,
}: CatalogSortSelectProps) {
  return (
    <div className={cn('relative', className)}>
      <label htmlFor="catalog-sort" className="sr-only">
        Sort products
      </label>
      <select
        id="catalog-sort"
        value={value}
        onChange={(e) => onChange(e.target.value as SortValue)}
        className="appearance-none w-full min-w-[180px] pl-4 pr-10 py-2.5 bg-white border border-brand-100 rounded-xl text-sm font-semibold text-steel-600 focus:outline-none focus:ring-2 focus:ring-brand-400 cursor-pointer shadow-card"
      >
        {includeRelevance ? <option value="relevance">Relevance</option> : null}
        <option value="featured">Featured</option>
        <option value="rating-desc">Best rated</option>
        <option value="newest">Newest</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
      </select>
      <ChevronDown
        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-silver-400 pointer-events-none"
        aria-hidden
      />
    </div>
  );
}
