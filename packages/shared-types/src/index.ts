export interface User {
  id: string;
  openid: string;
  unionid?: string;
  nickName?: string;
  avatarUrl?: string;
  phone?: string;
  role: 'user' | 'promoter' | 'supplier' | 'admin';
  promoterCode?: string;
  balance: number;
  totalCommission: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  coverImage: string;
  images: string[];
  price: number;
  originalPrice?: number;
  unit: string;
  stock: number;
  categoryId: string;
  tags: string[];
  sortOrder: number;
  status: 'on_sale' | 'off_sale' | 'deleted';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  parentId?: string;
  sortOrder: number;
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  quantity: number;
  selected: boolean;
}

export type OrderStatus =
  | 'pending_payment'
  | 'pending_dispatch'
  | 'pending_shipment'
  | 'shipped'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export interface Order {
  id: string;
  orderNo: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  deliveryFee: number;
  discountAmount: number;
  payAmount: number;
  address: Address;
  items: OrderItem[];
  promoterId?: string;
  commissionAmount?: number;
  remark?: string;
  createdAt: string;
  paidAt?: string;
  shippedAt?: string;
  receivedAt?: string;
  completedAt?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface OrderDispatch {
  id: string;
  orderId: string;
  supplierId: string;
  status: 'pending' | 'shipped' | 'completed';
  items: OrderItem[];
  createdAt: string;
  shippedAt?: string;
}

export interface CommissionRecord {
  id: string;
  promoterId: string;
  orderId: string;
  amount: number;
  status: 'pending' | 'settled' | 'deducted';
  createdAt: string;
  settledAt?: string;
}

export interface WithdrawRecord {
  id: string;
  promoterId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  remark?: string;
  createdAt: string;
}

export interface Banner {
  id: string;
  imageUrl: string;
  linkUrl?: string;
  sortOrder: number;
  status: 'active' | 'inactive';
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
