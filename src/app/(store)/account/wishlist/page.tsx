'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCartStore } from '@/stores/cart.store';
import { formatPrice, cn } from '@/lib/utils';
import { toast } from 'sonner';
import api from '@/lib/axios';

export default function WishlistPage() {
  const { addItem, isLoading: cartLoading } = useCartStore();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => api.get('/users/wishlist').then((r) => r.data.data),
  });

  const items = data ?? [];

  const handleRemove = async (productId: string) => {
    try {
      await api.post(`/users/wishlist/${productId}`);
      qc.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const handleAddToCart = async (productId: string, productName: string) => {
    try {
      await addItem(productId, 1);
      toast.success(`${productName} added to cart!`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to add to cart');
    }
  };

  if (isLoading) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-gray-100 rounded-2xl aspect-square animate-pulse" />
      ))}
    </div>
  );

  if (items.length === 0) return (
    <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
      <Heart size={64} className="mx-auto text-gray-200 mb-4" />
      <h3 className="font-semibold text-gray-700 mb-2">Your wishlist is empty</h3>
      <p className="text-sm text-gray-500 mb-6">Save products you love to buy them later.</p>
      <Link href="/products" className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-green-700 transition-colors">
        Browse Products
      </Link>
    </div>
  );

  return (
    <div>
      <h2 className="font-bold text-xl text-gray-900 mb-4">My Wishlist ({items.length})</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {items.map((item: any) => {
          const product = item.product;
          const image = product.images?.[0]?.url;
          return (
            <div key={item.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden group">
              <div className="relative aspect-square bg-gray-50">
                <Link href={`/products/${product.slug}`}>
                  {image ? (
                    <Image src={image} alt={product.name} fill className="object-contain p-3 group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                      <Heart size={40} />
                    </div>
                  )}
                </Link>
                <button
                  onClick={() => handleRemove(product.id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-green-500 hover:bg-green-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="p-3">
                {product.brand && <p className="text-[11px] text-green-600 font-semibold uppercase mb-1">{product.brand.name}</p>}
                <Link href={`/products/${product.slug}`}>
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-green-600 transition-colors mb-2">{product.name}</h3>
                </Link>
                <p className="font-bold text-sm text-gray-900 mb-2">{formatPrice(product.price)}</p>
                <button
                  onClick={() => handleAddToCart(product.id, product.name)}
                  disabled={cartLoading || product.stock === 0}
                  className={cn(
                    "w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors",
                    product.stock === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  )}
                >
                  <ShoppingCart size={13} />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
