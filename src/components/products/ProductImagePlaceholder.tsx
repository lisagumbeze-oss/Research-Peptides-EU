/**
 * Product image fallback when no URL is available.
 *
 * Strategy (ecommerce storefront):
 * - **Gradient** — always: stable, distinct background per product (hashed id/title).
 * - **Monogram** — optional: large initial on cards; omit on tiny tiles (`monogram={false}`)
 *   or shrink with `compact` (cart drawer, omnisearch, sidebars).
 */
import { productPlaceholderGradientClass } from '../../lib/productCardDisplay';
import { cn } from '../../lib/utils';

type Props = {
  productId: string;
  title: string;
  className?: string;
  /** Smaller letter for ~64px–96px thumbnails */
  compact?: boolean;
  /** Show first letter on top of gradient. Default true. */
  monogram?: boolean;
};

export function ProductImagePlaceholder({
  productId,
  title,
  className,
  compact,
  monogram = true,
}: Props) {
  const initial = title.trim().charAt(0).toUpperCase() || '?';
  const grad = productPlaceholderGradientClass(productId, title);

  return (
    <div
      className={cn(
        'relative isolate flex min-h-[6rem] w-full items-center justify-center overflow-hidden',
        grad,
        className,
      )}
      role="img"
      aria-label={`No product image for ${title}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.95)_0%,transparent_55%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.35)_0%,transparent_45%)]"
        aria-hidden
      />
      {monogram ? (
        <span
          className={cn(
            'relative z-[1] font-black tracking-tighter text-white drop-shadow-sm',
            compact ? 'text-xl' : 'text-4xl sm:text-5xl',
          )}
        >
          {initial}
        </span>
      ) : null}
    </div>
  );
}
