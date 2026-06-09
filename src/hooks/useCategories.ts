import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Category, Brand, Banner, ApiResponse } from '@/types';

export function useCategories() {
  return useQuery<ApiResponse<Category[]>>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useBrands() {
  return useQuery<ApiResponse<Brand[]>>({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data } = await api.get('/brands');
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useBanners(position?: string) {
  return useQuery<ApiResponse<Banner[]>>({
    queryKey: ['banners', position],
    queryFn: async () => {
      const { data } = await api.get('/banners', { params: position ? { position } : undefined });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
