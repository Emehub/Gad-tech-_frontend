'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { toast } from 'sonner';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/';
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading } = useAuthStore();
  const { fetchCart } = useCartStore();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      await fetchCart();
      toast.success('Welcome back!');
      router.push(redirect);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Login failed');
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
        <p className="text-gray-500 text-sm mb-6">Sign in to your GadTech account</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Email address</label>
            <input {...register('email')} type="email" placeholder="john@example.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-green-500 transition-colors" />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Password</label>
            <div className="relative">
              <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm text-gray-900 focus:outline-none focus:border-green-500 transition-colors" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs text-green-600 hover:underline">Forgot password?</Link>
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
            Sign In
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-5">
          Don't have an account?{' '}
          <Link href="/register" className="text-green-600 font-semibold hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md"><div className="bg-white rounded-2xl border border-gray-100 p-8 h-80 animate-pulse" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
