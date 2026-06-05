import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminUser } from '../types';

interface AuthState {
  token: string | null;
  user: AdminUser | null;
  remember: boolean;
  setAuth: (token: string, user: AdminUser, remember?: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      remember: false,
      setAuth: (token, user, remember = false) => {
        localStorage.setItem('admin_token', token);
        set({ token, user, remember });
      },
      logout: () => {
        localStorage.removeItem('admin_token');
        set({ token: null, user: null, remember: false });
      },
    }),
    {
      name: 'admin-auth',
      partialize: (state) =>
        state.remember ? { token: state.token, user: state.user, remember: state.remember } : { remember: false },
    }
  )
);
