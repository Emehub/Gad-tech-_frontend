'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2, Loader2, Upload, X, Star } from 'lucide-react';
import Image from 'next/image';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const optNum = () =>
  z.preprocess((v) => (v === '' || v === null || v === undefined ? undefined : Number(v)), z.number().positive().optional());

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  shortDesc: z.string().optional(),
  sku: z.string().optional(),
  price: z.coerce.number().min(0.01, 'Price is required'),
  comparePrice: optNum(),
  costPrice: optNum(),
  stock: z.coerce.number().int().min(0).default(0),
  lowStockAlert: z.coerce.number().int().min(0).default(5),
  weight: optNum(),
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.preprocess((v) => (v === '' ? undefined : v), z.string().optional()),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  tags: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
  variants: z.array(z.object({
    name: z.string().min(1, 'Required'),
    value: z.string().min(1, 'Required'),
    price: optNum(),
    stock: z.coerce.number().int().min(0).default(0),
    sku: z.string().optional(),
  })).default([]),
  specs: z.array(z.object({
    key: z.string().min(1, 'Required'),
    value: z.string().min(1, 'Required'),
  })).default([]),
});

export type ProductFormValues = z.output<typeof schema>;

interface ProductFormProps {
  product?: any;
  productId?: string;
  onSubmit: (data: ProductFormValues) => Promise<void>;
  isSubmitting: boolean;
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      {title && <h3 className="font-semibold text-gray-800 mb-4">{title}</h3>}
      {children}
    </div>
  );
}

function Field({ label, error, children, hint }: { label: string; error?: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/20";

export function ProductForm({ product, productId, onSubmit, isSubmitting }: ProductFormProps) {
  const isEdit = !!product;
  const [images, setImages] = useState<any[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: catData } = useQuery({
    queryKey: ['categories-all'],
    queryFn: () => api.get('/categories').then((r) => r.data.data),
  });
  const { data: brandData } = useQuery({
    queryKey: ['brands-all'],
    queryFn: () => api.get('/brands').then((r) => r.data.data),
  });

  const categories = Array.isArray(catData) ? catData : [];
  const brands = Array.isArray(brandData) ? brandData : [];

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<z.input<typeof schema>, any, ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: product ? {
      name: product.name,
      description: product.description ?? '',
      shortDesc: product.shortDesc ?? '',
      sku: product.sku ?? '',
      price: product.price,
      comparePrice: product.comparePrice ?? undefined,
      costPrice: product.costPrice ?? undefined,
      stock: product.stock ?? 0,
      lowStockAlert: product.lowStockAlert ?? 5,
      weight: product.weight ?? undefined,
      categoryId: product.categoryId ?? product.category?.id ?? '',
      brandId: product.brandId ?? product.brand?.id ?? '',
      status: product.status ?? 'DRAFT',
      isFeatured: product.isFeatured ?? false,
      isNewArrival: product.isNewArrival ?? false,
      isBestSeller: product.isBestSeller ?? false,
      tags: (product.tags ?? []).join(', '),
      metaTitle: product.metaTitle ?? '',
      metaDesc: product.metaDesc ?? '',
      variants: product.variants ?? [],
      specs: product.specs ?? [],
    } : {
      status: 'DRAFT',
      stock: 0,
      lowStockAlert: 5,
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      variants: [],
      specs: [],
    },
  });

  useEffect(() => {
    if (product) reset({
      name: product.name,
      description: product.description ?? '',
      shortDesc: product.shortDesc ?? '',
      sku: product.sku ?? '',
      price: product.price,
      comparePrice: product.comparePrice ?? undefined,
      costPrice: product.costPrice ?? undefined,
      stock: product.stock ?? 0,
      lowStockAlert: product.lowStockAlert ?? 5,
      weight: product.weight ?? undefined,
      categoryId: product.categoryId ?? product.category?.id ?? '',
      brandId: product.brandId ?? product.brand?.id ?? '',
      status: product.status ?? 'DRAFT',
      isFeatured: product.isFeatured ?? false,
      isNewArrival: product.isNewArrival ?? false,
      isBestSeller: product.isBestSeller ?? false,
      tags: (product.tags ?? []).join(', '),
      metaTitle: product.metaTitle ?? '',
      metaDesc: product.metaDesc ?? '',
      variants: product.variants ?? [],
      specs: product.specs ?? [],
    });
    setImages(product?.images ?? []);
  }, [product, reset]);

  const { fields: variantFields, append: addVariant, remove: removeVariant } = useFieldArray({ control, name: 'variants' });
  const { fields: specFields, append: addSpec, remove: removeSpec } = useFieldArray({ control, name: 'specs' });

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !productId) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const { data } = await api.post(`/uploads/products/${productId}/images`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImages((prev) => [...prev, data.data]);
      toast.success('Image uploaded');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Image upload failed';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleDeleteImage(imageId: string) {
    try {
      await api.delete(`/uploads/products/images/${imageId}`);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success('Image removed');
    } catch {
      toast.error('Failed to remove image');
    }
  }

  async function handleSetPrimary(imageId: string) {
    try {
      await api.patch(`/uploads/products/images/${imageId}/primary`);
      setImages((prev) => prev.map((img) => ({ ...img, isPrimary: img.id === imageId })));
      toast.success('Primary image updated');
    } catch {
      toast.error('Failed to update primary image');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* ─── Left column (2/3) ────────────────────────────────────── */}
      <div className="lg:col-span-2 space-y-5">

        {/* Basic Info */}
        <Card title="Basic Information">
          <div className="space-y-4">
            <Field label="Product Name *" error={errors.name?.message}>
              <input {...register('name')} className={inputCls} placeholder="e.g. Samsung Galaxy S24 Ultra" />
            </Field>
            <Field label="Short Description" error={errors.shortDesc?.message}>
              <input {...register('shortDesc')} className={inputCls} placeholder="One-line summary shown in listings" />
            </Field>
            <Field label="Full Description">
              <textarea {...register('description')} rows={5} className={inputCls} placeholder="Full product description..." />
            </Field>
          </div>
        </Card>

        {/* Variants */}
        <Card title="Variants (optional)">
          <div className="space-y-3">
            {variantFields.map((field, i) => (
              <div key={field.id} className="grid grid-cols-5 gap-2 items-start p-3 bg-gray-50 rounded-xl">
                <div>
                  <input {...register(`variants.${i}.name`)} placeholder="Type (e.g. Color)" className={inputCls} />
                  {errors.variants?.[i]?.name && <p className="text-xs text-red-500 mt-0.5">{errors.variants[i]?.name?.message}</p>}
                </div>
                <div>
                  <input {...register(`variants.${i}.value`)} placeholder="Value (e.g. Black)" className={inputCls} />
                  {errors.variants?.[i]?.value && <p className="text-xs text-red-500 mt-0.5">{errors.variants[i]?.value?.message}</p>}
                </div>
                <input {...register(`variants.${i}.price`)} placeholder="Price" type="number" step="0.01" className={inputCls} />
                <input {...register(`variants.${i}.stock`)} placeholder="Stock" type="number" className={inputCls} />
                <button type="button" onClick={() => removeVariant(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-0.5">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addVariant({ name: '', value: '', stock: 0 })}
              className="flex items-center gap-1.5 text-sm text-green-600 font-medium hover:bg-green-50 px-3 py-2 rounded-lg transition-colors"
            >
              <Plus size={15} /> Add Variant
            </button>
          </div>
        </Card>

        {/* Specifications */}
        <Card title="Specifications (optional)">
          <div className="space-y-3">
            {specFields.map((field, i) => (
              <div key={field.id} className="grid grid-cols-3 gap-2 items-start">
                <div>
                  <input {...register(`specs.${i}.key`)} placeholder="e.g. RAM" className={inputCls} />
                  {errors.specs?.[i]?.key && <p className="text-xs text-red-500 mt-0.5">{errors.specs[i]?.key?.message}</p>}
                </div>
                <div>
                  <input {...register(`specs.${i}.value`)} placeholder="e.g. 8GB" className={inputCls} />
                  {errors.specs?.[i]?.value && <p className="text-xs text-red-500 mt-0.5">{errors.specs[i]?.value?.message}</p>}
                </div>
                <button type="button" onClick={() => removeSpec(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-0.5 w-fit">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addSpec({ key: '', value: '' })}
              className="flex items-center gap-1.5 text-sm text-green-600 font-medium hover:bg-green-50 px-3 py-2 rounded-lg transition-colors"
            >
              <Plus size={15} /> Add Spec
            </button>
          </div>
        </Card>

        {/* SEO */}
        <Card title="SEO (optional)">
          <div className="space-y-4">
            <Field label="Meta Title">
              <input {...register('metaTitle')} className={inputCls} placeholder="Overrides product name in search results" />
            </Field>
            <Field label="Meta Description">
              <textarea {...register('metaDesc')} rows={2} className={inputCls} placeholder="150-160 characters for best SEO" />
            </Field>
          </div>
        </Card>

        {/* Images (edit only) */}
        {isEdit && productId && (
          <Card title="Product Images">
            <div className="space-y-4">
              {images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {images.map((img) => (
                    <div key={img.id} className="relative group aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                      <Image src={img.url} alt="product" fill className="object-contain p-2" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(img.id)}
                          title="Set as primary"
                          className={cn("p-1.5 rounded-lg transition-colors", img.isPrimary ? "bg-yellow-400 text-white" : "bg-white/80 text-gray-700 hover:bg-yellow-400 hover:text-white")}
                        >
                          <Star size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.id)}
                          className="p-1.5 bg-white/80 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                        >
                          <X size={13} />
                        </button>
                      </div>
                      {img.isPrimary && (
                        <span className="absolute top-1 left-1 bg-yellow-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">PRIMARY</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 border-2 border-dashed border-gray-200 hover:border-green-400 rounded-xl px-5 py-4 text-sm text-gray-500 hover:text-green-600 w-full justify-center transition-colors disabled:opacity-50"
                >
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {uploading ? 'Uploading...' : 'Click to upload image'}
                </button>
                <p className="text-xs text-gray-400 mt-1.5">Star = set as primary (shown in listings). Max 10MB per image.</p>
              </div>
            </div>
          </Card>
        )}

        {!isEdit && (
          <Card>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Upload size={15} className="text-gray-400" />
              Images can be uploaded after the product is created (on the edit page).
            </p>
          </Card>
        )}
      </div>

      {/* ─── Right sidebar (1/3) ──────────────────────────────────── */}
      <div className="space-y-5">

        {/* Publish */}
        <Card title="Publish">
          <div className="space-y-4">
            <Field label="Status" error={errors.status?.message}>
              <select {...register('status')} className={inputCls}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </Field>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </Card>

        {/* Pricing */}
        <Card title="Pricing (GHS)">
          <div className="space-y-3">
            <Field label="Selling Price *" error={errors.price?.message}>
              <input {...register('price')} type="number" step="0.01" className={inputCls} placeholder="0.00" />
            </Field>
            <Field label="Compare-at Price" error={errors.comparePrice?.message} hint="Crossed-out price shown next to selling price">
              <input {...register('comparePrice')} type="number" step="0.01" className={inputCls} placeholder="0.00" />
            </Field>
            <Field label="Cost Price" error={errors.costPrice?.message} hint="For profit tracking only, not shown to customers">
              <input {...register('costPrice')} type="number" step="0.01" className={inputCls} placeholder="0.00" />
            </Field>
          </div>
        </Card>

        {/* Inventory */}
        <Card title="Inventory">
          <div className="space-y-3">
            <Field label="SKU">
              <input {...register('sku')} className={inputCls} placeholder="Stock keeping unit" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Stock" error={errors.stock?.message}>
                <input {...register('stock')} type="number" className={inputCls} placeholder="0" />
              </Field>
              <Field label="Low Stock Alert">
                <input {...register('lowStockAlert')} type="number" className={inputCls} placeholder="5" />
              </Field>
            </div>
            <Field label="Weight (kg)">
              <input {...register('weight')} type="number" step="0.01" className={inputCls} placeholder="0.00" />
            </Field>
          </div>
        </Card>

        {/* Organization */}
        <Card title="Organization">
          <div className="space-y-3">
            <Field label="Category *" error={errors.categoryId?.message}>
              <select {...register('categoryId')} className={inputCls}>
                <option value="">Select category...</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Brand">
              <select {...register('brandId')} className={inputCls}>
                <option value="">No brand</option>
                {brands.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </Field>
          </div>
        </Card>

        {/* Flags */}
        <Card title="Product Flags">
          <div className="space-y-3">
            {[
              { name: 'isFeatured' as const, label: 'Featured', desc: 'Show in Featured Products section' },
              { name: 'isNewArrival' as const, label: 'New Arrival', desc: 'Show in New Arrivals section' },
              { name: 'isBestSeller' as const, label: 'Best Seller', desc: 'Show in Best Sellers section' },
            ].map(({ name, label, desc }) => (
              <label key={name} className="flex items-start gap-3 cursor-pointer">
                <input {...register(name)} type="checkbox" className="mt-0.5 w-4 h-4 accent-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </label>
            ))}
          </div>
        </Card>

        {/* Tags */}
        <Card title="Tags">
          <Field label="Tags" hint="Comma-separated: laptop, gaming, hp">
            <input {...register('tags')} className={inputCls} placeholder="tag1, tag2, tag3" />
          </Field>
        </Card>

      </div>
    </form>
  );
}
