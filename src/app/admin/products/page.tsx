'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Eye, Search, EyeOff, Loader2 } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import { toast } from 'sonner';
import api from '@/lib/axios';
import Link from 'next/link';

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search, status],
    queryFn: () => api.get('/products', { params: { page, limit: 15, search: search || undefined, status: status || undefined, sortBy: 'createdAt', sortOrder: 'desc' } }).then((r) => r.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product deleted'); },
    onError: () => toast.error('Failed to delete product'),
  });

  const products = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-bold text-xl text-gray-900">Products ({meta?.total ?? 0})</h2>
        <Link href="/admin/products/new" className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-green-700 transition-colors">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search products..." className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none bg-white">
          <option value="">All Status</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Price</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Stock</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-10 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : products.map((product: any) => {
                const image = product.images?.[0]?.url;
                return (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                          {image && <Image src={image} alt={product.name} width={40} height={40} className="w-full h-full object-contain p-0.5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-50">{product.name}</p>
                          {product.brand && <p className="text-xs text-gray-400">{product.brand.name}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{product.category?.name}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn("font-semibold", product.stock === 0 ? "text-red-600" : product.stock <= 5 ? "text-yellow-600" : "text-green-600")}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", {
                        'bg-green-100 text-green-700': product.status === 'PUBLISHED',
                        'bg-gray-100 text-gray-600': product.status === 'DRAFT',
                        'bg-orange-100 text-orange-600': product.status === 'ARCHIVED',
                      })}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/products/${product.slug}`} target="_blank" className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors">
                          <Eye size={15} />
                        </Link>
                        <Link href={`/admin/products/${product.id}/edit`} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-green-600 transition-colors">
                          <Pencil size={15} />
                        </Link>
                        <button
                          onClick={() => { if (confirm(`Delete "${product.name}"?`)) deleteMut.mutate(product.id); }}
                          disabled={deleteMut.isPending}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600 transition-colors disabled:opacity-40"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {products.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-400">No products found</div>
        )}
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
