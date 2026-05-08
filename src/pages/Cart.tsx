import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { formatCurrency } from '../lib/utils';
import { ProductImagePlaceholder } from '../components/products/ProductImagePlaceholder';
import { Trash2, Plus, Minus, Tag, X } from 'lucide-react';
import { CartPageSkeleton } from '../components/Skeleton';
import { PRIMARY_PROMO_CODE } from '../lib/promoCodes';
import { productPath } from '../lib/productUrl';

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotal, getSubtotal, promoCode, discount, applyPromoCode, clearPromoCode, hasHydrated } = useCartStore();
  const [promoInput, setPromoInput] = React.useState('');
  const [promoError, setPromoError] = React.useState('');
  const navigate = useNavigate();

  const handleApplyPromo = () => {
    const success = applyPromoCode(promoInput);
    if (success) {
      setPromoInput('');
      setPromoError('');
    } else {
      setPromoError('Invalid promotion code');
    }
  };

  if (!hasHydrated) {
    return <CartPageSkeleton />;
  }

  if (items.length === 0) {
    return (
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center"
        role="status"
        aria-live="polite"
      >
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Looks like you haven&apos;t added any peptides to your cart yet.</p>
        <Link
          to="/shop"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, index) => (
            <div key={`${item.productId}-${item.specification}-${index}`} className="flex items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border border-gray-100">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <ProductImagePlaceholder
                    productId={item.productId}
                    title={item.title}
                    className="h-full w-full min-h-0"
                    compact
                  />
                )}
              </div>
              <div className="ml-6 flex-grow">
                <Link to={productPath({ title: item.title })} className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors">
                  {item.title}
                </Link>
                {item.specification && (
                  <div className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded uppercase tracking-wider">
                    Specification: {item.specification}
                  </div>
                )}
                <div className="text-blue-600 font-bold mt-1 text-base">{formatCurrency(item.price)}</div>
                <div className="flex items-center mt-4 space-x-6">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <button 
                      type="button"
                      onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1), item.specification)}
                      className="p-1 px-3 text-gray-600 hover:bg-gray-200 transition-colors border-r border-gray-200"
                      aria-label={`Decrease quantity of ${item.title}`}
                    >
                      <Minus className="h-4 w-4" aria-hidden />
                    </button>
                    <span className="px-5 py-1 text-sm font-bold text-gray-900" aria-live="polite">{item.quantity}</span>
                    <button 
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.specification)}
                      className="p-1 px-3 text-gray-600 hover:bg-gray-200 transition-colors border-l border-gray-200"
                      aria-label={`Increase quantity of ${item.title}`}
                    >
                      <Plus className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeItem(item.productId, item.specification)}
                    className="text-red-500 hover:text-red-700 text-sm font-semibold flex items-center transition-colors px-2 py-1 hover:bg-red-50 rounded-md"
                    aria-label={`Remove ${item.title} from cart`}
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" aria-hidden /> Remove
                  </button>
                </div>
              </div>
              <div className="text-xl font-black text-gray-900 ml-4">
                {formatCurrency(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-24">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Order Summary</h2>
          
          <div className="mb-6">
            <label htmlFor="cart-promo-code" className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Promo Code</label>
            <div className="flex gap-2">
              <input 
                id="cart-promo-code"
                type="text" 
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder={`Enter code (${PRIMARY_PROMO_CODE})`}
                className="flex-grow px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              />
              <button 
                type="button"
                onClick={handleApplyPromo}
                className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all active:scale-95"
              >
                Apply
              </button>
            </div>
            {promoError && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-tight">{promoError}</p>}
            {promoCode && (
              <div className="flex items-center justify-between mt-3 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                <div className="flex items-center">
                  <Tag className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm font-bold text-blue-700">{promoCode} Applied</span>
                </div>
                <button type="button" onClick={clearPromoCode} className="text-blue-400 hover:text-blue-600" aria-label="Remove promotion code">
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-gray-500 font-bold text-sm uppercase tracking-tight">
              <span>Subtotal</span>
              <span className="text-gray-900">{formatCurrency(getSubtotal())}</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between text-blue-600 font-bold text-sm uppercase tracking-tight">
                <span>Discount ({discount}%)</span>
                <span>-{formatCurrency((getSubtotal() * discount) / 100)}</span>
              </div>
            )}

            <div className="flex justify-between text-gray-500 font-bold text-sm uppercase tracking-tight">
              <span>Shipping</span>
              <span className="text-gray-400 italic text-xs">Calculated at checkout</span>
            </div>
            <div className="h-px bg-gray-100 my-4"></div>
            <div className="flex justify-between items-center">
               <span className="text-lg font-black text-gray-900 uppercase">Total</span>
               <span className="text-3xl font-black text-blue-600">{formatCurrency(getTotal())}</span>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => navigate('/checkout')}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 hover:shadow-blue-300 active:scale-[0.98]"
          >
            Checkout Now
          </button>
          <div className="mt-6 flex items-center justify-center gap-4 border-t border-gray-50 pt-6">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
              <span className="mr-1 text-blue-500">✔</span> Secure Shipping
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
              <span className="mr-1 text-blue-500">✔</span> Global Delivery
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
