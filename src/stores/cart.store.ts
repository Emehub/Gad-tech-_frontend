import { create } from 'zustand';
import api from '@/lib/axios';
import { Cart, CartItem } from '@/types';

interface CartState {
  cart: Cart | null;
  isOpen: boolean;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity: number, variantId?: string) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartState>()((set, get) => ({
  cart: null,
  isOpen: false,
  isLoading: false,

  fetchCart: async () => {
    try {
      const { data } = await api.get('/cart');
      set({ cart: data.data });
    } catch {}
  },

  addItem: async (productId, quantity, variantId) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/cart/items', { productId, quantity, variantId });
      set({ cart: data.data, isOpen: true });
    } finally {
      set({ isLoading: false });
    }
  },

  updateItem: async (itemId, quantity) => {
    set({ isLoading: true });
    try {
      const { data } = await api.put(`/cart/items/${itemId}`, { quantity });
      set({ cart: data.data });
    } finally {
      set({ isLoading: false });
    }
  },

  removeItem: async (itemId) => {
    set({ isLoading: true });
    try {
      const { data } = await api.delete(`/cart/items/${itemId}`);
      set({ cart: data.data });
    } finally {
      set({ isLoading: false });
    }
  },

  clearCart: async () => {
    try {
      const { data } = await api.delete('/cart');
      set({ cart: data.data });
    } catch {}
  },

  applyCoupon: async (code) => {
    const { data } = await api.post('/cart/coupon', { code });
    await get().fetchCart();
    return data;
  },

  removeCoupon: async () => {
    await api.delete('/cart/coupon');
    await get().fetchCart();
  },

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
}));
