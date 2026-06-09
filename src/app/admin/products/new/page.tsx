'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { ProductForm, ProductFormValues } from '@/components/admin/ProductForm';
import { useState } from 'react';

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(data: ProductFormValues) {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        comparePrice: data.comparePrice || undefined,
        costPrice: data.costPrice || undefined,
        weight: data.weight || undefined,
        brandId: data.brandId || undefined,
        variants: data.variants?.length ? data.variants : undefined,
        specs: data.specs?.length ? data.specs : undefined,
      };
      const res = await api.post('/products', payload);
      toast.success('Product created! Upload images now.');
      router.push(`/admin/products/${res.data.data.id}/edit`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="font-bold text-xl text-gray-900">Add New Product</h2>
          <p className="text-sm text-gray-500">Fill in the details below then upload images on the next step</p>
        </div>
      </div>
      <ProductForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
