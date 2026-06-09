import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { cn } from '@/lib/utils';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  className?: string;
}

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-5 bg-gray-200 rounded w-1/2" />
        <div className="h-9 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}

export function ProductGrid({ products: rawProducts, loading, className }: ProductGridProps) {
  const products = Array.isArray(rawProducts) ? rawProducts : [];
  if (loading) {
    return (
      <div className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4", className)}>
        {Array.from({ length: 10 }).map((_, i) => <ProductSkeleton key={i} />)}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">No products found.</p>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4", className)}>
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  );
}
