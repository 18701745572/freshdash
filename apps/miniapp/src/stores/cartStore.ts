import { create } from 'zustand';
import Taro from '@tarojs/taro';
import { CartItem, Product } from '@/types';
import { calcDiscount, calcSubtotal, calcTotal } from '@/utils/price';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleSelect: (id: string) => void;
  toggleAll: (selected: boolean) => void;
  getSelectedItems: () => CartItem[];
  getSubtotal: () => number;
  getDiscount: () => number;
  getTotal: () => number;
  isAllSelected: () => boolean;
  preview: () => { valid: boolean; message?: string };
  loadFromStorage: () => void;
  persist: () => void;
}

const STORAGE_KEY = 'cart_items';

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  loadFromStorage: () => {
    const items = Taro.getStorageSync(STORAGE_KEY) || [];
    set({ items });
  },

  persist: () => {
    Taro.setStorageSync(STORAGE_KEY, get().items);
  },

  addItem: (product, quantity = 1) => {
    const items = [...get().items];
    const existing = items.find((i) => i.product.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({
        id: `cart-${product.id}`,
        product,
        quantity,
        selected: true,
      });
    }
    set({ items });
    get().persist();
  },

  removeItem: (id) => {
    const items = get().items.filter((i) => i.id !== id);
    set({ items });
    get().persist();
  },

  updateQuantity: (id, quantity) => {
    const items = get().items.map((i) =>
      i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
    );
    set({ items });
    get().persist();
  },

  toggleSelect: (id) => {
    const items = get().items.map((i) =>
      i.id === id ? { ...i, selected: !i.selected } : i
    );
    set({ items });
    get().persist();
  },

  toggleAll: (selected) => {
    const items = get().items.map((i) => ({ ...i, selected }));
    set({ items });
    get().persist();
  },

  getSelectedItems: () => get().items.filter((i) => i.selected),

  getSubtotal: () => {
    const selected = get().getSelectedItems();
    return calcSubtotal(
      selected.map((i) => ({ price: i.product.price, quantity: i.quantity }))
    );
  },

  getDiscount: () => calcDiscount(get().getSubtotal()),

  getTotal: () => calcTotal(get().getSubtotal()),

  isAllSelected: () => {
    const items = get().items;
    return items.length > 0 && items.every((i) => i.selected);
  },

  preview: () => {
    const selected = get().getSelectedItems();
    if (selected.length === 0) {
      return { valid: false, message: '请选择商品' };
    }
    for (const item of selected) {
      const stock = item.product.stock ?? 100;
      if (item.quantity > stock) {
        return { valid: false, message: `${item.product.name} 库存不足` };
      }
    }
    return { valid: true };
  },
}));
