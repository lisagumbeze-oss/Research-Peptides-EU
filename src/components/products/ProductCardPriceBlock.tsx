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
        <span className="text-xl font-black text-gray-900 tabular-nums">{primary}</span>
        <span className="text-xs font-bold tabular-nums text-gray-400 line-through">
          {formatCurrency(compareAt)}
        </span>
      </div>
    );
  }

  return <span className="text-xl font-black text-gray-900 tabular-nums">{primary}</span>;
}
