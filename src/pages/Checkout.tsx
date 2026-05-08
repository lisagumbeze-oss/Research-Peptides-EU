import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatCurrency } from '../lib/utils';
import { supabase } from '../supabase';
import { CheckCircle, Loader2, Truck, Package, Globe, Shield, CreditCard, Landmark, Bitcoin, AlertCircle } from 'lucide-react';
import { europeanLocations } from '../data/europeanCountries';
import { postOrderCreatedEmail } from '../lib/transactionalEmailApi';
import { CheckoutSkeleton } from '../components/Skeleton';
import { PRIMARY_PROMO_CODE, PROMO_DISCOUNT_PERCENT, isValidPromoCode } from '../lib/promoCodes';

const SHIPPING_METHODS = {
  UK: [
    { id: 'rm24', name: 'Royal Mail 24', subtext: '1-2 Working Days', price: 4.50 },
    { id: 'rm_special', name: 'Royal Mail Special', subtext: '1 Working Day', price: 7.50 },
    { id: 'dpd_uk', name: 'DPD UK', subtext: '1-2 Working Days', price: 6.90 },
    { id: 'dpd_uk_sat', name: 'DPD UK (*Saturday Delivery)', subtext: 'Weekend Delivery', price: 9.50 },
  ],
  EUROPE: [
    { id: 'intl_eu', name: 'Europe Shipping', subtext: '3-7 Working Days', price: 15.50 }
  ],
  INTL: [
    { id: 'intl_row', name: 'International Shipping', subtext: '5-10 Working Days', price: 25.50 }
  ]
};

const EUROPEAN_COUNTRIES = Array.from(new Set(europeanLocations.map(l => l.country)));

export default function Checkout() {
  const { items, getTotal, getSubtotal, clearCart, hasHydrated } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [shipping, setShipping] = useState({
    fullName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    country: 'United Kingdom',
    postalCode: ''
  });
  const [selectedShippingId, setSelectedShippingId] = useState('rm24');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'crypto'>('crypto');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [lockedTotals, setLockedTotals] = useState<{
    subtotal: number;
    promoDiscount: number;
    cryptoDiscount: number;
    shippingCost: number;
    finalTotal: number;
  } | null>(null);

  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [showPromo, setShowPromo] = useState(false);
  const [shippingErrors, setShippingErrors] = useState<Record<string, string>>({});
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});

  // Sync email if user logs in/out
  React.useEffect(() => {
    if (user?.email) {
      setShipping(s => ({ ...s, email: user.email }));
    }
  }, [user]);

  if (!hasHydrated) {
    return <CheckoutSkeleton />;
  }

  if (items.length === 0) {
    if (placedOrderId) {
      // Keep on screen if we just finished
    } else {
      navigate('/cart');
      return null;
    }
  }

  // Get available methods based on country and total
  const getAvailableMethods = () => {
    const subtotal = getSubtotal();
    let baseMethods = [];
    let threshold = 500;

    if (shipping.country === 'United Kingdom') {
      baseMethods = SHIPPING_METHODS.UK;
      threshold = 500;
    } else if (EUROPEAN_COUNTRIES.includes(shipping.country)) {
      baseMethods = SHIPPING_METHODS.EUROPE;
      threshold = 500;
    } else {
      baseMethods = SHIPPING_METHODS.INTL;
      threshold = 1000;
    }

    if (subtotal >= threshold) {
      return [
        { id: 'free', name: 'Free Shipping', subtext: 'Complimentary Delivery', price: 0 },
        ...baseMethods
      ];
    }
    return baseMethods;
  };

  const availableMethods = getAvailableMethods();
  
  // Auto-select Free Shipping if it becomes available, or keep current selection if still valid
  React.useEffect(() => {
    const hasFree = availableMethods.find(m => m.id === 'free');
    if (hasFree && selectedShippingId !== 'free') {
      setSelectedShippingId('free');
    } else if (!availableMethods.find(m => m.id === selectedShippingId)) {
      setSelectedShippingId(availableMethods[0].id);
    }
  }, [availableMethods.length, shipping.country]);

  const selectedMethod = availableMethods.find(m => m.id === selectedShippingId) || availableMethods[0];
  const shippingCost = selectedMethod.price;
  
  const subtotalValue = getSubtotal();
  const promoDiscountValue = Math.min(appliedDiscount, subtotalValue);
  // Calculate crypto discount after promo discount is applied.
  const cryptoDiscount = paymentMethod === 'crypto' ? (subtotalValue - promoDiscountValue) * 0.05 : 0;
  const finalTotalValue = subtotalValue - promoDiscountValue - cryptoDiscount + shippingCost;

  const applyPromo = () => {
    if (isValidPromoCode(promoCode)) {
      const discount = getSubtotal() * (PROMO_DISCOUNT_PERCENT / 100);
      setAppliedDiscount(discount);
      setPromoError('');
    } else {
      setPromoError(`Invalid code. Try ${PRIMARY_PROMO_CODE}`);
      setAppliedDiscount(0);
    }
  };

  const focusField = (id: string) => {
    const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
    el?.focus();
  };

  const validateShippingStep = () => {
    const errors: Record<string, string> = {};
    if (!shipping.email.trim()) errors.email = 'Email is required.';
    if (!shipping.fullName.trim()) errors.fullName = 'Full name is required.';
    if (!shipping.phone.trim()) errors.phone = 'Phone number is required.';
    if (!shipping.address.trim()) errors.address = 'Street address is required.';
    if (!shipping.city.trim()) errors.city = 'City is required.';
    if (!shipping.postalCode.trim()) errors.postalCode = 'Postal code is required.';
    if (!shipping.country.trim()) errors.country = 'Country is required.';
    if (!selectedShippingId) errors.shippingMethod = 'Please select a shipping method.';
    setShippingErrors(errors);
    if (Object.keys(errors).length > 0) {
      const firstKey = Object.keys(errors)[0];
      const idMap: Record<string, string> = {
        email: 'checkout-email',
        fullName: 'checkout-full-name',
        phone: 'checkout-phone',
        address: 'checkout-address-line',
        city: 'checkout-city',
        postalCode: 'checkout-postal',
        country: 'checkout-country',
        shippingMethod: 'checkout-shipping-method-legend',
      };
      focusField(idMap[firstKey] || 'checkout-email');
      return false;
    }
    return true;
  };

  const validatePaymentStep = () => {
    const errors: Record<string, string> = {};
    if (!paymentMethod) errors.paymentMethod = 'Please select a payment method.';
    if (paymentMethod === 'card') {
      if (!cardDetails.number.trim()) errors.cardNumber = 'Card number is required.';
      if (!cardDetails.expiry.trim()) errors.cardExpiry = 'Expiry is required.';
      if (!cardDetails.cvc.trim()) errors.cardCvc = 'CVV is required.';
      if (!cardDetails.name.trim()) errors.cardName = 'Cardholder name is required.';
    }
    setPaymentErrors(errors);
    if (Object.keys(errors).length > 0) {
      if (errors.cardNumber) focusField('checkout-card-number');
      else if (errors.cardExpiry) focusField('checkout-card-expiry');
      else if (errors.cardCvc) focusField('checkout-card-cvc');
      else if (errors.cardName) focusField('checkout-card-name');
      return false;
    }
    return true;
  };

  const handleContinueToPayment = () => {
    if (!validateShippingStep()) return;
    setStep(2);
  };

  const handleConfirmPaymentChoice = () => {
    if (!validatePaymentStep()) return;
    setStep(3);
  };

  const handleOrderSubmit = async () => {
    if (!validateShippingStep()) {
      setStep(1);
      return;
    }
    if (!validatePaymentStep()) {
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    
    let createdOrderId: string | null = null;
    try {
      setLockedTotals({
        subtotal: subtotalValue,
        promoDiscount: promoDiscountValue,
        cryptoDiscount,
        shippingCost,
        finalTotal: finalTotalValue
      });
      setCheckoutMessage('');

      // NOTE: We wrap non-schema columns (payment_method, crypto_discount) inside shipping_address JSON
      // to avoid Supabase errors until columns are officially added to the database.
      const orderData = {
        user_id: user?.id || null, // Allow null for Guest Checkout
        items: items,
        total_amount: finalTotalValue,
        status: paymentMethod === 'card' ? 'processing' : 'pending',
        shipping_address: {
          ...shipping,
          payment_method: paymentMethod,
          crypto_discount: cryptoDiscount,
          shipping_method: selectedMethod.name,
          shipping_cost: shippingCost
        }
      };
      
      // 1. Insert order to Supabase
      const { data: orderResponse, error } = await supabase.from('orders').insert([orderData]).select().single();
      if (error) throw error;
      const orderId = orderResponse.id;
      createdOrderId = orderId;
      setPlacedOrderId(orderId);

      let emailDispatchFailed = false;
      try {
        await postOrderCreatedEmail(orderId);
      } catch (emailError) {
        console.error('Order email trigger failed', emailError);
        emailDispatchFailed = true;
      }

      // Supabase-only payment flow (no external API URL dependency).
      if (emailDispatchFailed) {
        setCheckoutMessage('Order placed, but one or more transactional emails failed. Please contact support with your order ID.');
      } else if (paymentMethod === 'crypto') {
        setCheckoutMessage('Order created successfully. Admin and customer emails were sent. Crypto payment instructions will follow by email.');
      } else if (paymentMethod === 'card') {
        setCheckoutMessage('Order created successfully. Admin and customer emails were sent. Card payment is queued for manual billing review.');
      } else {
        setCheckoutMessage('Order created successfully. Admin and customer emails were sent. Bank transfer instructions will follow by email.');
      }
      clearCart();
      setStep(4);

    } catch (error: any) {
      console.error("Order submission failed:", error);
      if (createdOrderId) {
        setPlacedOrderId(createdOrderId);
        setCheckoutMessage('Order saved successfully. Please use your order ID for support and payment follow-up.');
        clearCart();
        setStep(4);
      } else {
        const fallbackMessage = 'Failed to process order. Please try again.';
        alert(`Failed to process order: ${error?.message || fallbackMessage}`);
      }
      // Don't set step to 4 on hard errors unless we want to show a failure state
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="mb-8">Secure Checkout</h1>
      
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-12 max-w-2xl mx-auto">
        {[
          { id: 1, name: 'Shipping' },
          { id: 2, name: 'Payment' },
          { id: 3, name: 'Confirm' }
        ].map((s) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${step >= s.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {step > s.id ? <CheckCircle className="w-6 h-6" /> : s.id}
              </div>
              <span className={`text-[10px] uppercase tracking-widest font-black mt-2 ${step >= s.id ? 'text-blue-600' : 'text-gray-400'}`}>
                {s.name}
              </span>
            </div>
            {s.id < 3 && (
              <div className="flex-1 h-[2px] bg-gray-100 mx-4 self-center -mt-6">
                <div className={`h-full bg-blue-600 transition-all duration-500 ${step > s.id ? 'w-full' : 'w-0'}`} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 sm:p-10 rounded-[2rem] shadow-sm border border-gray-100 min-h-[500px]">
            {step === 1 && (
              <div className="space-y-8">
                <h2 className="text-2xl font-black text-gray-900">Shipping Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="checkout-email" className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
                    <input id="checkout-email" required type="email" value={shipping.email} onChange={e => setShipping({...shipping, email: e.target.value})} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900" placeholder="researcher@university.edu" disabled={!!user} autoComplete="email" />
                    {user && <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Locked to account email</p>}
                    {shippingErrors.email && <p className="mt-1 text-xs font-semibold text-red-600">{shippingErrors.email}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="checkout-full-name" className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
                    <input id="checkout-full-name" required type="text" value={shipping.fullName} onChange={e => setShipping({...shipping, fullName: e.target.value})} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900" placeholder="John Doe" autoComplete="name" />
                    {shippingErrors.fullName && <p className="mt-1 text-xs font-semibold text-red-600">{shippingErrors.fullName}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="checkout-phone" className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Phone Number</label>
                    <input id="checkout-phone" required type="tel" value={shipping.phone} onChange={e => setShipping({...shipping, phone: e.target.value})} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900" placeholder="+44 7700 900000" autoComplete="tel" />
                    {shippingErrors.phone && <p className="mt-1 text-xs font-semibold text-red-600">{shippingErrors.phone}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="checkout-address-line" className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Street Address</label>
                    <input id="checkout-address-line" required type="text" value={shipping.address} onChange={e => setShipping({...shipping, address: e.target.value})} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900" placeholder="123 Research Way" autoComplete="street-address" />
                    {shippingErrors.address && <p className="mt-1 text-xs font-semibold text-red-600">{shippingErrors.address}</p>}
                  </div>
                  <div>
                    <label htmlFor="checkout-city" className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">City</label>
                    <input id="checkout-city" required type="text" value={shipping.city} onChange={e => setShipping({...shipping, city: e.target.value})} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900" placeholder="London" autoComplete="address-level2" />
                    {shippingErrors.city && <p className="mt-1 text-xs font-semibold text-red-600">{shippingErrors.city}</p>}
                  </div>
                  <div>
                    <label htmlFor="checkout-postal" className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Postal Code</label>
                    <input id="checkout-postal" required type="text" value={shipping.postalCode} onChange={e => setShipping({...shipping, postalCode: e.target.value})} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900" placeholder="SW1A 1AA" autoComplete="postal-code" />
                    {shippingErrors.postalCode && <p className="mt-1 text-xs font-semibold text-red-600">{shippingErrors.postalCode}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="checkout-country" className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Country</label>
                    <select id="checkout-country" value={shipping.country} onChange={e => setShipping({...shipping, country: e.target.value})} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900 appearance-none cursor-pointer" autoComplete="country-name">
                      <option value="United Kingdom">United Kingdom</option>
                      <optgroup label="Europe">
                        {EUROPEAN_COUNTRIES.filter(c => c !== 'United Kingdom').sort().map(c => <option key={c} value={c}>{c}</option>)}
                      </optgroup>
                      <optgroup label="Rest of World">
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="Other">Other International</option>
                      </optgroup>
                    </select>
                    {shippingErrors.country && <p className="mt-1 text-xs font-semibold text-red-600">{shippingErrors.country}</p>}
                  </div>
                </div>

                <fieldset className="space-y-4 pt-4 border-0 border-t border-gray-100 min-w-0">
                  <legend id="checkout-shipping-method-legend" className="text-xs font-black uppercase tracking-widest text-gray-400 px-0">
                    Select Shipping Service
                  </legend>
                  <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-labelledby="checkout-shipping-method-legend">
                    {availableMethods.map((m) => (
                      <button key={m.id} type="button" role="radio" aria-checked={selectedShippingId === m.id} onClick={() => setSelectedShippingId(m.id)} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${selectedShippingId === m.id ? 'border-blue-600 bg-blue-50/50' : 'border-gray-50 bg-gray-50/50 hover:border-gray-200'}`}>
                        <div className="flex items-center gap-4 text-left">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedShippingId === m.id ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                            {selectedShippingId === m.id && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900">{m.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">{m.subtext}</p>
                          </div>
                        </div>
                        <span className="text-sm font-black text-gray-900">{formatCurrency(m.price)}</span>
                      </button>
                    ))}
                  </div>
                  {shippingErrors.shippingMethod && <p className="text-xs font-semibold text-red-600">{shippingErrors.shippingMethod}</p>}
                </fieldset>

                <button type="button" onClick={handleContinueToPayment} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl shadow-gray-200">
                  Continue to Payment
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 id="checkout-payment-heading" className="text-2xl font-black text-gray-900">Payment Method</h2>
                  <button type="button" onClick={() => setStep(1)} className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">Edit Shipping</button>
                </div>

                <div className="grid grid-cols-1 gap-4" role="radiogroup" aria-labelledby="checkout-payment-heading">
                  {[
                    { id: 'crypto', name: 'Cryptocurrency', icon: Bitcoin, subtext: 'Pay with BTC, ETH, USDT (+5% OFF)', badge: 'Save 5%' },
                    { id: 'card', name: 'Credit / Debit Card', icon: CreditCard, subtext: 'Secure Manual Processing' },
                    { id: 'bank', name: 'Bank Transfer', icon: Landmark, subtext: 'Direct Structural Payment' },
                  ].map((method) => (
                    <button key={method.id} type="button" role="radio" aria-checked={paymentMethod === method.id} onClick={() => setPaymentMethod(method.id as 'card' | 'bank' | 'crypto')} className={`relative flex items-center gap-5 p-6 rounded-[2rem] border-2 transition-all ${paymentMethod === method.id ? 'border-blue-600 bg-blue-50/30' : 'border-gray-50 bg-gray-50/30 hover:border-gray-200'}`}>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${paymentMethod === method.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-400 border border-gray-100'}`}>
                        <method.icon className="w-8 h-8" aria-hidden />
                      </div>
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2">
                           <span className="text-lg font-black text-gray-900">{method.name}</span>
                           {method.badge && <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">{method.badge}</span>}
                        </div>
                        <p className="text-xs font-bold text-gray-400">{method.subtext}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === method.id ? 'border-blue-600 bg-blue-600' : 'border-gray-200'}`}>
                        {paymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />}
                      </div>
                    </button>
                  ))}
                </div>
                {paymentErrors.paymentMethod && <p className="text-xs font-semibold text-red-600">{paymentErrors.paymentMethod}</p>}

                <button type="button" onClick={handleConfirmPaymentChoice} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl shadow-gray-200">
                  Confirm Payment Choice
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-gray-900">Final Confirmation</h2>
                  <button type="button" onClick={() => setStep(2)} className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">Change Method</button>
                </div>

                {paymentMethod === 'card' && (
                  <fieldset className="space-y-6 border-0 min-w-0 p-0">
                    <legend className="sr-only">Card payment details</legend>
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" aria-hidden />
                      <p className="text-xs font-bold text-blue-900 leading-relaxed">
                        Card payments are processed manually. Your details will be securely sent to our billing team for review. 
                        Your order status will update to <span className="underline">Processing</span> immediately.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="checkout-card-number" className="sr-only">Card number</label>
                        <input id="checkout-card-number" type="text" placeholder="Card Number" value={cardDetails.number} onChange={e => setCardDetails({...cardDetails, number: e.target.value})} className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-bold text-gray-900" autoComplete="cc-number" />
                        {paymentErrors.cardNumber && <p className="mt-1 text-xs font-semibold text-red-600">{paymentErrors.cardNumber}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="checkout-card-expiry" className="sr-only">Expiry (MM/YY)</label>
                          <input id="checkout-card-expiry" type="text" placeholder="MM/YY" value={cardDetails.expiry} onChange={e => setCardDetails({...cardDetails, expiry: e.target.value})} className="p-4 bg-gray-50 border-none rounded-2xl outline-none font-bold text-gray-900 w-full" autoComplete="cc-exp" />
                          {paymentErrors.cardExpiry && <p className="mt-1 text-xs font-semibold text-red-600">{paymentErrors.cardExpiry}</p>}
                        </div>
                        <div>
                          <label htmlFor="checkout-card-cvc" className="sr-only">Security code (CVV)</label>
                          <input id="checkout-card-cvc" type="text" placeholder="CVV" value={cardDetails.cvc} onChange={e => setCardDetails({...cardDetails, cvc: e.target.value})} className="p-4 bg-gray-50 border-none rounded-2xl outline-none font-bold text-gray-900 w-full" autoComplete="cc-csc" />
                          {paymentErrors.cardCvc && <p className="mt-1 text-xs font-semibold text-red-600">{paymentErrors.cardCvc}</p>}
                        </div>
                      </div>
                      <div>
                        <label htmlFor="checkout-card-name" className="sr-only">Cardholder name</label>
                        <input id="checkout-card-name" type="text" placeholder="Cardholder Name" value={cardDetails.name} onChange={e => setCardDetails({...cardDetails, name: e.target.value})} className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-bold text-gray-900" autoComplete="cc-name" />
                        {paymentErrors.cardName && <p className="mt-1 text-xs font-semibold text-red-600">{paymentErrors.cardName}</p>}
                      </div>
                    </div>
                  </fieldset>
                )}

                {paymentMethod === 'bank' && (
                  <div className="bg-gray-50 p-8 rounded-[2rem] text-center space-y-4">
                    <Landmark className="w-16 h-16 text-gray-900 mx-auto opacity-20" />
                    <div>
                      <h3 className="text-xl font-black text-gray-900">Awaiting Connection</h3>
                      <p className="text-sm font-bold text-gray-500 mt-2">
                        After placing your order, an administrator will contact you at <span className="text-blue-600">{shipping.email}</span> with structured payment instructions.
                      </p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'crypto' && (
                  <div className="bg-orange-50 p-8 rounded-[2rem] text-center space-y-4 border border-orange-100">
                    <Bitcoin className="w-16 h-16 text-orange-500 mx-auto" />
                    <div>
                      <h3 className="text-xl font-black text-gray-900">Crypto Efficiency Discount</h3>
                      <p className="text-sm font-bold text-orange-800 mt-2">
                        You have unlocked a 5% discount for choosing a cryptographically secure payment method.
                        Total Saved: <span className="font-black underline">{formatCurrency(cryptoDiscount)}</span>
                      </p>
                    </div>
                  </div>
                )}

                <button type="button" onClick={handleOrderSubmit} disabled={isSubmitting} className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3">
                  {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" aria-hidden /> : 'Complete Secure Purchase'}
                </button>
              </div>
            )}

            {step === 4 && (
              <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <CheckCircle className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-black text-gray-900">Research Order Secured</h2>
                <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 max-w-xs mx-auto">
                   <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Order Identification</p>
                   <p className="text-lg font-black text-blue-600 select-all tracking-wider">{placedOrderId || 'Processing...'}</p>
                </div>
                <p className="text-gray-500 mt-6 max-w-sm mx-auto font-medium">
                  {paymentMethod === 'bank' 
                    ? "An admin will contact you shortly via email with transfer details." 
                    : "Your order is now being processed by our analytical team."}
                </p>
                {checkoutMessage && (
                  <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mt-4 text-sm font-semibold max-w-lg mx-auto">
                    {checkoutMessage}
                  </p>
                )}
                <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                  {user ? (
                    <button type="button" onClick={() => navigate('/orders')} className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-black transition-all">
                      View My History
                    </button>
                  ) : (
                    <div className="p-4 bg-blue-50 rounded-2xl text-blue-900 text-[10px] font-bold max-w-xs mx-auto border border-blue-100">
                      Please save your Order ID above. Since you checked out as a guest, this is your primary reference for correspondence.
                    </div>
                  )}
                  <button type="button" onClick={() => navigate('/')} className="bg-white text-gray-900 border-2 border-gray-100 px-10 py-4 rounded-2xl font-black hover:bg-gray-50 transition-all">
                    Continue Research
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar / Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Price Synthesis</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-bold text-gray-500">
                <span>Subtotal</span>
                <span>{formatCurrency(lockedTotals?.subtotal ?? subtotalValue)}</span>
              </div>
              {(lockedTotals?.promoDiscount ?? promoDiscountValue) > 0 && (
                <div className="flex justify-between text-sm font-black text-emerald-500">
                  <span>Promo Discount</span>
                  <span>-{formatCurrency(lockedTotals?.promoDiscount ?? promoDiscountValue)}</span>
                </div>
              )}
              {(lockedTotals?.cryptoDiscount ?? cryptoDiscount) > 0 && (
                <div className="flex justify-between text-sm font-black text-orange-500">
                  <span>Crypto Incentive (5%)</span>
                  <span>-{formatCurrency(lockedTotals?.cryptoDiscount ?? cryptoDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-gray-500">
                <span>Logistic Costs</span>
                <span>{formatCurrency(lockedTotals?.shippingCost ?? shippingCost)}</span>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                <span className="text-sm font-black text-gray-900 uppercase">Total Payable</span>
                <span className="text-2xl font-black text-blue-600 leading-none">{formatCurrency(lockedTotals?.finalTotal ?? finalTotalValue)}</span>
              </div>
            </div>

            {step < 3 && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                {!showPromo ? (
                   <button type="button" onClick={() => setShowPromo(true)} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Apply Reference Code?</button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <label htmlFor="checkout-promo-code" className="sr-only">Promotion code</label>
                      <input id="checkout-promo-code" type="text" placeholder={PRIMARY_PROMO_CODE} value={promoCode} onChange={e => setPromoCode(e.target.value)} className="flex-1 p-3 bg-gray-50 border-none rounded-xl outline-none text-xs font-black" />
                      <button type="button" onClick={applyPromo} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Apply</button>
                    </div>
                    {promoError && <p className="text-[10px] text-red-500 font-bold">{promoError}</p>}
                    {appliedDiscount > 0 && <p className="text-[10px] text-emerald-500 font-bold">✓ Reference Code Accepted</p>}
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 grid grid-cols-2 gap-3">
               <div className="bg-gray-50 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                  <Shield className="w-5 h-5 text-blue-600 mb-1" />
                  <p className="text-[8px] font-black uppercase text-gray-900">SSL Secure</p>
               </div>
               <div className="bg-gray-50 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mb-1" />
                  <p className="text-[8px] font-black uppercase text-gray-900">Protected</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
