import { create } from 'zustand';
import { clearAuthSession, getSupplierName, isTokenValid, saveAuthSession } from '@/utils/auth';
import { supplierService } from '@/services';

interface AuthState {
  isLoggedIn: boolean;
  supplierName: string;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: isTokenValid(),
  supplierName: getSupplierName(),

  login: async (username, password) => {
    const result = await supplierService.login(username, password);
    saveAuthSession(result);
    set({ isLoggedIn: true, supplierName: result.supplierName });
  },

  logout: () => {
    clearAuthSession();
    set({ isLoggedIn: false, supplierName: '' });
  },

  hydrate: () => {
    set({
      isLoggedIn: isTokenValid(),
      supplierName: getSupplierName(),
    });
  },
}));
