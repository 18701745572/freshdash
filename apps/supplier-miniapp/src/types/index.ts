export type OrderStatus = 'PENDING_SHIPMENT' | 'SHIPPED' | 'COMPLETED';

export interface Receiver {
  name: string;
  phone: string;
  address: string;
}

export interface OrderItem {
  id: string;
  name: string;
  spec?: string;
  quantity: number;
  unitPrice: number;
}

export interface SupplierOrder {
  id: string;
  orderNo: string;
  status: OrderStatus;
  createdAt: string;
  shippedAt?: string;
  itemCount: number;
  trackingNo?: string;
  receiver: Receiver;
  items: OrderItem[];
  remark?: string;
}

export interface SupplierStats {
  todayPending: number;
  totalShipped: number;
}

export interface LoginResult {
  token: string;
  supplierId: string;
  supplierName: string;
  expiresAt: number;
}

export interface ShipPayload {
  trackingNo?: string;
}
