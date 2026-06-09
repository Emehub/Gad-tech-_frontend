'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ChevronDown } from 'lucide-react';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';
import api from '@/lib/axios';

const STATUSES = ['', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-700',
};

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, search, status],
    queryFn: () => api.get('/orders/admin/all', { params: { page, limit: 15, search: search || undefined, status: status || undefined } }).then((r) => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/orders/admin/${id}/status`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Order updated'); setUpdating(null); },
    onError: () => toast.error('Failed to update order'),
  });

  const orders = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-bold text-xl text-gray-900">Orders ({meta?.total ?? 0})</h2>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by order # or customer..." className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none bg-white">
          {STATUSES.map((s) => <option key={s} value={s}>{s || 'All Status'}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Order</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Total</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Payment</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-8 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-bold text-gray-900">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">{order.items?.length} item(s)</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{order.user?.firstName} {order.user?.lastName}</p>
                    <p className="text-xs text-gray-400 truncate max-w-40">{order.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", order.paymentStatus === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="relative inline-block">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus.mutate({ id: order.id, status: e.target.value })}
                        disabled={updateStatus.isPending}
                        className={cn("text-xs font-semibold px-2.5 py-1.5 rounded-lg border-0 cursor-pointer appearance-none pr-7 focus:outline-none focus:ring-2 focus:ring-green-500", STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-700')}
                      >
                        {STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && !isLoading && <div className="text-center py-12 text-gray-400">No orders found</div>}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500">Showing {((meta.page - 1) * meta.limit) + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}</p>
          <div className="flex gap-2">
            <button disabled={!meta.hasPrevPage} onClick={() => setPage(page - 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Prev</button>
            <button disabled={!meta.hasNextPage} onClick={() => setPage(page + 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
