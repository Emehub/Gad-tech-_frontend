'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, getDiscountPercent, cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const router = useRouter();
  const { addItem, isLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const qc = useQueryClient();

  const image = product.images?.[0]?.url;
  const discount = product.comparePrice ? getDiscountPercent(product.price, product.comparePrice) : 0;
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    try {
      await addItem(product.id, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to add to cart');
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }
    setWishlistLoading(true);
    try {
      const { data } = await api.post(`/users/wishlist/${product.id}`);
      toast.success(data.message);
      qc.invalidateQueries({ queryKey: ['wishlist'] });
    } catch {
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <Link href={`/products/${product.slug}`} className={cn('product-card group bg-white rounded-xl overflow-hidden border border-gray-100 block', className)}>
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ShoppingCart size={40} />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
          )}
          {product.isNewArrival && (
            <span className="bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">New</span>
          )}
          {product.isBestSeller && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Hot</span>
          )}
          {isOutOfStock && (
            <span className="bg-gray-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Sold Out</span>
          )}
        </div>

        {/* Quick actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            className="w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-green-50 hover:text-green-600 transition-colors"
          >
            <Heart size={14} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/products/${product.slug}`); }}
            className="w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-green-50 hover:text-green-600 transition-colors">
            <Eye size={14} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        {product.brand && (
          <p className="text-[11px] font-semibold text-green-600 uppercase tracking-wide mb-1">{product.brand.name}</p>
        )}
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug mb-2">{product.name}</h3>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={11} className={cn("fill-current", s <= Math.round(product.rating) ? "text-yellow-400" : "text-gray-200")} />
              ))}
            </div>
            <span className="text-[10px] text-gray-500">({product.reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base font-bold text-gray-900">{formatPrice(product.price)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={isLoading || isOutOfStock}
          className={cn(
            "w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors",
            isOutOfStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700 active:scale-95"
          )}
        >
          <ShoppingCart size={13} />
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}
