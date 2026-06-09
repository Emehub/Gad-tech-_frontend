'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { ProductForm, ProductFormValues } from '@/components/admin/ProductForm';
import { useState } from 'react';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-product-detail', id],
    queryFn: () => api.get(`/products/${id}/admin-detail`).then((r) => r.data.data),
    enabled: !!id,
  });

  async function handleSubmit(formData: ProductFormValues) {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        comparePrice: formData.comparePrice || undefined,
        costPrice: formData.costPrice || undefined,
        weight: formData.weight || undefined,
        brandId: formData.brandId || undefined,
      };
      await api.put(`/products/${id}`, payload);
      toast.success('Product updated');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="h-8 bg-gray-200 rounded-xl w-48 animate-pulse" />
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 space-y-4">
            {[180, 120, 200].map((h, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl animate-pulse" style={{ height: h }} />
            ))}
          </div>
          <div className="space-y-4">
            {[120, 160, 140].map((h, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl animate-pulse" style={{ height: h }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="font-bold text-xl text-gray-900">Edit Product</h2>
          <p className="text-sm text-gray-500 truncate max-w-lg">{data?.name}</p>
        </div>
      </div>
      <ProductForm
        product={data}
        productId={id}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
