import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { Link } from 'react-router-dom';
import { ProductImagePlaceholder } from '../products/ProductImagePlaceholder';
import { formatCurrency } from '../../lib/utils';

const FREE_SHIPPING_THRESHOLD = 500;

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal, getTotal, addItem } = useCartStore();

  const cartLineCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = getSubtotal();
  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const amountToFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Cart</h2>
                <span
                  className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-indigo-900 dark:text-indigo-300 tabular-nums"
                  aria-label={`${cartLineCount} items in cart`}
                >
                  {cartLineCount}
                </span>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">Free UK/EU Shipping</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {amountToFreeShipping > 0
                    ? `${formatCurrency(amountToFreeShipping)} away`
                    : 'Unlocked!'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`h-2.5 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-indigo-600'}`} 
                />
              </div>
              <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">
                *International shipping is free over £1000
              </p>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col h-full">
                  <div
                    className="flex-grow flex flex-col items-center justify-center p-8 space-y-4 text-center"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2">
                      <ShoppingBag className="w-10 h-10 text-gray-300 dark:text-gray-700" aria-hidden />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">Your cart is empty</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-[240px]">
                      Research compounds and lab essentials will appear here once added.
                    </p>
                    <button
                      type="button"
                      onClick={closeCart}
                      className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    >
                      Start Shopping
                    </button>
                  </div>

                  {/* Discover Essentials Section */}
                  <div className="p-6 bg-gray-50 dark:bg-gray-800/30 border-t dark:border-gray-800 rounded-t-[2.5rem]">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-4">Discover Essentials</h4>
                    <div className="space-y-3">
                      {[
                        { id: 'BAC-WATER', title: 'Bacteriostatic Water 10ml', price: 12.99, image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=200&h=200&fit=crop' },
                        { id: 'ALC-SWABS', title: 'Alcohol Prep Pads (100pk)', price: 8.50, image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=200&h=200&fit=crop' }
                      ].map((essential) => (
                        <div key={essential.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                          <img src={essential.image} className="w-12 h-12 rounded-xl object-cover" alt="" />
                          <div className="flex-1">
                            <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{essential.title}</p>
                            <p className="text-xs font-black text-blue-600 mt-0.5">{formatCurrency(essential.price)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => addItem({
                              productId: essential.id,
                              title: essential.title,
                              price: essential.price,
                              quantity: 1,
                              imageUrl: essential.image
                            })}
                            className="p-2 bg-gray-50 dark:bg-gray-800 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            aria-label={`Add ${essential.title} to cart`}
                          >
                            <Plus className="h-4 w-4" aria-hidden />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.div
                      key={`${item.productId}-${item.specification || 'default'}`}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      className="flex space-x-4 py-2"
                    >
                      {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded-lg border dark:border-gray-800"
                      />
                      ) : (
                        <ProductImagePlaceholder
                          productId={item.productId}
                          title={item.title}
                          className="h-20 w-20 shrink-0 rounded-lg border border-gray-100 dark:border-gray-800"
                          compact
                        />
                      )}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                              {item.title}
                            </h3>
                            <button
                              type="button"
                              onClick={() => removeItem(item.productId, item.specification)}
                              className="text-gray-400 hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                              aria-label={`Remove ${item.title} from cart`}
                            >
                              <Trash2 className="w-4 h-4" aria-hidden />
                            </button>
                          </div>
                          {item.specification && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.specification}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border dark:border-gray-700 rounded-md">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1), item.specification)}
                              className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                              aria-label={`Decrease quantity of ${item.title}`}
                            >
                              <Minus className="w-3 h-3" aria-hidden />
                            </button>
                            <input 
                              type="number" 
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.productId, Math.max(1, parseInt(e.target.value) || 1), item.specification)}
                              className="w-10 text-center text-sm font-medium text-gray-900 dark:text-white bg-transparent border-x dark:border-gray-700 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1, item.specification)}
                              className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                              aria-label={`Increase quantity of ${item.title}`}
                            >
                              <Plus className="w-3 h-3" aria-hidden />
                            </button>
                          </div>
                          <span className="font-bold text-gray-900 dark:text-white tabular-nums">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {/* You May Also Like Section (Based on Screenshot) */}
              {items.length > 0 && (
                <div className="mt-8 pt-8 border-t dark:border-gray-800">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">You May Also Like</h3>
                  <div className="space-y-8">
                    {[
                      { 
                        id: 'BPC-TB-BLEND', 
                        title: 'BPC 5mg + TB 5mg', 
                        price: '£40.00', 
                        rawPrice: 40.00,
                        image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=200&h=200&fit=crop' 
                      },
                      { 
                        id: 'GHK-CU', 
                        title: 'GHK-CU', 
                        price: '£25.99 – £40.00', 
                        rawPrice: 25.99,
                        image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=200&h=200&fit=crop' 
                      }
                    ].map((upsell) => (
                      <div key={upsell.id} className="flex gap-6 items-center">
                        <div className="relative group">
                          <img 
                            src={upsell.image} 
                            className="w-24 h-24 rounded-2xl object-cover shadow-sm transition-transform group-hover:scale-105" 
                            alt="" 
                          />
                          {upsell.id === 'GHK-CU' && (
                            <div className="absolute top-1 left-1 bg-white/80 backdrop-blur-sm p-1 rounded-full shadow-sm">
                              <Plus className="h-3 w-3 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <h4 className="font-bold text-gray-900 dark:text-white">{upsell.title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{upsell.price}</p>
                          <button
                            type="button"
                            onClick={() => addItem({
                              productId: upsell.id,
                              title: upsell.title,
                              price: upsell.rawPrice,
                              quantity: 1,
                              imageUrl: upsell.image
                            })}
                            className="mt-2 bg-blue-600 dark:bg-indigo-600 text-white px-8 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:bg-blue-700 dark:hover:bg-indigo-500 transition-all active:scale-95 shadow-md shadow-blue-100 dark:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                            aria-label={`Add ${upsell.title} to cart`}
                          >
                            ADD
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-900 shrink-0">
                <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white mb-4">
                  <p>Subtotal</p>
                  <p className="tabular-nums">{formatCurrency(getTotal())}</p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Shipping and taxes calculated at checkout.
                </p>
                <div className="space-y-3">
                  <Link
                    to="/checkout"
                    onClick={closeCart}
                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:scale-[1.02]"
                  >
                    Checkout securely
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
