import { LoginResult, ShipPayload, SupplierOrder, SupplierStats } from '@/types';

const mockOrders: SupplierOrder[] = [
  {
    id: '101',
    orderNo: '20250604000001',
    status: 'PENDING_SHIPMENT',
    createdAt: '2026-06-04 10:30:00',
    itemCount: 3,
    receiver: {
      name: '张三',
      phone: '13800138000',
      address: '北京市海淀区中关村大街1号',
    },
    items: [
      { id: '1', name: '有机菠菜', spec: '500g/份', quantity: 2, unitPrice: 12.5 },
      { id: '2', name: '新鲜草莓', spec: '250g/盒', quantity: 1, unitPrice: 29.9 },
    ],
    remark: '请发顺丰',
  },
  {
    id: '102',
    orderNo: '20250604000002',
    status: 'PENDING_SHIPMENT',
    createdAt: '2026-06-04 09:15:00',
    itemCount: 1,
    receiver: {
      name: '李四',
      phone: '13900139000',
      address: '上海市浦东新区张江高科技园区',
    },
    items: [{ id: '3', name: '鲜活基围虾', spec: '500g/份', quantity: 1, unitPrice: 58 }],
  },
  {
    id: '103',
    orderNo: '20250603000008',
    status: 'SHIPPED',
    createdAt: '2026-06-03 16:20:00',
    shippedAt: '2026-06-03 18:00:00',
    itemCount: 2,
    trackingNo: 'SF1234567890',
    receiver: {
      name: '王五',
      phone: '13700137000',
      address: '深圳市南山区科技园南区',
    },
    items: [{ id: '4', name: '烟台红富士苹果', spec: '1kg/袋', quantity: 2, unitPrice: 19.9 }],
  },
];

const MOCK_USERNAME = '13800138000';
const MOCK_PASSWORD = '123456';

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export async function mockLogin(username: string, password: string): Promise<LoginResult> {
  if (username !== MOCK_USERNAME || password !== MOCK_PASSWORD) {
    throw new Error('账号或密码错误');
  }
  return delay({
    token: 'mock-supplier-jwt-token',
    supplierId: 'seed-supplier-1',
    supplierName: '鲜达一号供应商',
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });
}

export async function mockFetchPendingOrders(): Promise<SupplierOrder[]> {
  return delay(
    mockOrders
      .filter((o) => o.status === 'PENDING_SHIPMENT')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
}

export async function mockFetchShippedOrders(): Promise<SupplierOrder[]> {
  return delay(
    mockOrders
      .filter((o) => o.status === 'SHIPPED' || o.status === 'COMPLETED')
      .sort((a, b) => (b.shippedAt || b.createdAt).localeCompare(a.shippedAt || a.createdAt)),
  );
}

export async function mockFetchOrderDetail(id: string): Promise<SupplierOrder | null> {
  return delay(mockOrders.find((o) => o.id === id) || null);
}

export async function mockFetchStats(): Promise<SupplierStats> {
  const pending = mockOrders.filter((o) => o.status === 'PENDING_SHIPMENT');
  const shipped = mockOrders.filter((o) => o.status === 'SHIPPED' || o.status === 'COMPLETED');
  const today = new Date().toISOString().slice(0, 10);
  return delay({
    todayPending: pending.filter((o) => o.createdAt.startsWith(today)).length,
    totalShipped: shipped.length,
  });
}

export async function mockShipOrder(id: string, payload: ShipPayload): Promise<void> {
  const order = mockOrders.find((o) => o.id === id);
  if (!order) {
    throw new Error('订单不存在');
  }
  if (order.status !== 'PENDING_SHIPMENT') {
    throw new Error('订单状态不允许发货');
  }
  order.status = 'SHIPPED';
  order.shippedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
  order.trackingNo = payload.trackingNo;
  return delay(undefined);
}
