import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import api from '@/lib/axios';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setUser: (user: User) => void;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          Cookies.set('accessToken', data.data.accessToken, { expires: 1 / 96 });
          Cookies.set('refreshToken', data.data.refreshToken, { expires: 7 });
          set({ user: data.data.user, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (registerData) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', registerData);
          Cookies.set('accessToken', data.data.accessToken, { expires: 1 / 96 });
          Cookies.set('refreshToken', data.data.refreshToken, { expires: 7 });
          set({ user: data.data.user, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {}
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        set({ user: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        const token = Cookies.get('accessToken');
        if (!token) return;
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.data, isAuthenticated: true });
        } catch {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          set({ user: null, isAuthenticated: false });
        }
      },

      setUser: (user) => set({ user, isAuthenticated: true }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
