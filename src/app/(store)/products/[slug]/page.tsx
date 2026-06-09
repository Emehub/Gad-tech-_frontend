'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ShoppingCart, Heart, Star, ChevronRight, Minus, Plus, Share2, Truck, Shield, Package } from 'lucide-react';
import { useProduct } from '@/hooks/useProducts';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { ProductGrid } from '@/components/product/ProductGrid';
import { formatPrice, getDiscountPercent, cn } from '@/lib/utils';
import { ProductVariant } from '@/types';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = useProduct(slug);
  const product = data?.data;

  const { addItem, isLoading: cartLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');

  // Reviews
  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', product?.id],
    queryFn: () => api.get(`/reviews/product/${product?.id}`).then((r) => r.data),
    enabled: !!product?.id,
  });

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addItem(product.id, quantity, selectedVariant?.id);
      toast.success(`${product.name} added to cart!`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to add to cart');
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please login to add to wishlist'); return; }
    try {
      const { data: r } = await api.post(`/users/wishlist/${product?.id}`);
      toast.success(r.message);
    } catch { toast.error('Failed to update wishlist'); }
  };

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
        <div className="aspect-square bg-gray-200 rounded-xl" />
        <div className="space-y-4">
          {[200, 100, 150, 80, 120].map((w, i) => <div key={i} className={`h-5 bg-gray-200 rounded`} style={{ width: `${w}px` }} />)}
        </div>
      </div>
    </div>
  );

  if (!product) return <div className="text-center py-20 text-gray-500">Product not found.</div>;

  const images = product.images ?? [];
  const discount = product.comparePrice ? getDiscountPercent(product.price, product.comparePrice) : 0;
  const currentPrice = selectedVariant?.price ? Number(selectedVariant.price) : Number(product.price);
  const stock = selectedVariant ? selectedVariant.stock : product.stock;
  const maxQty = Math.min(stock, 10);

  // Group variants by name
  const variantGroups = (product.variants ?? []).reduce((acc: Record<string, ProductVariant[]>, v) => {
    acc[v.name] = acc[v.name] ?? [];
    acc[v.name].push(v);
    return acc;
  }, {});

  const reviews = reviewsData?.data ?? [];
  const ratingDist = reviewsData?.ratingDistribution ?? {};

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-red-600">Home</Link>
        <ChevronRight size={14} />
        <Link href="/products" className="hover:text-red-600">Products</Link>
        <ChevronRight size={14} />
        <Link href={`/products?categoryId=${product.category.id}`} className="hover:text-red-600">{product.category.name}</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
            {images[selectedImage] ? (
              <Image src={images[selectedImage].url} alt={product.name} width={600} height={600} className="w-full h-full object-contain p-4" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={80} /></div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button key={img.id} onClick={() => setSelectedImage(i)} className={cn("w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-colors", i === selectedImage ? "border-red-500" : "border-gray-100 hover:border-gray-300")}>
                  <Image src={img.url} alt="" width={64} height={64} className="w-full h-full object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.brand && (
            <Link href={`/products?brandId=${product.brand.id}`} className="text-sm font-semibold text-red-600 hover:underline uppercase tracking-wide">
              {product.brand.name}
            </Link>
          )}
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mt-1 mb-3 leading-tight">{product.name}</h1>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">{[1,2,3,4,5].map((s) => <Star key={s} size={16} className={cn("fill-current", s <= Math.round(product.rating) ? "text-yellow-400" : "text-gray-200")} />)}</div>
              <span className="text-sm text-gray-600">{product.rating.toFixed(1)} ({product.reviewCount} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-3xl font-bold text-gray-900">{formatPrice(currentPrice)}</span>
            {product.comparePrice && Number(product.comparePrice) > currentPrice && (
              <span className="text-lg text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
            )}
            {discount > 0 && <span className="bg-red-100 text-red-600 text-sm font-bold px-2.5 py-0.5 rounded-full">-{discount}%</span>}
          </div>

          {product.shortDesc && <p className="text-gray-600 text-sm mb-5 leading-relaxed">{product.shortDesc}</p>}

          {/* Variants */}
          {Object.entries(variantGroups).map(([name, variants]) => (
            <div key={name} className="mb-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                {name}: {selectedVariant?.name === name && <span className="text-red-600 font-medium">{selectedVariant.value}</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(selectedVariant?.id === v.id ? null : v)}
                    disabled={v.stock === 0}
                    className={cn(
                      "px-3 py-1.5 border rounded-lg text-sm font-medium transition-all",
                      selectedVariant?.id === v.id ? "border-red-500 bg-red-50 text-red-600" : "border-gray-200 hover:border-gray-400",
                      v.stock === 0 && "opacity-40 cursor-not-allowed line-through"
                    )}
                  >
                    {v.value}
                    {v.price && <span className="ml-1 text-xs text-gray-500">(+{formatPrice(Number(v.price) - Number(product.price))})</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Stock */}
          <div className="flex items-center gap-2 mb-5">
            <div className={cn("w-2 h-2 rounded-full", stock > 0 ? "bg-green-500" : "bg-red-500")} />
            <span className={cn("text-sm font-medium", stock > 0 ? "text-green-700" : "text-red-600")}>
              {stock > 0 ? (stock <= 5 ? `Only ${stock} left in stock!` : 'In Stock') : 'Out of Stock'}
            </span>
          </div>

          {/* Qty & Add to cart */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 transition-colors"><Minus size={16} /></button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(maxQty, quantity + 1))} disabled={quantity >= maxQty} className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-40"><Plus size={16} /></button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={cartLoading || stock === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <ShoppingCart size={18} />
              {stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button onClick={handleWishlist} className="w-12 h-12 border border-gray-200 rounded-xl flex items-center justify-center hover:border-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
              <Heart size={20} />
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 border-t pt-5">
            {[{ icon: Truck, text: 'Free Delivery over GHS 500' }, { icon: Shield, text: 'Authentic & Warranted' }, { icon: Package, text: '7-Day Return Policy' }].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-1 text-center">
                <Icon size={20} className="text-red-600" />
                <span className="text-[10px] text-gray-600 leading-tight">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-12">
        <div className="flex border-b">
          {(['description', 'specs', 'reviews'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-6 py-4 text-sm font-semibold capitalize transition-colors", activeTab === tab ? "text-red-600 border-b-2 border-red-600" : "text-gray-600 hover:text-gray-900")}>
              {tab}{tab === 'reviews' && ` (${product.reviewCount})`}
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeTab === 'description' && (
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
              {product.description ? <div dangerouslySetInnerHTML={{ __html: product.description }} /> : <p className="text-gray-500">No description available.</p>}
            </div>
          )}

          {activeTab === 'specs' && (
            <div>
              {product.specs && product.specs.length > 0 ? (
                <table className="w-full text-sm">
                  <tbody>
                    {product.specs.map((spec) => (
                      <tr key={spec.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-2.5 pr-4 font-medium text-gray-700 w-1/3">{spec.key}</td>
                        <td className="py-2.5 text-gray-600">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p className="text-gray-500">No specifications available.</p>}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              {reviews.length === 0 ? (
                <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
              ) : (
                <div className="space-y-5">
                  {/* Rating summary */}
                  <div className="flex items-center gap-6 pb-5 border-b">
                    <div className="text-center">
                      <p className="text-5xl font-bold text-gray-900">{product.rating.toFixed(1)}</p>
                      <div className="flex justify-center my-1">
                        {[1,2,3,4,5].map((s) => <Star key={s} size={14} className={cn("fill-current", s <= Math.round(product.rating) ? "text-yellow-400" : "text-gray-200")} />)}
                      </div>
                      <p className="text-xs text-gray-500">{product.reviewCount} reviews</p>
                    </div>
                    <div className="flex-1 space-y-1">
                      {[5,4,3,2,1].map((star) => {
                        const count = ratingDist[star] ?? 0;
                        const pct = product.reviewCount > 0 ? (count / product.reviewCount) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-2 text-sm">
                            <span className="w-3 text-gray-600">{star}</span>
                            <Star size={12} className="text-yellow-400 fill-current" />
                            <div className="flex-1 bg-gray-100 rounded-full h-2">
                              <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="w-6 text-xs text-gray-500">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {reviews.map((review: any) => (
                    <div key={review.id} className="pb-5 border-b last:border-0">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center font-semibold text-red-600 text-sm shrink-0">
                          {review.user.firstName[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{review.user.firstName} {review.user.lastName}</span>
                            {review.isVerified && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">Verified Purchase</span>}
                          </div>
                          <div className="flex mb-2">{[1,2,3,4,5].map((s) => <Star key={s} size={12} className={cn("fill-current", s <= review.rating ? "text-yellow-400" : "text-gray-200")} />)}</div>
                          {review.title && <p className="font-medium text-sm mb-1">{review.title}</p>}
                          {review.body && <p className="text-sm text-gray-600">{review.body}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {product.related && product.related.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
          <ProductGrid products={product.related} />
        </div>
      )}
    </div>
  );
}
