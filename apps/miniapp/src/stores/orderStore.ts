import { create } from 'zustand';
import Taro from '@tarojs/taro';
import { Address, CartItem, Order, OrderStatus } from '@/types';
import { calcDiscount, calcSubtotal, calcTotal } from '@/utils/price';

interface OrderState {
  orders: Order[];
  loadFromStorage: () => void;
  persist: () => void;
  createOrder: (items: CartItem[], address: Address, remark?: string) => Order;
  updateStatus: (id: string, status: OrderStatus) => void;
  getById: (id: string) => Order | undefined;
  getByStatus: (status?: OrderStatus) => Order[];
}

const STORAGE_KEY = 'orders';

const DEFAULT_ORDERS: Order[] = [
  {
    id: '1', orderNo: 'XD20240604001', status: 'pending_payment',
    totalAmount: 4380, discountAmount: 500,
    items: [
      { id: 'i1', productName: '烟台红富士苹果', productImage: 'https://picsum.photos/id/292/300/300', price: 1990, quantity: 1 },
      { id: 'i2', productName: '鲜活基围虾', productImage: 'https://picsum.photos/id/431/300/300', price: 3990, quantity: 1 },
    ],
    createdAt: '2024-06-04 10:30',
    address: {
      id: '1', name: '张三', phone: '13800138000',
      province: '广东省', city: '深圳市', district: '南山区',
      detail: '科技园南路88号', isDefault: true,
    },
  },
  {
    id: '2', orderNo: 'XD20240603002', status: 'shipped',
    totalAmount: 2990, discountAmount: 0,
    items: [
      { id: 'i3', productName: '精品五花肉', productImage: 'https://picsum.photos/id/401/300/300', price: 2990, quantity: 1 },
    ],
    createdAt: '2024-06-03 15:20',
    address: {
      id: '1', name: '张三', phone: '13800138000',
      province: '广东省', city: '深圳市', district: '南山区',
      detail: '科技园南路88号', isDefault: true,
    },
  },
];

let orderSeq = 3;

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],

  loadFromStorage: () => {
    let orders = Taro.getStorageSync(STORAGE_KEY);
    if (!orders || orders.length === 0) {
      orders = DEFAULT_ORDERS;
      Taro.setStorageSync(STORAGE_KEY, orders);
    }
    set({ orders });
  },

  persist: () => {
    Taro.setStorageSync(STORAGE_KEY, get().orders);
  },

  createOrder: (items, address, remark) => {
    const subtotal = calcSubtotal(
      items.map((i) => ({ price: i.product.price, quantity: i.quantity }))
    );
    const discount = calcDiscount(subtotal);
    const total = calcTotal(subtotal);
    const now = new Date();
    const order: Order = {
      id: String(orderSeq++),
      orderNo: `XD${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(orderSeq).padStart(3, '0')}`,
      status: 'pending_payment',
      totalAmount: total,
      discountAmount: discount,
      items: items.map((i, idx) => ({
        id: `oi-${idx}`,
        productName: i.product.name,
        productImage: i.product.coverImage,
        price: i.product.price,
        quantity: i.quantity,
      })),
      createdAt: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      address,
      remark,
    };
    const orders = [order, ...get().orders];
    set({ orders });
    get().persist();
    return order;
  },

  updateStatus: (id, status) => {
    const orders = get().orders.map((o) =>
      o.id === id ? { ...o, status } : o
    );
    set({ orders });
    get().persist();
  },

  getById: (id) => get().orders.find((o) => o.id === id),

  getByStatus: (status) => {
    const orders = get().orders;
    if (!status) return orders;
    return orders.filter((o) => o.status === status);
  },
}));
