import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

type Props = {
  rating?: number;
  reviewCount?: number;
  className?: string;
  starClassName?: string;
};

function StarRow({
  rating,
  starClassName,
  filledClassName = 'text-amber-400',
  emptyClassName = 'text-gray-200',
}: {
  rating: number;
  starClassName: string;
  filledClassName?: string;
  emptyClassName?: string;
}) {
  const starsValue = Math.min(5, Math.max(0, rating));

  return (
    <div className={cn('flex', filledClassName)} aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.min(1, Math.max(0, starsValue - i));
        if (fill >= 0.75) {
          return <Star key={i} className={cn(starClassName, 'fill-current')} />;
        }
        if (fill >= 0.25) {
          return (
            <span key={i} className={cn('relative inline-flex', starClassName)}>
              <Star className={cn(starClassName, emptyClassName)} />
              <span className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                <Star className={cn(starClassName, 'fill-current', filledClassName)} />
              </span>
            </span>
          );
        }
        return <Star key={i} className={cn(starClassName, emptyClassName)} />;
      })}
    </div>
  );
}

export function ProductCardRating({
  rating = 0,
  reviewCount = 0,
  className = '',
  starClassName,
}: Props) {
  const rNum = Number(rating);
  const starsValue = Number.isFinite(rNum) ? Math.min(5, Math.max(0, rNum)) : 0;
  const display = starsValue > 0 ? starsValue.toFixed(1) : '—';
  const rc = Number(reviewCount) || 0;
  const sc = starClassName ?? 'h-3 w-3';

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      aria-label={
        starsValue > 0 || rc > 0
          ? `Rated ${starsValue.toFixed(1)} out of 5, ${rc} reviews`
          : 'No ratings yet'
      }
    >
      <StarRow rating={starsValue} starClassName={sc} />
      <span className="text-[10px] font-bold text-gray-500 tabular-nums">
        <span aria-hidden>{display}</span>
        <span className="text-gray-400 font-medium" aria-hidden>
          {' '}
          ({rc})
        </span>
      </span>
    </div>
  );
}

export { StarRow };
