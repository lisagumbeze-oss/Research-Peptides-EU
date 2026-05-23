import { formatCurrency } from '../../lib/utils';
import { productCardPriceRange, productListCompareAtPrice } from '../../lib/productCardDisplay';

export function ProductCardPriceBlock({ product }: { product: any }) {
  const { min, max } = productCardPriceRange(product);
  const isRange = product.variants && product.variants.length > 1;
  const compareAt = productListCompareAtPrice(product);
  const primary = isRange ? `${formatCurrency(min)} – ${formatCurrency(max)}` : formatCurrency(min);

  if (compareAt != null) {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-lg md:text-xl font-display font-bold text-navy-950 tabular-nums">{primary}</span>
        <span className="text-xs font-semibold tabular-nums text-silver-400 line-through">
          {formatCurrency(compareAt)}
        </span>
      </div>
    );
  }

  return <span className="text-lg md:text-xl font-display font-bold text-navy-950 tabular-nums">{primary}</span>;
}
