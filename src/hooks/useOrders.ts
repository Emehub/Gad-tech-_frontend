import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Order, PaginatedResponse, ApiResponse } from '@/types';

export function useOrders(params?: Record<string, any>) {
  return useQuery<PaginatedResponse<Order>>({
    queryKey: ['orders', params],
    queryFn: async () => {
      const { data } = await api.get('/orders', { params });
      return data;
    },
  });
}

export function useOrder(id: string) {
  return useQuery<ApiResponse<Order>>({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { addressId: string; paymentMethod?: string; notes?: string }) =>
      api.post('/orders', dto).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.put(`/orders/${id}/cancel`, { reason }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useInitializePayment() {
  return useMutation({
    mutationFn: (orderId: string) =>
      api.post(`/payments/initialize/${orderId}`).then((r) => r.data),
  });
}
