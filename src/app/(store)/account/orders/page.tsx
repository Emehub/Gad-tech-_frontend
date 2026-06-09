'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ChevronRight, Eye, X, Loader2 } from 'lucide-react';
import { useOrders, useCancelOrder } from '@/hooks/useOrders';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import { Order, OrderStatus } from '@/types';
import { toast } from 'sonner';

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING:    'bg-yellow-100 text-yellow-700',
  CONFIRMED:  'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED:    'bg-indigo-100 text-indigo-700',
  DELIVERED:  'bg-green-100 text-green-700',
  CANCELLED:  'bg-red-100 text-red-700',
  REFUNDED:   'bg-gray-100 text-gray-700',
};

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Order | null>(null);
  const { data, isLoading } = useOrders({ page, limit: 10 });
  const cancelOrder = useCancelOrder();

  const orders = data?.data ?? [];
  const meta = data?.meta;

  const handleCancel = async (orderId: string) => {
    if (!confirm('Cancel this order?')) return;
    try {
      await cancelOrder.mutateAsync({ id: orderId });
      toast.success('Order cancelled');
      setSelected(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Cannot cancel this order');
    }
  };

  if (isLoading) return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  );

  if (orders.length === 0) return (
    <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
      <Package size={64} className="mx-auto text-gray-200 mb-4" />
      <h3 className="font-semibold text-gray-700 mb-2">No orders yet</h3>
      <p className="text-sm text-gray-500 mb-6">When you place an order, it will appear here.</p>
      <Link href="/products" className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-green-700 transition-colors">
        Start Shopping
      </Link>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-xl text-gray-900">My Orders</h2>

      {orders.map((order) => (
        <div key={order.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {/* Order header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 bg-gray-50/50">
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <p className="text-xs text-gray-500">Order #</p>
                <p className="font-bold text-sm text-gray-900">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Placed</p>
                <p className="text-sm font-medium">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-sm font-bold text-green-600">{formatPrice(order.total)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', STATUS_STYLES[order.status])}>
                {order.status}
              </span>
              <button
                onClick={() => setSelected(order)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-green-600 font-medium px-3 py-1.5 border border-gray-200 rounded-lg hover:border-green-300 transition-colors"
              >
                <Eye size={13} /> Details
              </button>
            </div>
          </div>

          {/* Items preview */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {order.items.slice(0, 4).map((item) => (
                <div key={item.id} className="shrink-0 flex items-center gap-2 bg-gray-50 rounded-xl p-2 pr-4">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} width={40} height={40} className="w-10 h-10 object-contain rounded-lg" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate max-w-30">{item.name}</p>
                    <p className="text-xs text-gray-500">×{item.quantity} · {formatPrice(item.price)}</p>
                  </div>
                </div>
              ))}
              {order.items.length > 4 && (
                <span className="shrink-0 text-xs text-gray-500 font-medium">+{order.items.length - 4} more</span>
              )}
            </div>

            {order.trackingNumber && (
              <p className="text-xs text-gray-500 mt-3">
                📦 Tracking: <span className="font-medium text-gray-800">{order.trackingNumber}</span>
                {order.trackingNumber && <span className="text-gray-400"> via {(order as any).shippingCarrier}</span>}
              </p>
            )}
          </div>
        </div>
      ))}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          <button disabled={!meta.hasPrevPage} onClick={() => setPage(page - 1)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 text-gray-700">Previous</button>
          <span className="px-4 py-2 text-sm text-gray-600">Page {meta.page} of {meta.totalPages}</span>
          <button disabled={!meta.hasNextPage} onClick={() => setPage(page + 1)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 text-gray-700">Next</button>
        </div>
      )}

      {/* Order detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
              <h3 className="font-bold text-lg text-gray-900">Order #{selected.orderNumber}</h3>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={cn('text-sm font-semibold px-3 py-1 rounded-full', STATUS_STYLES[selected.status])}>{selected.status}</span>
                <span className="text-sm text-gray-500">{formatDate(selected.createdAt)}</span>
              </div>

              {/* Items */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Items</p>
                <div className="space-y-3">
                  {selected.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      {item.image && <Image src={item.image} alt={item.name} width={44} height={44} className="w-11 h-11 object-contain rounded-lg bg-gray-50" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">×{item.quantity}</p>
                      </div>
                      <span className="text-sm font-bold">{formatPrice(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(selected.subtotal)}</span></div>
                {selected.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(selected.discount)}</span></div>}
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{selected.shippingFee === 0 ? 'Free' : formatPrice(selected.shippingFee)}</span></div>
                <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span className="text-green-600">{formatPrice(selected.total)}</span></div>
              </div>

              {/* Delivery address */}
              {selected.address && (
                <div className="bg-gray-50 rounded-xl p-4 text-sm">
                  <p className="font-semibold text-gray-700 mb-1">Delivery Address</p>
                  <p className="text-gray-600">{selected.address.fullName} · {selected.address.phone}</p>
                  <p className="text-gray-500">{selected.address.street}, {selected.address.city}, {selected.address.region}</p>
                </div>
              )}

              {/* Cancel button */}
              {['PENDING', 'CONFIRMED'].includes(selected.status) && (
                <button
                  onClick={() => handleCancel(selected.id)}
                  disabled={cancelOrder.isPending}
                  className="w-full flex items-center justify-center gap-2 border-2 border-red-400 text-red-600 py-2.5 rounded-xl font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {cancelOrder.isPending ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
