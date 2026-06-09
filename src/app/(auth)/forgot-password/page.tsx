'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

const schema = z.object({ email: z.string().email('Enter a valid email') });

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }: { email: string }) => {
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Check your email</h1>
          <p className="text-gray-500 text-sm mb-6">If that email exists, we've sent a password reset link. Check your inbox (and spam folder).</p>
          <Link href="/login" className="text-green-600 font-semibold hover:underline">Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot password?</h1>
        <p className="text-gray-500 text-sm mb-6">Enter your email and we'll send you a reset link.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Email address</label>
            <input {...register('email')} type="email" placeholder="john@example.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message as string}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50">
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null} Send Reset Link
          </button>
        </form>
        <p className="text-sm text-center text-gray-600 mt-5">
          <Link href="/login" className="text-green-600 font-semibold hover:underline">← Back to login</Link>
        </p>
      </div>
    </div>
  );
}
