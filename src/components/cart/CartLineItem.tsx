import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { ProductImagePlaceholder } from '../products/ProductImagePlaceholder';
import { formatCurrency } from '../../lib/utils';
import { productPath } from '../../lib/productUrl';
import { cn } from '../../lib/utils';

export type CartLineItemData = {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  specification?: string;
};

type CartLineItemProps = {
  item: CartLineItemData;
  compact?: boolean;
  onUpdateQuantity: (qty: number) => void;
  onRemove: () => void;
};

export function CartLineItem({ item, compact = false, onUpdateQuantity, onRemove }: CartLineItemProps) {
  return (
    <div
      className={cn(
        'flex gap-4 bg-white border border-brand-100 rounded-2xl transition-shadow hover:shadow-card',
        compact ? 'p-3' : 'p-4 md:p-5',
      )}
    >
      <div
        className={cn(
          'shrink-0 rounded-xl overflow-hidden bg-mist-50 border border-brand-50',
          compact ? 'w-16 h-16' : 'w-20 h-20 md:w-24 md:h-24',
        )}
      >
        {item.imageUrl ? (
          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <ProductImagePlaceholder
            productId={item.productId}
            title={item.title}
            className="h-full w-full min-h-0"
            compact
          />
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <Link
          to={productPath({ title: item.title })}
          className={cn(
            'font-display font-bold text-navy-950 hover:text-brand-600 transition-colors line-clamp-2',
            compact ? 'text-sm' : 'text-base',
          )}
        >
          {item.title}
        </Link>
        {item.specification ? (
          <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide text-steel-600 bg-mist-50 px-2 py-0.5 rounded-md w-fit">
            {item.specification}
          </span>
        ) : null}
        <p className="text-brand-600 font-semibold text-sm mt-1 tabular-nums">{formatCurrency(item.price)}</p>

        <div className="flex items-center justify-between mt-auto pt-3 gap-2">
          <div className="flex items-center border border-brand-100 rounded-xl overflow-hidden bg-mist-50">
            <button
              type="button"
              onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
              className="p-2 text-steel-600 hover:bg-brand-50 transition-colors"
              aria-label={`Decrease quantity of ${item.title}`}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="px-3 text-sm font-bold text-navy-950 tabular-nums min-w-[2rem] text-center">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              className="p-2 text-steel-600 hover:bg-brand-50 transition-colors"
              aria-label={`Increase quantity of ${item.title}`}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="text-error hover:bg-red-50 text-xs font-semibold flex items-center gap-1 px-2 py-1 rounded-lg transition-colors"
            aria-label={`Remove ${item.title}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {!compact && 'Remove'}
          </button>
        </div>
      </div>

      {!compact && (
        <div className="hidden sm:block text-lg font-display font-bold text-navy-950 tabular-nums shrink-0">
          {formatCurrency(item.price * item.quantity)}
        </div>
      )}
    </div>
  );
}
