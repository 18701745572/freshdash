import { create } from 'zustand';
import Taro from '@tarojs/taro';
import { UserInfo } from '@/types';

interface AuthState {
  token: string;
  userInfo: UserInfo | null;
  isLoggedIn: boolean;
  login: () => Promise<void>;
  loadFromStorage: () => void;
}

const MOCK_USER: UserInfo = {
  id: 'user-001',
  nickName: '鲜达用户',
  avatarUrl: 'https://picsum.photos/id/64/200/200',
  phone: '138****8000',
};

export const useAuthStore = create<AuthState>((set) => ({
  token: '',
  userInfo: null,
  isLoggedIn: false,

  loadFromStorage: () => {
    const token = Taro.getStorageSync('token') || '';
    const userInfo = Taro.getStorageSync('userInfo') || null;
    set({ token, userInfo, isLoggedIn: !!token });
  },

  login: async () => {
    await new Promise((r) => setTimeout(r, 300));
    const token = 'mock-jwt-token-' + Date.now();
    Taro.setStorageSync('token', token);
    Taro.setStorageSync('userInfo', MOCK_USER);
    set({ token, userInfo: MOCK_USER, isLoggedIn: true });
  },
}));
