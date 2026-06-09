'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import api from '@/lib/axios';

const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export default function AccountPage() {
  const { user, setUser } = useAuthStore();
  const [passwordLoading, setPasswordLoading] = useState(false);

  const profileForm = useForm({ resolver: zodResolver(profileSchema), defaultValues: { firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', phone: user?.phone ?? '' } });
  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });

  const onProfileSubmit = async (data: any) => {
    try {
      const { data: r } = await api.put('/users/profile', data);
      setUser(r.data);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const onPasswordSubmit = async (data: any) => {
    setPasswordLoading(true);
    try {
      await api.post('/auth/change-password', { currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed!');
      passwordForm.reset();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <h2 className="font-bold text-lg text-gray-900 mb-5">Profile Information</h2>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">First name</label>
              <input {...profileForm.register('firstName')} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Last name</label>
              <input {...profileForm.register('lastName')} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Email address</label>
            <input value={user?.email ?? ''} disabled className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 text-gray-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone</label>
            <input {...profileForm.register('phone')} placeholder="+233 244 123 456" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
          </div>
          <button type="submit" disabled={profileForm.formState.isSubmitting} className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-green-700 flex items-center gap-2 disabled:opacity-50">
            {profileForm.formState.isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            Save Changes
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <h2 className="font-bold text-lg text-gray-900 mb-5">Change Password</h2>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          {[{ name: 'currentPassword', label: 'Current password' }, { name: 'newPassword', label: 'New password' }, { name: 'confirmPassword', label: 'Confirm new password' }].map(({ name, label }) => (
            <div key={name}>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">{label}</label>
              <input {...(passwordForm.register as any)(name)} type="password" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
              {(passwordForm.formState.errors as any)[name] && <p className="text-xs text-red-500 mt-1">{(passwordForm.formState.errors as any)[name]?.message}</p>}
            </div>
          ))}
          <button type="submit" disabled={passwordLoading} className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50">
            {passwordLoading ? <Loader2 size={16} className="animate-spin" /> : null}
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
