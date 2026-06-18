'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Truck, ShieldCheck, Headphones, RotateCcw, ChevronRight, ShoppingBag } from 'lucide-react';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { ProductCard } from '@/components/product/ProductCard';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/axios';

const CATEGORY_ICONS: Record<string, string> = {
  Laptops: '💻', Smartphones: '📱', Televisions: '📺', 'Home Appliances': '🏠',
  Audio: '🎧', Cameras: '📷', Tablets: '📟', Gaming: '🎮',
};

function HeroBanner() {
  const { data: bannerData } = useQuery({
    queryKey: ['banners', 'hero'],
    queryFn: () => api.get('/banners?position=HERO').then((r) => r.data.data),
  });
  const { data: featuredData } = useQuery({
    queryKey: ['home-products', { isFeatured: 'true' }],
    queryFn: () => api.get('/products', { params: { limit: 3, status: 'PUBLISHED', isFeatured: 'true' } }).then((r) => r.data.data),
  });

  const banner = bannerData?.[0];
  const featured = Array.isArray(featuredData) ? featuredData : [];
  const [main, second, third] = featured;

  return (
    <section className="relative bg-blue-900 text-white overflow-hidden min-h-[480px] lg:min-h-[540px] flex items-center">
      {/* Background glow circles */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-green-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-1/3 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

      {banner?.imageUrl && (
        <Image src={banner.imageUrl} alt={banner.title ?? 'Banner'} fill className="object-cover opacity-10" priority />
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-14 w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left: text */}
        <div>
          <span className="inline-block bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            New Arrivals 2026
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
            {banner?.title ?? "Ghana's #1 Tech Store"}
          </h1>
          <p className="text-gray-300 text-lg mb-8 max-w-md">
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
          {/* Stats */}
          <div className="flex gap-6 mt-10">
            {[['10K+', 'Happy Customers'], ['500+', 'Products'], ['Fast', 'Delivery']].map(([val, label]) => (
              <div key={label}>
                <p className="text-xl font-extrabold text-green-400">{val}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: product showcase */}
        <div className="hidden lg:flex items-center justify-center relative h-80">
          {/* Main product card */}
          {main ? (
            <Link href={`/products/${main.slug}`} className="absolute top-0 left-1/2 -translate-x-1/2 w-52 bg-white rounded-2xl shadow-2xl overflow-hidden hover:scale-105 transition-transform z-20">
              <div className="bg-gray-50 h-40 flex items-center justify-center p-3">
                {main.images?.[0]?.url
                  ? <Image src={main.images[0].url} alt={main.name} width={140} height={140} className="object-contain h-36 w-auto" />
                  : <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center"><ShoppingBag size={36} className="text-green-600" /></div>}
              </div>
              <div className="p-3">
                <p className="text-gray-900 text-xs font-semibold truncate">{main.name}</p>
                <p className="text-green-600 text-sm font-bold mt-0.5">{formatPrice(main.price)}</p>
              </div>
            </Link>
          ) : null}

          {/* Second card — bottom left */}
          {second ? (
            <Link href={`/products/${second.slug}`} className="absolute bottom-0 left-4 w-40 bg-white rounded-xl shadow-xl overflow-hidden hover:scale-105 transition-transform z-10">
              <div className="bg-gray-50 h-28 flex items-center justify-center p-2">
                {second.images?.[0]?.url
                  ? <Image src={second.images[0].url} alt={second.name} width={100} height={100} className="object-contain h-24 w-auto" />
                  : <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center"><ShoppingBag size={26} className="text-green-600" /></div>}
              </div>
              <div className="p-2">
                <p className="text-gray-900 text-[11px] font-semibold truncate">{second.name}</p>
                <p className="text-green-600 text-xs font-bold mt-0.5">{formatPrice(second.price)}</p>
              </div>
            </Link>
          ) : null}

          {/* Third card — bottom right */}
          {third ? (
            <Link href={`/products/${third.slug}`} className="absolute bottom-0 right-4 w-40 bg-white rounded-xl shadow-xl overflow-hidden hover:scale-105 transition-transform z-10">
              <div className="bg-gray-50 h-28 flex items-center justify-center p-2">
                {third.images?.[0]?.url
                  ? <Image src={third.images[0].url} alt={third.name} width={100} height={100} className="object-contain h-24 w-auto" />
                  : <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center"><ShoppingBag size={26} className="text-green-600" /></div>}
              </div>
              <div className="p-2">
                <p className="text-gray-900 text-[11px] font-semibold truncate">{third.name}</p>
                <p className="text-green-600 text-xs font-bold mt-0.5">{formatPrice(third.price)}</p>
              </div>
            </Link>
          ) : null}

          {/* Floating badge */}
          <div className="absolute top-6 right-2 bg-green-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-full shadow-lg z-30 animate-bounce">
            Hot Deals
          </div>
          {/* Decorative ring */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border border-white/10 rounded-full pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 border border-white/5 rounded-full pointer-events-none" />
        </div>
      </div>
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
              <div key={i} className="bg-gray-50 rounded-2xl aspect-square animate-pulse" />
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
      <div className="bg-white min-h-screen">
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
