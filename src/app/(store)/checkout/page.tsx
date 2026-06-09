'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { useCreateOrder, useInitializePayment } from '@/hooks/useOrders';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { Address } from '@/types';
import { MapPin, Plus, CreditCard, Truck, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, fetchCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PAYSTACK');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<'address' | 'payment' | 'review'>('address');

  const createOrder = useCreateOrder();
  const initializePayment = useInitializePayment();

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login?redirect=/checkout'); return; }
    fetchCart();
    api.get('/users/addresses').then(({ data }) => {
      setAddresses(data.data ?? []);
      const def = data.data?.find((a: Address) => a.isDefault);
      if (def) setSelectedAddressId(def.id);
      else if (data.data?.length > 0) setSelectedAddressId(data.data[0].id);
    });
  }, [isAuthenticated, router, fetchCart]);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">Your cart is empty.</p>
        <Link href="/products" className="bg-green-600 text-white px-6 py-2.5 rounded-lg">Shop Now</Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) { toast.error('Please select a delivery address'); return; }
    try {
      const order = await createOrder.mutateAsync({ addressId: selectedAddressId, paymentMethod, notes });
      if (paymentMethod === 'PAYSTACK') {
        const payment = await initializePayment.mutateAsync(order.data.id);
        window.location.href = payment.data.authorizationUrl;
      } else {
        toast.success('Order placed successfully!');
        router.push(`/account/orders`);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to place order');
    }
  };

  const isLoading = createOrder.isPending || initializePayment.isPending;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {(['address', 'payment', 'review'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step === s ? 'bg-green-600 text-white' : s < step ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {i + 1}
            </div>
            <span className={`text-sm font-medium capitalize hidden sm:block ${step === s ? 'text-gray-900' : 'text-gray-400'}`}>{s}</span>
            {i < 2 && <div className="w-8 sm:w-16 h-px bg-gray-200 mx-1" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Address */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-4"><MapPin size={20} className="text-green-600" /> Delivery Address</h2>
            {addresses.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-3">No saved addresses. Add one to continue.</p>
                <Link href="/account/addresses" className="text-green-600 font-medium hover:underline flex items-center justify-center gap-1"><Plus size={16} /> Add Address</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label key={addr.id} className={`flex items-start gap-3 border-2 rounded-xl p-4 cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-gray-300'}`}>
                    <input type="radio" name="address" value={addr.id} checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} className="mt-1 accent-green-600" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900">{addr.fullName}</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{addr.label}</span>
                        {addr.isDefault && <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Default</span>}
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{addr.street}, {addr.city}, {addr.region}</p>
                      <p className="text-sm text-gray-500">{addr.phone}</p>
                    </div>
                  </label>
                ))}
                <Link href="/account/addresses" className="text-sm text-green-600 font-medium hover:underline flex items-center gap-1"><Plus size={14} /> Add new address</Link>
              </div>
            )}
          </div>

          {/* Step 2: Payment */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-4"><CreditCard size={20} className="text-green-600" /> Payment Method</h2>
            <div className="space-y-3">
              {[{ id: 'PAYSTACK', label: 'Pay Online', desc: 'Card, Mobile Money via Paystack', icon: '💳' }, { id: 'CASH_ON_DELIVERY', label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: '💵' }].map((m) => (
                <label key={m.id} className={`flex items-center gap-3 border-2 rounded-xl p-4 cursor-pointer transition-colors ${paymentMethod === m.id ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} className="accent-green-600" />
                  <span className="text-2xl">{m.icon}</span>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{m.label}</p>
                    <p className="text-xs text-gray-500">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="font-bold text-base mb-3 text-gray-900">Order Notes (optional)</h2>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Special instructions for delivery..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500 resize-none" />
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-xl p-5 sticky top-24">
            <h2 className="font-bold text-lg text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 max-h-56 overflow-y-auto mb-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm gap-2">
                  <span className="text-gray-700 line-clamp-2 flex-1">{item.product.name} × {item.quantity}</span>
                  <span className="font-medium shrink-0">{formatPrice(Number(item.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(cart.subtotal)}</span></div>
              {cart.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(cart.discount)}</span></div>}
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{cart.shippingFee === 0 ? <span className="text-green-600 font-semibold">FREE</span> : formatPrice(cart.shippingFee)}</span></div>
              <div className="flex justify-between font-bold text-base text-gray-900 border-t pt-2">
                <span>Total</span><span className="text-green-600 text-lg">{formatPrice(cart.total)}</span>
              </div>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={isLoading || !selectedAddressId}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3.5 rounded-xl font-semibold hover:bg-green-700 transition-colors mt-5 disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
              {paymentMethod === 'PAYSTACK' ? 'Pay Now' : 'Place Order'}
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">Your data is secured with SSL encryption</p>
          </div>
        </div>
      </div>
    </div>
  );
}
