import { create } from 'zustand';
import Taro from '@tarojs/taro';
import { Address } from '@/types';

interface AddressState {
  addresses: Address[];
  loadFromStorage: () => void;
  persist: () => void;
  addAddress: (addr: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, data: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefault: (id: string) => void;
  getDefault: () => Address | undefined;
  getById: (id: string) => Address | undefined;
}

const STORAGE_KEY = 'addresses';

const DEFAULT_ADDRESSES: Address[] = [
  {
    id: '1', name: '张三', phone: '13800138000',
    province: '广东省', city: '深圳市', district: '南山区',
    detail: '科技园南路88号', isDefault: true,
  },
  {
    id: '2', name: '李四', phone: '13900139000',
    province: '广东省', city: '深圳市', district: '福田区',
    detail: '中心区一路100号', isDefault: false,
  },
];

export const useAddressStore = create<AddressState>((set, get) => ({
  addresses: [],

  loadFromStorage: () => {
    let addresses = Taro.getStorageSync(STORAGE_KEY);
    if (!addresses || addresses.length === 0) {
      addresses = DEFAULT_ADDRESSES;
      Taro.setStorageSync(STORAGE_KEY, addresses);
    }
    set({ addresses });
  },

  persist: () => {
    Taro.setStorageSync(STORAGE_KEY, get().addresses);
  },

  addAddress: (addr) => {
    const id = `addr-${Date.now()}`;
    let addresses = [...get().addresses, { ...addr, id }];
    if (addr.isDefault) {
      addresses = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    }
    set({ addresses });
    get().persist();
  },

  updateAddress: (id, data) => {
    let addresses = get().addresses.map((a) =>
      a.id === id ? { ...a, ...data } : a
    );
    if (data.isDefault) {
      addresses = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    }
    set({ addresses });
    get().persist();
  },

  deleteAddress: (id) => {
    const addresses = get().addresses.filter((a) => a.id !== id);
    set({ addresses });
    get().persist();
  },

  setDefault: (id) => {
    const addresses = get().addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    set({ addresses });
    get().persist();
  },

  getDefault: () => get().addresses.find((a) => a.isDefault),

  getById: (id) => get().addresses.find((a) => a.id === id),
}));
