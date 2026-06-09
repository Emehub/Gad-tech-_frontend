'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/stores/cart.store';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function CartPage() {
  const { cart, fetchCart, updateItem, removeItem, clearCart, applyCoupon, removeCoupon, isLoading } = useCartStore();
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      await applyCoupon(couponInput);
      toast.success('Coupon applied!');
      setCouponInput('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={80} className="mx-auto text-gray-200 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added any items to your cart yet.</p>
        <Link href="/products" className="inline-block bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart ({cart.itemCount} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 pb-2 border-b">
            <div className="col-span-5">Product</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-3 text-center">Quantity</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          {cart.items.map((item) => {
            const image = item.product.images?.[0]?.url;
            return (
              <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-4">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Product */}
                  <div className="col-span-12 sm:col-span-5 flex items-center gap-3">
                    <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                      {image && <Image src={image} alt={item.product.name} width={64} height={64} className="w-full h-full object-contain p-1" />}
                    </div>
                    <div className="min-w-0">
                      <Link href={`/products/${item.product.slug}`} className="text-sm font-medium text-gray-900 hover:text-green-600 line-clamp-2">{item.product.name}</Link>
                      {item.variant && <p className="text-xs text-gray-500 mt-0.5">{item.variant.name}: {item.variant.value}</p>}
                    </div>
                  </div>
                  {/* Price */}
                  <div className="col-span-4 sm:col-span-2 text-center">
                    <span className="text-sm font-medium text-gray-900">{formatPrice(item.price)}</span>
                  </div>
                  {/* Qty */}
                  <div className="col-span-5 sm:col-span-3 flex justify-center">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button onClick={() => updateItem(item.id, item.quantity - 1)} disabled={isLoading} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-l-lg"><Minus size={14} /></button>
                      <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateItem(item.id, item.quantity + 1)} disabled={isLoading || item.quantity >= item.product.stock} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-r-lg disabled:opacity-40"><Plus size={14} /></button>
                    </div>
                  </div>
                  {/* Total + delete */}
                  <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-2">
                    <span className="text-sm font-bold text-gray-900">{formatPrice(Number(item.price) * item.quantity)}</span>
                    <button onClick={() => removeItem(item.id)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex justify-between items-center pt-2">
            <Link href="/products" className="text-sm text-green-600 hover:underline font-medium">← Continue Shopping</Link>
            <button onClick={clearCart} className="text-sm text-gray-500 hover:text-green-600 flex items-center gap-1">
              <Trash2 size={14} /> Clear Cart
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-xl p-5 sticky top-24">
            <h2 className="font-bold text-lg mb-5 text-gray-900">Order Summary</h2>

            {/* Coupon */}
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5 block"><Tag size={14} /> Coupon Code</label>
              {cart.couponCode ? (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <span className="text-sm text-green-700 font-medium flex-1">{cart.couponCode} applied!</span>
                  <button onClick={removeCoupon} className="text-xs text-green-600 hover:underline">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} placeholder="Enter code" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 uppercase" />
                  <button onClick={handleApplyCoupon} disabled={couponLoading} className="bg-gray-900 text-white px-4 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50">Apply</button>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-3 text-sm border-t pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.itemCount} items)</span>
                <span className="font-medium">{formatPrice(cart.subtotal)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">-{formatPrice(cart.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-medium">{cart.shippingFee === 0 ? <span className="text-green-600 font-semibold">FREE</span> : formatPrice(cart.shippingFee)}</span>
              </div>
              {cart.shippingFee > 0 && (
                <p className="text-xs text-gray-400">Add {formatPrice(500 - cart.subtotal)} more for free shipping!</p>
              )}
              <div className="flex justify-between font-bold text-base border-t pt-3">
                <span>Total</span>
                <span className="text-green-600 text-lg">{formatPrice(cart.total)}</span>
              </div>
            </div>

            <Link href="/checkout" className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3.5 rounded-xl font-semibold hover:bg-green-700 transition-colors mt-5">
              Proceed to Checkout <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
