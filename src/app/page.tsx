'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Truck, ShieldCheck, Headphones, RotateCcw, ChevronRight } from 'lucide-react';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { ProductCard } from '@/components/product/ProductCard';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/axios';

const CATEGORY_ICONS: Record<string, string> = {
  Laptops: '💻', Smartphones: '📱', Televisions: '📺', 'Home Appliances': '🏠',
  Audio: '🎧', Cameras: '📷', Tablets: '📟', Gaming: '🎮',
};

function HeroBanner() {
  const { data } = useQuery({
    queryKey: ['banners', 'hero'],
    queryFn: () => api.get('/banners?position=HERO').then((r) => r.data.data),
  });

  const banner = data?.[0];

  return (
    <section className="relative bg-blue-900 text-white overflow-hidden min-h-115 flex items-center">
      {banner?.imageUrl && (
        <Image src={banner.imageUrl} alt={banner.title ?? 'Banner'} fill className="object-cover opacity-20" priority />
      )}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 w-full">
        <div className="max-w-xl">
          <span className="inline-block bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            New Arrivals 2026
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
            {banner?.title ?? "Ghana's #1 Tech Store"}
          </h1>
          <p className="text-gray-300 text-lg mb-8">
            {banner?.subtitle ?? 'Shop the latest laptops, smartphones, TVs and home appliances at unbeatable prices. Fast delivery across Ghana.'}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/products" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              Shop Now <ArrowRight size={18} />
            </Link>
            <Link href="/products?isBestSeller=true" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl backdrop-blur-sm transition-colors border border-white/20">
              Best Sellers
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative accent */}
      <div className="absolute right-0 top-0 w-1/2 h-full bg-blue-950/40 pointer-events-none" />
    </section>
  );
}

function TrustBadges() {
  const items = [
    { icon: Truck, title: 'Free Delivery', sub: 'On orders above GHS 500' },
    { icon: ShieldCheck, title: 'Genuine Products', sub: '100% authentic items' },
    { icon: Headphones, title: '24/7 Support', sub: 'We\'re always here for you' },
    { icon: RotateCcw, title: 'Easy Returns', sub: '30-day return policy' },
  ];
  return (
    <section className="border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map(({ icon: Icon, title, sub }) => (
          <div key={title} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
              <Icon size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{title}</p>
              <p className="text-xs text-gray-500">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Categories() {
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data.data),
  });

  const categories = (Array.isArray(data) ? data : []).filter((c: any) => !c.parentId).slice(0, 8);

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
        <Link href="/products" className="text-sm text-green-600 font-medium flex items-center gap-1 hover:underline">
          View all <ChevronRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl aspect-square animate-pulse" />
            ))
          : categories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/products?categoryId=${cat.id}`}
                className="flex flex-col items-center gap-2 bg-white border border-gray-100 hover:border-green-300 hover:shadow-md rounded-2xl p-4 transition-all group"
              >
                <span className="text-3xl">{CATEGORY_ICONS[cat.name] ?? '🛍️'}</span>
                <span className="text-xs font-semibold text-gray-700 text-center group-hover:text-green-600 transition-colors leading-tight">{cat.name}</span>
              </Link>
            ))}
      </div>
    </section>
  );
}

function ProductSection({ title, params, href }: { title: string; params: Record<string, string>; href: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['home-products', params],
    queryFn: () => api.get('/products', { params: { limit: 8, status: 'PUBLISHED', ...params } }).then((r) => r.data.data),
  });

  const products = Array.isArray(data) ? data : [];

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 pb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <Link href={href} className="text-sm text-green-600 font-medium flex items-center gap-1 hover:underline">
          See all <ChevronRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl aspect-3/4 animate-pulse" />
            ))
          : products.map((p: any) => <ProductCard key={p.id} product={p} />)}
      </div>

    </section>
  );
}

function PromoBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/products?isNewArrival=true" className="relative bg-blue-800 rounded-2xl p-8 text-white overflow-hidden group hover:shadow-xl transition-shadow">
          <div className="relative z-10">
            <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider mb-2">Just Arrived</p>
            <h3 className="text-2xl font-bold mb-3">New Arrivals</h3>
            <p className="text-blue-100 text-sm mb-5">The latest tech products freshly landed in Ghana.</p>
            <span className="inline-flex items-center gap-1.5 bg-white text-blue-800 font-semibold text-sm px-4 py-2 rounded-xl group-hover:bg-blue-50 transition-colors">
              Shop Now <ArrowRight size={15} />
            </span>
          </div>
          <div className="absolute right-4 bottom-4 text-8xl opacity-10 group-hover:opacity-20 transition-opacity">✨</div>
        </Link>

        <Link href="/products?isBestSeller=true" className="relative bg-green-600 rounded-2xl p-8 text-white overflow-hidden group hover:shadow-xl transition-shadow">
          <div className="relative z-10">
            <p className="text-green-200 text-sm font-semibold uppercase tracking-wider mb-2">Top Picks</p>
            <h3 className="text-2xl font-bold mb-3">Best Sellers</h3>
            <p className="text-green-100 text-sm mb-5">Our most popular products loved by thousands of customers.</p>
            <span className="inline-flex items-center gap-1.5 bg-white text-green-700 font-semibold text-sm px-4 py-2 rounded-xl group-hover:bg-green-50 transition-colors">
              Shop Now <ArrowRight size={15} />
            </span>
          </div>
          <div className="absolute right-4 bottom-4 text-8xl opacity-10 group-hover:opacity-20 transition-opacity">🔥</div>
        </Link>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <StoreLayout>
      <div className="bg-gray-50 min-h-screen">
        <HeroBanner />
        <TrustBadges />
        <div className="pt-6">
          <Categories />
          <ProductSection title="Featured Products" params={{ isFeatured: 'true', sortBy: 'createdAt', sortOrder: 'desc' }} href="/products?isFeatured=true" />
          <PromoBanner />
          <ProductSection title="New Arrivals" params={{ isNewArrival: 'true', sortBy: 'createdAt', sortOrder: 'desc' }} href="/products?isNewArrival=true" />
          <ProductSection title="Best Sellers" params={{ isBestSeller: 'true', sortBy: 'soldCount', sortOrder: 'desc' }} href="/products?isBestSeller=true" />
        </div>
      </div>
    </StoreLayout>
  );
}
