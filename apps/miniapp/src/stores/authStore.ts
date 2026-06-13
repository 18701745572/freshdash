import { create } from 'zustand';
import Taro from '@tarojs/taro';
import { request } from '@/services/api';
import { UserInfo } from '@/types';

interface AuthState {
  token: string;
  userInfo: UserInfo | null;
  isLoggedIn: boolean;
  login: () => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
}

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
    try {
      const { code } = await Taro.login();
      const res = await request<{ token: string; user: UserInfo }>({
        url: '/auth/wechat-login',
        method: 'POST',
        data: { code },
      });

      Taro.setStorageSync('token', res.token);
      Taro.setStorageSync('userInfo', res.user);
      set({ token: res.token, userInfo: res.user, isLoggedIn: true });
    } catch (err) {
      console.error('登录失败', err);
      // 开发环境降级到 mock 登录
      if (process.env.NODE_ENV === 'development') {
        const mockUser: UserInfo = {
          id: 'dev-user-001',
          nickName: '开发用户',
          avatarUrl: '',
          phone: '',
        };
        Taro.setStorageSync('token', 'dev-token');
        Taro.setStorageSync('userInfo', mockUser);
        set({ token: 'dev-token', userInfo: mockUser, isLoggedIn: true });
      }
    }
  },

  logout: () => {
    Taro.removeStorageSync('token');
    Taro.removeStorageSync('userInfo');
    set({ token: '', userInfo: null, isLoggedIn: false });
  },
}));
