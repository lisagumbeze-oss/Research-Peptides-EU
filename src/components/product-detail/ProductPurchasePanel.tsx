import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Heart,
  LinkIcon,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  Zap,
} from 'lucide-react';
import { Button, Badge } from '../../design-system';
import { ProductBadge } from '../products/ProductBadge';
import { formatCurrency } from '../../lib/utils';
import { cn } from '../../lib/utils';

type Variant = {
  variation_id?: string;
  display_name?: string;
  display_price?: number;
  attributes?: { attribute_pa_peptides?: string };
};

type ProductPurchasePanelProps = {
  title: string;
  description?: string;
  currentPrice: number;
  compareWas: number | null;
  reviewCount: number;
  rating?: number;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  variants: Variant[];
  selectedVariant: Variant | null;
  onSelectVariant: (v: Variant) => void;
  specifications: string[];
  onAddToCart: () => void;
  inWishlist: boolean;
  onToggleWishlist: () => void;
  showShare: boolean;
  onToggleShare: () => void;
  onCopyLink: () => void;
};

const bundleTiers = [
  { id: 'standard', qty: 1, range: '1–2 units', label: 'Standard', discount: 0 },
  { id: 'save', qty: 3, range: '3–5 units', label: 'Save 10%', discount: 0.1 },
  { id: 'value', qty: 5, range: '6+ units', label: 'Best value', discount: 0.15 },
] as const;

export function ProductPurchasePanel({
  title,
  description,
  currentPrice,
  compareWas,
  reviewCount,
  rating = 5,
  quantity,
  onQuantityChange,
  variants,
  selectedVariant,
  onSelectVariant,
  specifications,
  onAddToCart,
  inWishlist,
  onToggleWishlist,
  showShare,
  onToggleShare,
  onCopyLink,
}: ProductPurchasePanelProps) {
  const basePrice = Number(currentPrice) || 0;

  return (
    <div className="lg:sticky lg:top-24 space-y-6">
      <div className="flex justify-between items-start gap-4">
        <h1 className="text-h2 font-display font-bold text-navy-950">{title}</h1>
        <div className="flex gap-2 shrink-0 relative">
          <button
            type="button"
            onClick={onToggleShare}
            className="p-2.5 rounded-xl border border-brand-100 text-steel-600 hover:bg-brand-50 hover:text-brand-600"
            aria-expanded={showShare}
            aria-label="Share product"
          >
            <Share2 className="h-5 w-5" />
          </button>
          {showShare && (
            <div
              className="absolute right-0 top-12 bg-white border border-brand-100 shadow-elevated rounded-xl p-2 z-10"
              role="menu"
            >
              <button
                type="button"
                onClick={onCopyLink}
                className="p-2 rounded-lg hover:bg-brand-50 text-steel-600"
                aria-label="Copy link"
              >
                <LinkIcon className="h-5 w-5" />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={onToggleWishlist}
            className={cn(
              'p-2.5 rounded-xl border transition-colors',
              inWishlist
                ? 'border-error/30 bg-red-50 text-error'
                : 'border-brand-100 text-steel-600 hover:bg-brand-50',
            )}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className="h-5 w-5" fill={inWishlist ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex text-warning">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn('h-4 w-4', i < Math.round(rating) ? 'fill-current' : 'text-brand-100')}
            />
          ))}
        </div>
        <span className="text-sm text-steel-600">({reviewCount} reviews)</span>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          {compareWas != null && (
            <span className="text-lg font-semibold text-silver-400 line-through tabular-nums block">
              {formatCurrency(compareWas)}
            </span>
          )}
          <span className="text-3xl md:text-4xl font-display font-bold text-navy-950 tabular-nums">
            {formatCurrency(basePrice)}
          </span>
        </div>
        <Badge variant="purity">Price verified</Badge>
      </div>

      {description ? (
        <p className="text-steel-600 text-sm leading-relaxed whitespace-pre-line">{description}</p>
      ) : null}

      {variants.length > 0 && (
        <div className="p-4 rounded-2xl bg-mist-50 border border-brand-100">
          <h3 className="text-caption text-brand-600 mb-3">Specification</h3>
          <div className="flex flex-wrap gap-2">
            {variants.map((v, i) => {
              const label = v.attributes?.attribute_pa_peptides || v.display_name || `Variant ${i + 1}`;
              const selected = selectedVariant?.variation_id === v.variation_id;
              return (
                <button
                  key={v.variation_id || i}
                  type="button"
                  onClick={() => onSelectVariant(v)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all',
                    selected
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-brand-100 bg-white text-steel-600 hover:border-brand-300',
                  )}
                  aria-pressed={selected}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {specifications.length > 0 && (
        <div>
          <h3 className="text-caption text-brand-600 mb-3">Product profile</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {specifications.map((spec, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-sm text-steel-600 bg-white px-3 py-2 rounded-xl border border-brand-50"
              >
                <CheckCircle2 className="h-4 w-4 text-brand-500 shrink-0" />
                <span className="line-clamp-2">{spec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-4">
          <ProductBadge type="verified" size="sm" />
          <span className="text-caption text-silver-400">Research bundle</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {bundleTiers.map((tier) => {
            const unitPrice = basePrice * (1 - tier.discount);
            const isSelected =
              (tier.qty === 1 && quantity < 3) ||
              (tier.qty === 3 && quantity >= 3 && quantity < 5) ||
              (tier.qty === 5 && quantity >= 5);

            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => onQuantityChange(tier.qty)}
                className={cn(
                  'p-3 rounded-2xl border-2 text-center transition-all',
                  isSelected
                    ? 'border-brand-500 bg-brand-50 shadow-card'
                    : 'border-brand-50 bg-white hover:border-brand-200',
                )}
                aria-pressed={isSelected}
              >
                <span className="text-[10px] font-bold uppercase tracking-wide text-brand-600 block mb-1">
                  {tier.label}
                </span>
                <span className="text-xs text-steel-600 block mb-1">{tier.range}</span>
                <span className="text-base font-bold text-navy-950 tabular-nums">
                  {formatCurrency(unitPrice)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: ShieldCheck, label: 'HPLC tested' },
          { icon: Truck, label: 'EU dispatch' },
          { icon: Zap, label: 'Cold-chain' },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center p-3 rounded-2xl bg-brand-50/80 border border-brand-100 text-center"
          >
            <Icon className="h-5 w-5 text-brand-600 mb-1" />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-800">{label}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="flex items-center border border-brand-100 rounded-xl overflow-hidden bg-white shadow-card">
          <button
            type="button"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="px-4 py-3 text-steel-600 hover:bg-brand-50"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => onQuantityChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-14 text-center font-bold text-navy-950 border-x border-brand-100 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            aria-label="Quantity"
          />
          <button
            type="button"
            onClick={() => onQuantityChange(quantity + 1)}
            className="px-4 py-3 text-steel-600 hover:bg-brand-50"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <Button size="lg" fullWidth onClick={onAddToCart} className="gap-2 flex-1">
          <ShoppingCart className="h-5 w-5" />
          Add to cart
        </Button>
      </div>

      <p className="text-xs text-silver-400 text-center">
        <Link to="/coas" className="text-brand-600 hover:underline font-medium">
          View COA library
        </Link>
        {' · '}
        For laboratory research only
      </p>
    </div>
  );
}
