'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { formatPrice, formatDate } from '@/lib/utils';
import { TrendingUp, ShoppingBag, Users, Package, AlertCircle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

function StatCard({ title, value, sub, icon: Icon, color, href }: any) {
  return (
    <Link href={href ?? '#'} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-start justify-between hover:shadow-md transition-shadow group">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
    </Link>
  );
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/admin/dashboard').then((r) => r.data.data),
    refetchInterval: 60_000,
  });

  if (isLoading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-28 animate-pulse" />)}
    </div>
  );

  const ov = data?.overview ?? {};

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={formatPrice(ov.totalRevenue ?? 0)} sub={`+${formatPrice(ov.revenueThisMonth ?? 0)} this month`} icon={TrendingUp} color="bg-green-500" />
        <StatCard title="Total Orders" value={ov.totalOrders ?? 0} sub={`${ov.pendingOrders ?? 0} pending`} icon={ShoppingBag} color="bg-blue-500" href="/admin/orders" />
        <StatCard title="Products" value={ov.totalProducts ?? 0} sub={ov.lowStockProducts > 0 ? `${ov.lowStockProducts} low stock` : 'All stocked'} icon={Package} color="bg-purple-500" href="/admin/products" />
        <StatCard title="Customers" value={ov.totalUsers ?? 0} sub={`+${ov.newUsersThisMonth ?? 0} this month`} icon={Users} color="bg-orange-500" href="/admin/users" />
      </div>

      {/* Revenue growth */}
      {ov.revenueGrowth !== undefined && (
        <div className={`flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium ${ov.revenueGrowth >= 0 ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
          <ArrowUpRight size={18} className={ov.revenueGrowth >= 0 ? '' : 'rotate-180'} />
          Revenue is {ov.revenueGrowth >= 0 ? 'up' : 'down'} {Math.abs(ov.revenueGrowth)}% compared to last month
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Recent Orders</h3>
            <Link href="/admin/orders" className="text-sm text-green-600 font-medium hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {(data?.recentOrders ?? []).map((order: any) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">#{order.orderNumber}</p>
                  <p className="text-xs text-gray-500 truncate">{order.user?.firstName} {order.user?.lastName}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-700'}`}>{order.status}</span>
                  <span className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Top Products</h3>
            <Link href="/admin/products" className="text-sm text-green-600 font-medium hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {(data?.topProducts ?? []).map((product: any, i: number) => (
              <div key={product.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className="text-lg font-bold text-gray-300 w-6">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.soldCount} sold · {formatPrice(product.price)}</p>
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${product.stock <= 5 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                  {product.stock}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders by status */}
      {data?.ordersByStatus && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h3 className="font-bold text-gray-900 mb-4">Orders by Status</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(data.ordersByStatus).map(([status, count]) => (
              <div key={status} className="text-center">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLOR[status] ?? 'bg-gray-100 text-gray-700'}`}>{status}</span>
                <p className="text-2xl font-bold text-gray-900 mt-2">{count as number}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
