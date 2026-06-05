export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PENDING_DISPATCH'
  | 'PENDING_SHIP'
  | 'PENDING_RECEIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: 'super_admin' | 'operator';
}

export interface AdminCategory {
  id: string;
  name: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  supplierId?: string;
  supplierName?: string;
  price: number;
  costPrice: number;
  stock: number;
  sales: number;
  mainImages: string[];
  detailImages: string[];
  isOnSale: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSupplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  loginName: string;
  status: 'ACTIVE' | 'DISABLED';
  createdAt: string;
}

export interface AdminOrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  subtotal: number;
  supplierId?: string;
}

export interface AdminOrder {
  id: string;
  orderNo: string;
  userId: string;
  userNickName: string;
  userPhone?: string;
  itemCount: number;
  totalAmount: number;
  discountAmount: number;
  actualAmount: number;
  status: OrderStatus;
  supplierId?: string;
  supplierName?: string;
  shippedAt?: string;
  address: {
    name: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    detail: string;
  };
  items: AdminOrderItem[];
  remark?: string;
  wxTransactionId?: string;
  createdAt: string;
  paidAt?: string;
}

export interface AdminPromoter {
  id: string;
  name: string;
  phone: string;
  boundCustomerCount: number;
  totalCommission: number;
  pendingCommission: number;
  balance: number;
  status: 'ACTIVE' | 'FROZEN';
  createdAt: string;
}

export interface AdminCommission {
  id: string;
  promoterId: string;
  orderId: string;
  orderNo: string;
  amount: number;
  status: 'PENDING' | 'SETTLED' | 'DEDUCTED';
  createdAt: string;
}

export interface AdminWithdrawal {
  id: string;
  promoterId: string;
  promoterName: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  remark?: string;
  createdAt: string;
}

export interface DiscountTier {
  threshold: number;
  discount: number;
}

export interface DiscountRule {
  id: string;
  name: string;
  tiers: DiscountTier[];
  scope: 'ALL' | string[];
  isActive: boolean;
  createdAt: string;
}

export interface AdminBanner {
  id: string;
  imageUrl: string;
  linkType: 'NONE' | 'PRODUCT' | 'CATEGORY';
  linkId?: string;
  linkLabel?: string;
  sort: number;
  isActive: boolean;
}

export interface DashboardData {
  todayOrders: number;
  todayGmv: number;
  newPromoters: number;
  commissionPaid: number;
  pendingWithdrawals: number;
  pendingDispatchOrders: number;
  orderTrend: { date: string; count: number; gmv: number }[];
  topProducts: { name: string; sales: number }[];
  statusDistribution: { status: string; count: number }[];
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export interface FarmPlot {
  id: string;
  name: string;
  area: number;
  quarterPrice: number;
  yearPrice: number;
  stock: number;
  rtmpUrl?: string;
  status: 'AVAILABLE' | 'FULL';
}

export interface FarmLog {
  id: string;
  plotId: string;
  date: string;
  content: string;
  images: string[];
}

export interface FarmOrder {
  id: string;
  userName: string;
  plotName: string;
  period: string;
  amount: number;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  createdAt: string;
}
