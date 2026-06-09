'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag } from 'lucide-react';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/axios';

const schema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.coerce.number().positive(),
  minOrderValue: z.coerce.number().min(0).optional(),
  maxUses: z.coerce.number().int().positive().optional(),
  expiresAt: z.string().optional(),
});

type CouponFormData = z.output<typeof schema>;

function CouponModal({ onClose, onSave }: { onClose: () => void; onSave: (d: CouponFormData) => void }) {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<z.input<typeof schema>, any, CouponFormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'PERCENTAGE', minOrderValue: 0 },
  });
  const type = watch('type');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-lg text-gray-900">Create Coupon</h3>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Coupon Code *</label>
            <input {...register('code')} placeholder="e.g. SUMMER20" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500 uppercase" />
            {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Type *</label>
              <select {...register('type')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none bg-white">
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed (GHS)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Value *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{type === 'PERCENTAGE' ? '%' : '₵'}</span>
                <input {...register('value')} type="number" step="0.01" className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
              </div>
              {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Min Order (GHS)</label>
              <input {...register('minOrderValue')} type="number" step="0.01" placeholder="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Max Uses</label>
              <input {...register('maxUses')} type="number" placeholder="Unlimited" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Expires At</label>
            <input {...register('expiresAt')} type="datetime-local" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-60">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminCouponsPage() {
  const [showModal, setShowModal] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => api.get('/coupons/admin').then((r) => r.data.data),
  });

  const createCoupon = useMutation({
    mutationFn: (body: CouponFormData) => api.post('/coupons', body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-coupons'] }); toast.success('Coupon created'); setShowModal(false); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to create coupon'),
  });

  const toggleCoupon = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => api.put(`/coupons/${id}`, { isActive }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-coupons'] }); toast.success('Coupon updated'); },
    onError: () => toast.error('Failed to update coupon'),
  });

  const deleteCoupon = useMutation({
    mutationFn: (id: string) => api.delete(`/coupons/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-coupons'] }); toast.success('Coupon deleted'); },
    onError: () => toast.error('Failed to delete coupon'),
  });

  const coupons = data ?? [];

  return (
    <div className="space-y-4">
      {showModal && (
        <CouponModal
          onClose={() => setShowModal(false)}
          onSave={(d: CouponFormData) => createCoupon.mutate(d)}
        />
      )}

      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold text-xl text-gray-900">Coupons ({coupons.length})</h2>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-green-700 transition-colors">
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Code</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Discount</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Min Order</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Uses</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Expires</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Active</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-8 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : coupons.map((coupon: any) => (
                <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                        <Tag size={13} className="text-green-600" />
                      </div>
                      <span className="font-bold text-gray-900 tracking-wider">{coupon.code}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("font-bold", coupon.type === 'PERCENTAGE' ? 'text-blue-600' : 'text-green-600')}>
                      {coupon.type === 'PERCENTAGE' ? `${coupon.value}% off` : `${formatPrice(coupon.value)} off`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {coupon.minOrderValue > 0 ? formatPrice(coupon.minOrderValue) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {coupon.usedCount}{coupon.maxUses ? ` / ${coupon.maxUses}` : ''}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {coupon.expiresAt ? formatDate(coupon.expiresAt) : 'No expiry'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleCoupon.mutate({ id: coupon.id, isActive: !coupon.isActive })}
                      disabled={toggleCoupon.isPending}
                      className="disabled:opacity-40"
                    >
                      {coupon.isActive
                        ? <ToggleRight size={26} className="text-green-500" />
                        : <ToggleLeft size={26} className="text-gray-300" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => { if (confirm(`Delete coupon "${coupon.code}"?`)) deleteCoupon.mutate(coupon.id); }}
                      disabled={deleteCoupon.isPending}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors disabled:opacity-40"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {coupons.length === 0 && !isLoading && (
          <div className="text-center py-16 text-gray-400">
            <Tag size={40} className="mx-auto mb-3 opacity-30" />
            <p>No coupons yet. Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
