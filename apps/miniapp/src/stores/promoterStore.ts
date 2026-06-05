import { create } from 'zustand';
import Taro from '@tarojs/taro';
import { CommissionRecord, PromoterStats } from '@/types';
import { MOCK_PROMOTER_CODE, mockCommissionRecords, mockPromoterStats } from '@/services/mock/promoter';

interface PromoterState {
  isPromoter: boolean;
  isBound: boolean;
  boundCode: string;
  stats: PromoterStats;
  records: CommissionRecord[];
  loadFromStorage: () => void;
  persist: () => void;
  bindPromoter: (code: string) => void;
  apply: (data: { name: string; phone: string; inviteCode?: string }) => Promise<boolean>;
  withdraw: (amount: number) => { success: boolean; message?: string };
}

const STORAGE_KEY = 'promoter_state';

export const usePromoterStore = create<PromoterState>((set, get) => ({
  isPromoter: false,
  isBound: false,
  boundCode: '',
  stats: { ...mockPromoterStats },
  records: [...mockCommissionRecords],

  loadFromStorage: () => {
    const saved = Taro.getStorageSync(STORAGE_KEY);
    if (saved) {
      set(saved);
    }
  },

  persist: () => {
    const { isPromoter, isBound, boundCode, stats, records } = get();
    Taro.setStorageSync(STORAGE_KEY, { isPromoter, isBound, boundCode, stats, records });
  },

  bindPromoter: (code) => {
    if (get().isBound) return;
    set({ isBound: true, boundCode: code });
    get().persist();
  },

  apply: async (data) => {
    await new Promise((r) => setTimeout(r, 500));
    if (!data.name.trim()) return false;
    if (!/^1\d{10}$/.test(data.phone)) return false;
    set({
      isPromoter: true,
      stats: { ...mockPromoterStats },
      records: [...mockCommissionRecords],
    });
    get().persist();
    return true;
  },

  withdraw: (amount) => {
    const minAmount = 1000;
    if (amount < minAmount) {
      return { success: false, message: '提现金额不能低于 10 元' };
    }
    const stats = get().stats;
    if (amount > stats.pendingAmount) {
      return { success: false, message: '提现金额超过可提现余额' };
    }
    set({
      stats: {
        ...stats,
        pendingAmount: stats.pendingAmount - amount,
        settledAmount: stats.settledAmount + amount,
      },
    });
    get().persist();
    return { success: true };
  },
}));

export const getPromoterCode = () => MOCK_PROMOTER_CODE;
