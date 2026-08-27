import { cn } from '../../lib/utils';

type HomeSectionFallbackProps = {
  className?: string;
  minHeight?: string;
};

/** Lightweight placeholder while below-the-fold home sections code-split in. */
export function HomeSectionFallback({
  className,
  minHeight = 'min-h-[280px]',
}: HomeSectionFallbackProps) {
  return (
    <div
      className={cn('skeleton-block bg-mist-50/90 rounded-none', minHeight, className)}
      aria-hidden
    />
  );
}
