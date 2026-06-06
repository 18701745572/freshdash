import { request } from '@/utils/request';
import { LoginResult, ShipPayload, SupplierOrder, SupplierStats } from '@/types';

export async function login(username: string, password: string): Promise<LoginResult> {
  return request<LoginResult>({
    url: '/supplier/auth/login',
    method: 'POST',
    data: { username, password },
  });
}

export async function fetchPendingOrders(): Promise<SupplierOrder[]> {
  return request<SupplierOrder[]>({
    url: '/supplier/dispatches?status=pending',
  });
}

export async function fetchShippedOrders(): Promise<SupplierOrder[]> {
  return request<SupplierOrder[]>({
    url: '/supplier/dispatches?status=shipped',
  });
}

export async function fetchOrderDetail(id: string): Promise<SupplierOrder> {
  return request<SupplierOrder>({
    url: `/supplier/orders/${id}`,
  });
}

export async function fetchStats(): Promise<SupplierStats> {
  return request<SupplierStats>({
    url: '/supplier/stats',
  });
}

export async function shipOrder(id: string, payload: ShipPayload): Promise<void> {
  await request({
    url: `/supplier/orders/${id}/ship`,
    method: 'PUT',
    data: payload,
  });
}
