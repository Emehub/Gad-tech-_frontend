'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/stores/cart.store';
import { formatPrice } from '@/lib/utils';

export function CartDrawer() {
  const { cart, isOpen, closeCart, updateItem, removeItem, fetchCart } = useCartStore();

  useEffect(() => {
    if (isOpen) fetchCart();
  }, [isOpen, fetchCart]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 transition-opacity" onClick={closeCart} />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-green-600" />
            <h2 className="font-bold text-lg">Shopping Cart</h2>
            {cart && cart.itemCount > 0 && (
              <span className="bg-green-100 text-green-600 text-xs font-semibold px-2 py-0.5 rounded-full">{cart.itemCount}</span>
            )}
          </div>
          <button onClick={closeCart} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag size={64} className="text-gray-200" />
              <h3 className="font-semibold text-gray-700">Your cart is empty</h3>
              <p className="text-sm text-gray-500">Add some items to get started!</p>
              <Link
                href="/products"
                onClick={closeCart}
                className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-green-700 transition-colors"
              >
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => {
                const image = item.product.images?.[0]?.url;
                return (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {image ? (
                        <Image src={image} alt={item.product.name} width={80} height={80} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingBag size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.product.slug}`}
                        onClick={closeCart}
                        className="text-sm font-medium text-gray-900 hover:text-green-600 line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      {item.variant && (
                        <p className="text-xs text-gray-500 mt-0.5">{item.variant.name}: {item.variant.value}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button
                            onClick={() => updateItem(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-l-lg transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateItem(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-r-lg transition-colors disabled:opacity-40"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">
                            {formatPrice(Number(item.price) * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div className="border-t px-5 py-4 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(cart.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{cart.shippingFee === 0 ? <span className="text-green-600">Free</span> : formatPrice(cart.shippingFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>Total</span>
                <span className="text-green-600">{formatPrice(cart.total)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/cart"
                onClick={closeCart}
                className="text-center py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                View Cart
              </Link>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="text-center py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
