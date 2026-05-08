import { Star } from 'lucide-react';

type Props = {
  rating?: number;
  reviewCount?: number;
  className?: string;
  starClassName?: string;
};

export function ProductCardRating({ rating = 0, reviewCount = 0, className = '', starClassName }: Props) {
  const rNum = Number(rating);
  const starsValue = Number.isFinite(rNum) ? Math.min(5, Math.max(0, rNum)) : 0;
  const filled = Math.round(starsValue);
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
      <div className="flex text-amber-400" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) =>
          i < filled ? (
            <Star key={i} className={`${sc} fill-current`} />
          ) : (
            <Star key={i} className={`${sc} text-gray-200`} />
          ),
        )}
      </div>
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
