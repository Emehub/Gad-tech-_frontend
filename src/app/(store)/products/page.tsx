'use client';

import { Suspense, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories, useBrands } from '@/hooks/useCategories';
import { ProductGrid } from '@/components/product/ProductGrid';
import { formatPrice, cn } from '@/lib/utils';

const SORT_OPTIONS = [
  { label: 'Newest', value: 'createdAt:desc' },
  { label: 'Price: Low to High', value: 'price:asc' },
  { label: 'Price: High to Low', value: 'price:desc' },
  { label: 'Best Rated', value: 'rating:desc' },
  { label: 'Most Popular', value: 'soldCount:desc' },
];

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [expandedSections, setExpandedSections] = useState({ categories: true, brands: true, price: true });

  const params = {
    page: Number(searchParams.get('page') ?? 1),
    limit: 20,
    search: searchParams.get('search') ?? undefined,
    categoryId: searchParams.get('categoryId') ?? undefined,
    brandId: searchParams.get('brandId') ?? undefined,
    minPrice: searchParams.get('minPrice') ?? undefined,
    maxPrice: searchParams.get('maxPrice') ?? undefined,
    isFeatured: searchParams.get('isFeatured') ?? undefined,
    isNewArrival: searchParams.get('isNewArrival') ?? undefined,
    isBestSeller: searchParams.get('isBestSeller') ?? undefined,
    sortBy: searchParams.get('sortBy') ?? 'createdAt',
    sortOrder: searchParams.get('sortOrder') ?? 'desc',
  };

  const { data, isLoading } = useProducts(params);
  const { data: categoriesData } = useCategories();
  const { data: brandsData } = useBrands();

  const products = data?.data ?? [];
  const meta = data?.meta;
  const categories = categoriesData?.data ?? [];
  const brands = brandsData?.data ?? [];

  const updateParam = useCallback((key: string, value: string | undefined) => {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    router.push(`/products?${p.toString()}`);
  }, [searchParams, router]);

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections((s) => ({ ...s, [key]: !s[key] }));
  };

  const currentSort = `${params.sortBy}:${params.sortOrder}`;

  const SidebarContent = () => (
    <div className="space-y-1">
      {/* Search */}
      <form onSubmit={(e) => { e.preventDefault(); const v = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value; updateParam('search', v || undefined); }} className="relative mb-4">
        <input name="q" defaultValue={params.search} placeholder="Search products..." className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-9 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600">
          <Search size={16} />
        </button>
      </form>

      {/* Active filters */}
      {(params.search || params.categoryId || params.brandId || params.isFeatured || params.isNewArrival || params.isBestSeller) && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Active Filters</p>
          <div className="flex flex-wrap gap-1.5">
            {params.search && <FilterTag label={`"${params.search}"`} onRemove={() => updateParam('search', undefined)} />}
            {params.isFeatured && <FilterTag label="Featured" onRemove={() => updateParam('isFeatured', undefined)} />}
            {params.isNewArrival && <FilterTag label="New Arrivals" onRemove={() => updateParam('isNewArrival', undefined)} />}
            {params.isBestSeller && <FilterTag label="Best Sellers" onRemove={() => updateParam('isBestSeller', undefined)} />}
          </div>
        </div>
      )}

      {/* Categories */}
      <FilterSection title="Categories" expanded={expandedSections.categories} onToggle={() => toggleSection('categories')}>
        <div className="space-y-1">
          <button onClick={() => updateParam('categoryId', undefined)} className={cn("w-full text-left text-sm px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-700", !params.categoryId && "bg-green-50 text-green-600 font-medium")}>
            All Categories
          </button>
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => updateParam('categoryId', cat.id)} className={cn("w-full text-left text-sm px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors flex justify-between text-gray-700", params.categoryId === cat.id && "bg-green-50 text-green-600 font-medium")}>
              <span>{cat.name}</span>
              {cat._count && <span className="text-xs text-gray-400">{cat._count.products}</span>}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Brands */}
      <FilterSection title="Brands" expanded={expandedSections.brands} onToggle={() => toggleSection('brands')}>
        <div className="space-y-1">
          <button onClick={() => updateParam('brandId', undefined)} className={cn("w-full text-left text-sm px-2 py-1.5 rounded-lg hover:bg-gray-100 text-gray-700", !params.brandId && "bg-green-50 text-green-600 font-medium")}>
            All Brands
          </button>
          {brands.map((brand) => (
            <button key={brand.id} onClick={() => updateParam('brandId', brand.id)} className={cn("w-full text-left text-sm px-2 py-1.5 rounded-lg hover:bg-gray-100 flex justify-between text-gray-700", params.brandId === brand.id && "bg-green-50 text-green-600 font-medium")}>
              <span>{brand.name}</span>
              {brand._count && <span className="text-xs text-gray-400">{brand._count.products}</span>}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range" expanded={expandedSections.price} onToggle={() => toggleSection('price')}>
        <div className="space-y-3 px-1">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Min (GHS)</label>
              <input type="number" placeholder="0" defaultValue={params.minPrice} onChange={(e) => updateParam('minPrice', e.target.value || undefined)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-green-500" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Max (GHS)</label>
              <input type="number" placeholder="Any" defaultValue={params.maxPrice} onChange={(e) => updateParam('maxPrice', e.target.value || undefined)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-green-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[[0, 500], [500, 1000], [1000, 2000], [2000, 5000]].map(([min, max]) => (
              <button key={`${min}-${max}`} onClick={() => { updateParam('minPrice', String(min)); updateParam('maxPrice', String(max)); }} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 hover:border-green-400 hover:text-green-600 transition-colors">
                {formatPrice(min)} – {formatPrice(max)}
              </button>
            ))}
          </div>
        </div>
      </FilterSection>

      {/* Quick filters */}
      <FilterSection title="Quick Filters" expanded={true} onToggle={() => {}}>
        <div className="space-y-1.5">
          {[
            { label: '🔥 Best Sellers', key: 'isBestSeller', val: 'true' },
            { label: '✨ New Arrivals', key: 'isNewArrival', val: 'true' },
            { label: '⭐ Featured', key: 'isFeatured', val: 'true' },
          ].map(({ label, key, val }) => (
            <button key={key} onClick={() => updateParam(key, (searchParams.get(key) === val ? undefined : val))} className={cn("w-full text-left text-sm px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-700", searchParams.get(key) === val && "bg-green-50 text-green-600 font-medium")}>
              {label}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {params.search ? `Results for "${params.search}"` : params.categoryId ? 'Products' : 'All Products'}
          </h1>
          {meta && <p className="text-sm text-gray-500 mt-1">{meta.total} products found</p>}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
            <SlidersHorizontal size={16} /> Filters
          </button>
          <select
            value={currentSort}
            onChange={(e) => { const [by, order] = e.target.value.split(':'); updateParam('sortBy', by); updateParam('sortOrder', order); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 bg-white"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar — desktop */}
        <aside className="w-64 shrink-0 hidden lg:block">
          <div className="sticky top-24 bg-white border border-gray-100 rounded-xl p-4">
            <SidebarContent />
          </div>
        </aside>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-80 bg-white overflow-y-auto p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">Filters</h2>
                <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
              </div>
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Products */}
        <div className="flex-1">
          <ProductGrid products={products} loading={isLoading} className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4" />

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button disabled={!meta.hasPrevPage} onClick={() => updateParam('page', String(params.page - 1))} className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 text-gray-700">
                Previous
              </button>
              <span className="text-sm text-gray-600">Page {meta.page} of {meta.totalPages}</span>
              <button disabled={!meta.hasNextPage} onClick={() => updateParam('page', String(params.page + 1))} className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 text-gray-700">
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-6"><div className="h-96 bg-gray-100 rounded-2xl animate-pulse" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}

function FilterSection({ title, expanded, onToggle, children }: { title: string; expanded: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="border-b border-gray-100 pb-3 mb-3">
      <button onClick={onToggle} className="w-full flex items-center justify-between py-2 text-sm font-semibold text-gray-900">
        {title}
        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
      {expanded && <div className="mt-1">{children}</div>}
    </div>
  );
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 bg-green-50 text-green-600 text-xs px-2 py-1 rounded-full font-medium">
      {label}
      <button onClick={onRemove} className="hover:text-green-800"><X size={10} /></button>
    </span>
  );
}
