'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HeroBanner } from '@/components/home/HeroBanner';
import { SectionHeader } from '@/components/home/SectionHeader';
import { ProductGrid } from '@/components/product/ProductGrid';
import { useBanners, useCategories, useBrands } from '@/hooks/useCategories';
import { useFeaturedProducts, useNewArrivals, useBestSellers } from '@/hooks/useProducts';
import { useCartStore } from '@/stores/cart.store';
import { Truck, Shield, RefreshCcw, Headphones, Zap } from 'lucide-react';

const features = [
  { icon: Truck, title: 'Free Delivery', desc: 'On orders over GHS 500' },
  { icon: Shield, title: 'Secure Payment', desc: 'Paystack & mobile money' },
  { icon: RefreshCcw, title: 'Easy Returns', desc: '7-day return policy' },
  { icon: Headphones, title: '24/7 Support', desc: 'Expert help always' },
];

export default function HomePage() {
  const { fetchCart } = useCartStore();
  const { data: bannersData, isLoading: bannersLoading } = useBanners('HERO');
  const { data: featuredData, isLoading: featuredLoading } = useFeaturedProducts();
  const { data: newArrivalsData, isLoading: newLoading } = useNewArrivals();
  const { data: bestSellersData, isLoading: bestLoading } = useBestSellers();
  const { data: categoriesData } = useCategories();
  const { data: brandsData } = useBrands();

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const banners = Array.isArray(bannersData?.data) ? bannersData.data : [];
  const featured = Array.isArray(featuredData?.data) ? featuredData.data : [];
  const newArrivals = Array.isArray(newArrivalsData?.data) ? newArrivalsData.data : [];
  const bestSellers = Array.isArray(bestSellersData?.data) ? bestSellersData.data : [];
  const categories = Array.isArray(categoriesData?.data) ? categoriesData.data : [];
  const brands = Array.isArray(brandsData?.data) ? brandsData.data : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-12">
      {/* Hero */}
      <section>
        {bannersLoading ? (
          <div className="aspect-16/5 bg-gray-200 rounded-xl animate-pulse" />
        ) : (
          <HeroBanner banners={banners} />
        )}
      </section>

      {/* Features bar */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-4">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
              <Icon size={20} className="text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900">{title}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Shop by Category */}
      {categories.length > 0 && (
        <section>
          <SectionHeader title="Shop by Category" viewAllHref="/products" />
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                href={`/products?categoryId=${cat.id}`}
                className="group flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-xl p-4 hover:border-green-200 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-green-50 group-hover:bg-green-100 rounded-xl flex items-center justify-center transition-colors">
                  {cat.image ? (
                    <Image src={cat.image} alt={cat.name} width={32} height={32} className="object-contain" />
                  ) : (
                    <Zap size={24} className="text-green-600" />
                  )}
                </div>
                <span className="text-xs font-medium text-gray-700 text-center line-clamp-2 group-hover:text-green-600 transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section>
        <SectionHeader
          title="Featured Products"
          subtitle="Hand-picked selections just for you"
          viewAllHref="/products?isFeatured=true"
        />
        <ProductGrid products={featured} loading={featuredLoading} />
      </section>

      {/* Promo Banner */}
      <section className="bg-green-600 rounded-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between px-8 py-10 gap-6">
          <div className="text-white text-center md:text-left">
            <p className="text-sm font-semibold text-green-200 mb-1">Limited Time Offer</p>
            <h3 className="text-3xl font-bold mb-2">Up to 40% Off</h3>
            <p className="text-green-100">On selected laptops and televisions this week only!</p>
          </div>
          <Link
            href="/products?sortBy=comparePrice&sortOrder=desc"
            className="bg-white text-green-700 font-bold px-8 py-3 rounded-xl hover:bg-green-50 transition-colors whitespace-nowrap"
          >
            Shop The Sale
          </Link>
        </div>
      </section>

      {/* New Arrivals */}
      <section>
        <SectionHeader
          title="New Arrivals"
          subtitle="Fresh stock just landed"
          viewAllHref="/products?isNewArrival=true"
        />
        <ProductGrid products={newArrivals} loading={newLoading} />
      </section>

      {/* Shop by Brand */}
      {brands.length > 0 && (
        <section>
          <SectionHeader title="Shop by Brand" viewAllHref="/products" />
          <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-10 gap-3">
            {brands.slice(0, 10).map((brand) => (
              <Link
                key={brand.id}
                href={`/products?brandId=${brand.id}`}
                className="flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-xl p-3 hover:border-green-200 hover:shadow-sm transition-all group"
              >
                {brand.logo ? (
                  <Image src={brand.logo} alt={brand.name} width={48} height={48} className="object-contain h-10 w-auto" />
                ) : (
                  <div className="h-10 flex items-end">
                    <span className="text-xs font-bold text-gray-700 group-hover:text-green-600 transition-colors">{brand.name}</span>
                  </div>
                )}
                <span className="text-[10px] text-gray-500">{brand.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Best Sellers */}
      <section>
        <SectionHeader
          title="Best Sellers"
          subtitle="Most popular products this month"
          viewAllHref="/products?isBestSeller=true"
        />
        <ProductGrid products={bestSellers} loading={bestLoading} />
      </section>
    </div>
  );
}
