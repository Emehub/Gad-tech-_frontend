'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

const schema = z.object({
  firstName: z.string().min(2, 'At least 2 characters'),
  lastName: z.string().min(2, 'At least 2 characters'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Minimum 8 characters').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ confirmPassword, ...data }: FormData) => {
    try {
      await registerUser(data);
      toast.success('Account created! Please verify your email.');
      router.push('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Registration failed');
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
        <p className="text-gray-500 text-sm mb-6">Join GadTech Store today</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">First name</label>
              <input {...register('firstName')} placeholder="John" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
              {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Last name</label>
              <input {...register('lastName')} placeholder="Doe" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
              {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Email address</label>
            <input {...register('email')} type="email" placeholder="john@example.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone (optional)</label>
            <input {...register('phone')} placeholder="+233 244 123 456" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Password</label>
            <div className="relative">
              <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Confirm password</label>
            <input {...register('confirmPassword')} type="password" placeholder="••••••••" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
            Create Account
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-green-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
