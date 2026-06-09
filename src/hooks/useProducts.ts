import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Product, PaginatedResponse, ApiResponse } from '@/types';

export function useProducts(params?: Record<string, any>) {
  return useQuery<PaginatedResponse<Product>>({
    queryKey: ['products', params],
    queryFn: async () => {
      const { data } = await api.get('/products', { params });
      return data;
    },
  });
}

export function useProduct(idOrSlug: string) {
  return useQuery<ApiResponse<Product>>({
    queryKey: ['product', idOrSlug],
    queryFn: async () => {
      const { data } = await api.get(`/products/${idOrSlug}`);
      return data;
    },
    enabled: !!idOrSlug,
  });
}

export function useFeaturedProducts() {
  return useQuery<ApiResponse<Product[]>>({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const { data } = await api.get('/products/featured');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useNewArrivals() {
  return useQuery<ApiResponse<Product[]>>({
    queryKey: ['products', 'new-arrivals'],
    queryFn: async () => {
      const { data } = await api.get('/products/new-arrivals');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useBestSellers() {
  return useQuery<ApiResponse<Product[]>>({
    queryKey: ['products', 'best-sellers'],
    queryFn: async () => {
      const { data } = await api.get('/products/best-sellers');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductSearch(query: string) {
  return useQuery<ApiResponse<Product[]>>({
    queryKey: ['products', 'search', query],
    queryFn: async () => {
      const { data } = await api.get('/products/search', { params: { q: query } });
      return data;
    },
    enabled: query.length >= 2,
  });
}
