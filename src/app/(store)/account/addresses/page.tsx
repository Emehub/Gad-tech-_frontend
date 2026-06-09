'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Plus, MapPin, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Address } from '@/types';
import { toast } from 'sonner';
import api from '@/lib/axios';

const schema = z.object({
  label: z.string().optional(),
  fullName: z.string().min(2),
  phone: z.string().min(10),
  street: z.string().min(3),
  city: z.string().min(2),
  region: z.string().min(2),
  country: z.string().optional(),
  isDefault: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { label: 'Home', country: 'Ghana' },
  });

  const fetchAddresses = async () => {
    try {
      const { data } = await api.get('/users/addresses');
      setAddresses(data.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAddresses(); }, []);

  const openForm = (addr?: Address) => {
    if (addr) {
      setEditing(addr);
      Object.keys(addr).forEach((k) => setValue(k as any, (addr as any)[k]));
    } else {
      setEditing(null);
      reset({ label: 'Home', country: 'Ghana' });
    }
    setShowForm(true);
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (editing) {
        await api.put(`/users/addresses/${editing.id}`, data);
        toast.success('Address updated!');
      } else {
        await api.post('/users/addresses', data);
        toast.success('Address added!');
      }
      setShowForm(false);
      setEditing(null);
      reset();
      fetchAddresses();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save address');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    try {
      await api.delete(`/users/addresses/${id}`);
      toast.success('Address deleted');
      fetchAddresses();
    } catch {
      toast.error('Failed to delete address');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-xl text-gray-900">My Addresses</h2>
        <button onClick={() => openForm()} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-green-700 transition-colors">
          <Plus size={16} /> Add Address
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 h-28 animate-pulse bg-gray-100" />)}
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
          <MapPin size={48} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 text-sm">No saved addresses. Add one to speed up checkout.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className={`bg-white border-2 rounded-2xl p-5 relative ${addr.isDefault ? 'border-green-300' : 'border-gray-100'}`}>
              {addr.isDefault && (
                <span className="absolute top-3 right-3 text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold">Default</span>
              )}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-gray-900">{addr.fullName}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{addr.label}</span>
                  </div>
                  <p className="text-sm text-gray-600">{addr.street}</p>
                  <p className="text-sm text-gray-600">{addr.city}, {addr.region}, {addr.country}</p>
                  <p className="text-xs text-gray-400 mt-1">{addr.phone}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => openForm(addr)} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg py-2 hover:bg-gray-50 transition-colors">
                  <Pencil size={13} /> Edit
                </button>
                <button onClick={() => handleDelete(addr.id)} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium border border-green-200 text-green-600 rounded-lg py-2 hover:bg-green-50 transition-colors">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
              <h3 className="font-bold text-lg text-gray-900">{editing ? 'Edit Address' : 'Add Address'}</h3>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Label</label>
                  <select {...register('label')} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-green-500">
                    <option>Home</option><option>Office</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Full Name</label>
                  <input {...register('fullName')} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
                  {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone Number</label>
                <input {...register('phone')} placeholder="+233 244 123 456" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Street Address</label>
                <input {...register('street')} placeholder="123 Main Street" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
                {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">City</label>
                  <input {...register('city')} placeholder="Accra" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Region</label>
                  <input {...register('region')} placeholder="Greater Accra" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" {...register('isDefault')} id="default" className="w-4 h-4 accent-green-600" />
                <label htmlFor="default" className="text-sm font-medium text-gray-700 cursor-pointer">Set as default address</label>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50">
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {editing ? 'Update Address' : 'Save Address'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
