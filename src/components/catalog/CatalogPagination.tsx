import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../design-system';
import { cn } from '../../lib/utils';

type CatalogPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function buildPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];
  if (current > 3) pages.push('ellipsis');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('ellipsis');
  pages.push(total);
  return pages;
}

export function CatalogPagination({ currentPage, totalPages, onPageChange }: CatalogPaginationProps) {
  const { t } = useTranslation('shop');

  if (totalPages <= 1) return null;

  const pages = buildPageNumbers(currentPage, totalPages);

  return (
    <nav
      aria-label={t('pagination.label')}
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label={t('pagination.previous')}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">{t('pagination.previous')}</span>
      </Button>

      <div className="flex items-center gap-1">
        {pages.map((page, index) =>
          page === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-steel-400" aria-hidden>
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-label={t('pagination.page', { page })}
              aria-current={page === currentPage ? 'page' : undefined}
              className={cn(
                'min-w-9 h-9 px-2 rounded-lg text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
                page === currentPage
                  ? 'bg-brand-500 text-white shadow-card'
                  : 'text-steel-600 hover:bg-white hover:text-brand-600',
              )}
            >
              {page}
            </button>
          ),
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label={t('pagination.next')}
      >
        <span className="hidden sm:inline">{t('pagination.next')}</span>
        <ChevronRight className="h-4 w-4" aria-hidden />
      </Button>
    </nav>
  );
}
