import { LocaleLink } from '../../i18n/LocaleLink';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, X } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { formatCurrency } from '../../lib/utils';
import { Button } from '../../design-system';
import { CartLineItem } from './CartLineItem';

const FREE_SHIPPING_THRESHOLD = 500;

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotal } = useCartStore();

  const cartLineCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = useCartStore.getState().getSubtotal();
  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const amountToFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm z-50"
            aria-hidden
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-elevated z-50 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between p-4 border-b border-brand-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-600" aria-hidden />
                <h2 className="font-display font-bold text-navy-950">Your cart</h2>
                <span className="bg-brand-100 text-brand-700 text-xs font-bold px-2 py-0.5 rounded-full tabular-nums">
                  {cartLineCount}
                </span>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="p-2 rounded-xl text-steel-600 hover:bg-brand-50 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-brand-50/80 border-b border-brand-100">
              <div className="flex justify-between text-xs font-medium text-steel-600 mb-2">
                <span>Free EU shipping</span>
                <span>
                  {amountToFreeShipping > 0
                    ? `${formatCurrency(amountToFreeShipping)} away`
                    : 'Unlocked'}
                </span>
              </div>
              <div className="w-full bg-brand-100 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                  className={`h-2 rounded-full ${progress === 100 ? 'bg-success' : 'bg-brand-500'}`}
                />
              </div>
              <p className="text-[10px] text-center mt-2 text-silver-400">
                Complimentary EU delivery on orders over {formatCurrency(FREE_SHIPPING_THRESHOLD)}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center" role="status">
                  <ShoppingBag className="w-12 h-12 text-brand-200 mb-4" aria-hidden />
                  <h3 className="font-display font-bold text-navy-950 mb-2">Cart is empty</h3>
                  <p className="text-steel-600 text-sm mb-6 max-w-[240px]">
                    Research compounds you add will appear here.
                  </p>
                  <Button onClick={closeCart}>Browse catalog</Button>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.div
                      key={`${item.productId}-${item.specification || 'default'}`}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <CartLineItem
                        item={item}
                        compact
                        onUpdateQuantity={(qty) =>
                          updateQuantity(item.productId, qty, item.specification)
                        }
                        onRemove={() => removeItem(item.productId, item.specification)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-4 border-t border-brand-100 bg-mist-50 shrink-0 space-y-3">
                <div className="flex justify-between font-semibold text-navy-950">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatCurrency(getTotal())}</span>
                </div>
                <p className="text-xs text-steel-600">Shipping &amp; VAT calculated at checkout.</p>
                <LocaleLink to="/checkout" onClick={closeCart}>
                  <Button fullWidth size="lg">
                    Checkout securely
                  </Button>
                </LocaleLink>
                <LocaleLink
                  to="/cart"
                  onClick={closeCart}
                  className="block text-center text-sm font-semibold text-brand-600 hover:text-brand-700"
                >
                  View full cart
                </LocaleLink>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
