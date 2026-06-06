export interface Banner {
  id: string;
  imageUrl: string;
  linkUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  children?: Category[];
}

export interface Product {
  id: string;
  name: string;
  coverImage: string;
  price: number;
  originalPrice?: number;
  unit: string;
  tags: string[];
  categoryId?: string;
  stock?: number;
}

export interface UserInfo {
  id: string;
  nickName: string;
  avatarUrl: string;
  phone?: string;
}

export interface CommissionRecord {
  id: string;
  name: string;
  time: string;
  amount: number;
}

export interface PromoterInfo {
  code: string;
  isApproved: boolean;
  stats: PromoterStats;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selected: boolean;
}

export type OrderStatus = 'pending_payment' | 'pending_dispatch' | 'pending_shipment' | 'shipped' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  orderNo: string;
  status: OrderStatus;
  totalAmount: number;
  discountAmount?: number;
  items: OrderItem[];
  createdAt: string;
  address?: Address;
  remark?: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

export interface PromoterStats {
  totalCommission: number;
  settledAmount: number;
  pendingAmount: number;
  referralCount: number;
  orderCount: number;
}
