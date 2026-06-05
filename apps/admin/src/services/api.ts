import axios, { type AxiosRequestConfig } from 'axios';
import * as mock from './mock';
import type {
  AdminBanner,
  AdminOrder,
  AdminProduct,
  AdminSupplier,
  AdminUser,
  DashboardData,
  DiscountRule,
  FarmLog,
  FarmPlot,
  ImportResult,
  PaginatedResult,
} from '../types';

const USE_MOCK = import.meta.env.DEV;

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    const body = res.data;
    if (body?.code !== undefined && body.code !== 0) {
      return Promise.reject(new Error(body.message || '请求失败'));
    }
    return body?.data !== undefined ? body.data : body;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    const msg = err.response?.data?.message || err.message || '请求失败';
    return Promise.reject(new Error(msg));
  }
);

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  if (USE_MOCK) {
    return mockRequest<T>(config);
  }
  return api.request(config) as Promise<T>;
}

async function mockRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const method = (config.method || 'get').toUpperCase();
  const url = config.url || '';
  const params = config.params || {};
  const data = config.data || {};

  if (url === '/admin/login' && method === 'POST') return mock.mockLogin(data) as T;
  if (url === '/admin/dashboard') return mock.mockGetDashboard() as T;
  if (url === '/admin/categories') return mock.mockGetCategories() as T;

  if (url === '/admin/products' && method === 'GET') return mock.mockGetProducts(params) as T;
  if (url === '/admin/products' && method === 'POST') return mock.mockSaveProduct(data) as T;
  if (url === '/admin/products/import' && method === 'POST') return mock.mockImportProducts(data.rows) as T;
  if (url.match(/^\/admin\/products\/[^/]+$/) && method === 'GET') {
    return mock.mockGetProduct(url.split('/').pop()!) as T;
  }
  if (url.match(/^\/admin\/products\/[^/]+$/) && method === 'PUT') {
    return mock.mockSaveProduct({ ...data, id: url.split('/').pop() }) as T;
  }
  if (url.match(/^\/admin\/products\/[^/]+$/) && method === 'DELETE') {
    await mock.mockDeleteProduct(url.split('/').pop()!);
    return {} as T;
  }

  if (url === '/admin/suppliers' && method === 'GET') return mock.mockGetSuppliers(params) as T;
  if (url === '/admin/suppliers' && method === 'POST') return mock.mockSaveSupplier(data) as T;
  if (url.match(/^\/admin\/suppliers\/[^/]+$/) && method === 'GET') {
    return mock.mockGetSupplier(url.split('/').pop()!) as T;
  }
  if (url.match(/^\/admin\/suppliers\/[^/]+$/) && method === 'PUT') {
    return mock.mockSaveSupplier({ ...data, id: url.split('/').pop() }) as T;
  }
  if (url.match(/^\/admin\/suppliers\/[^/]+\/reset-password$/) && method === 'POST') {
    const id = url.split('/')[3];
    return mock.mockResetSupplierPassword(id, data.password) as T;
  }

  if (url === '/admin/orders' && method === 'GET') return mock.mockGetOrders(params) as T;
  if (url.match(/^\/admin\/orders\/[^/]+$/) && method === 'GET') {
    return mock.mockGetOrder(url.split('/').pop()!) as T;
  }
  if (url.match(/^\/admin\/orders\/[^/]+\/dispatch$/) && method === 'POST') {
    const id = url.split('/')[3];
    return mock.mockDispatchOrder(id, data.supplierId) as T;
  }
  if (url === '/admin/orders/auto-dispatch' && method === 'POST') return mock.mockAutoDispatch() as T;
  if (url.match(/^\/admin\/orders\/[^/]+\/revoke-dispatch$/) && method === 'PUT') {
    return mock.mockRevokeDispatch(url.split('/')[3]) as T;
  }

  if (url === '/admin/promoters' && method === 'GET') return mock.mockGetPromoters(params) as T;
  if (url.match(/^\/admin\/promoters\/[^/]+\/freeze$/) && method === 'PUT') {
    return mock.mockFreezePromoter(url.split('/')[3], data.frozen) as T;
  }
  if (url.match(/^\/admin\/promoters\/[^/]+\/commissions$/) && method === 'GET') {
    return mock.mockGetPromoterCommissions(url.split('/')[3]) as T;
  }

  if (url === '/admin/withdrawals' && method === 'GET') return mock.mockGetWithdrawals(params) as T;
  if (url.match(/^\/admin\/withdrawals\/[^/]+\/approve$/) && method === 'PUT') {
    return mock.mockApproveWithdrawal(url.split('/')[3]) as T;
  }
  if (url.match(/^\/admin\/withdrawals\/[^/]+\/reject$/) && method === 'PUT') {
    return mock.mockRejectWithdrawal(url.split('/')[3], data.remark) as T;
  }

  if (url === '/admin/discount-rules' && method === 'GET') return mock.mockGetDiscountRules() as T;
  if (url === '/admin/discount-rules' && method === 'POST') return mock.mockSaveDiscountRule(data) as T;
  if (url.match(/^\/admin\/discount-rules\/[^/]+$/) && method === 'PUT') {
    return mock.mockSaveDiscountRule({ ...data, id: url.split('/').pop() }) as T;
  }
  if (url.match(/^\/admin\/discount-rules\/[^/]+$/) && method === 'DELETE') {
    await mock.mockDeleteDiscountRule(url.split('/').pop()!);
    return {} as T;
  }

  if (url === '/admin/banners' && method === 'GET') return mock.mockGetBanners() as T;
  if (url === '/admin/banners' && method === 'POST') return mock.mockSaveBanner(data) as T;
  if (url.match(/^\/admin\/banners\/[^/]+$/) && method === 'PUT') {
    return mock.mockSaveBanner({ ...data, id: url.split('/').pop() }) as T;
  }
  if (url.match(/^\/admin\/banners\/[^/]+$/) && method === 'DELETE') {
    await mock.mockDeleteBanner(url.split('/').pop()!);
    return {} as T;
  }
  if (url === '/admin/banners/reorder' && method === 'PUT') {
    return mock.mockReorderBanners(data.orderedIds) as T;
  }

  if (url === '/upload/sign' && method === 'POST') return mock.mockGetUploadSign() as T;

  if (url === '/admin/farm-plots' && method === 'GET') return mock.mockGetFarmPlots() as T;
  if (url === '/admin/farm-plots' && method === 'POST') return mock.mockSaveFarmPlot(data) as T;
  if (url.match(/^\/admin\/farm-plots\/[^/]+$/) && method === 'PUT') {
    return mock.mockSaveFarmPlot({ ...data, id: url.split('/').pop() }) as T;
  }
  if (url.match(/^\/admin\/farm-plots\/[^/]+\/logs$/) && method === 'GET') {
    return mock.mockGetFarmLogs(url.split('/')[3]) as T;
  }
  if (url.match(/^\/admin\/farm-plots\/[^/]+\/logs$/) && method === 'POST') {
    return mock.mockAddFarmLog({ ...data, plotId: url.split('/')[3] }) as T;
  }
  if (url === '/admin/farm-orders' && method === 'GET') return mock.mockGetFarmOrders() as T;

  throw new Error(`Mock 未实现: ${method} ${url}`);
}

// 认证
export const adminLogin = (username: string, password: string) =>
  request<{ token: string; user: AdminUser }>({ method: 'POST', url: '/admin/login', data: { username, password } });

// 看板
export const fetchDashboard = () => request<DashboardData>({ url: '/admin/dashboard' });

// 分类
export const fetchCategories = () => request<{ id: string; name: string }[]>({ url: '/admin/categories' });

// 商品
export const fetchProducts = (params?: Record<string, unknown>) =>
  request<PaginatedResult<AdminProduct>>({ url: '/admin/products', params });
export const fetchProduct = (id: string) => request<AdminProduct>({ url: `/admin/products/${id}` });
export const saveProduct = (data: Partial<AdminProduct>) =>
  data.id
    ? request<AdminProduct>({ method: 'PUT', url: `/admin/products/${data.id}`, data })
    : request<AdminProduct>({ method: 'POST', url: '/admin/products', data });
export const deleteProduct = (id: string) => request<void>({ method: 'DELETE', url: `/admin/products/${id}` });
export const importProducts = (rows: Record<string, unknown>[]) =>
  request<ImportResult>({ method: 'POST', url: '/admin/products/import', data: { rows } });

// 供应商
export const fetchSuppliers = (params?: Record<string, unknown>) =>
  request<PaginatedResult<AdminSupplier>>({ url: '/admin/suppliers', params });
export const fetchSupplier = (id: string) => request<AdminSupplier>({ url: `/admin/suppliers/${id}` });
export const saveSupplier = (data: Partial<AdminSupplier> & { password?: string }) =>
  data.id
    ? request<AdminSupplier>({ method: 'PUT', url: `/admin/suppliers/${data.id}`, data })
    : request<AdminSupplier>({ method: 'POST', url: '/admin/suppliers', data });
export const resetSupplierPassword = (id: string, password: string) =>
  request<{ success: boolean }>({ method: 'POST', url: `/admin/suppliers/${id}/reset-password`, data: { password } });

// 订单
export const fetchOrders = (params?: Record<string, unknown>) =>
  request<PaginatedResult<AdminOrder>>({ url: '/admin/orders', params });
export const fetchOrder = (id: string) => request<AdminOrder>({ url: `/admin/orders/${id}` });
export const dispatchOrder = (orderId: string, supplierId: string) =>
  request<AdminOrder>({ method: 'POST', url: `/admin/orders/${orderId}/dispatch`, data: { supplierId } });
export const autoDispatchOrders = () =>
  request<{ success: number; failed: number; total: number }>({ method: 'POST', url: '/admin/orders/auto-dispatch' });
export const revokeDispatch = (orderId: string) =>
  request<AdminOrder>({ method: 'PUT', url: `/admin/orders/${orderId}/revoke-dispatch` });

// 推广员
export const fetchPromoters = (params?: Record<string, unknown>) =>
  request<PaginatedResult<import('../types').AdminPromoter>>({ url: '/admin/promoters', params });
export const freezePromoter = (id: string, frozen: boolean) =>
  request<import('../types').AdminPromoter>({ method: 'PUT', url: `/admin/promoters/${id}/freeze`, data: { frozen } });
export const fetchPromoterCommissions = (id: string) =>
  request<import('../types').AdminCommission[]>({ url: `/admin/promoters/${id}/commissions` });

// 提现
export const fetchWithdrawals = (params?: Record<string, unknown>) =>
  request<PaginatedResult<import('../types').AdminWithdrawal>>({ url: '/admin/withdrawals', params });
export const approveWithdrawal = (id: string) =>
  request<import('../types').AdminWithdrawal>({ method: 'PUT', url: `/admin/withdrawals/${id}/approve` });
export const rejectWithdrawal = (id: string, remark?: string) =>
  request<import('../types').AdminWithdrawal>({ method: 'PUT', url: `/admin/withdrawals/${id}/reject`, data: { remark } });

// 满减
export const fetchDiscountRules = () => request<DiscountRule[]>({ url: '/admin/discount-rules' });
export const saveDiscountRule = (data: Partial<DiscountRule>) =>
  data.id
    ? request<DiscountRule>({ method: 'PUT', url: `/admin/discount-rules/${data.id}`, data })
    : request<DiscountRule>({ method: 'POST', url: '/admin/discount-rules', data });
export const deleteDiscountRule = (id: string) =>
  request<void>({ method: 'DELETE', url: `/admin/discount-rules/${id}` });

// 轮播图
export const fetchBanners = () => request<AdminBanner[]>({ url: '/admin/banners' });
export const saveBanner = (data: Partial<AdminBanner>) =>
  data.id
    ? request<AdminBanner>({ method: 'PUT', url: `/admin/banners/${data.id}`, data })
    : request<AdminBanner>({ method: 'POST', url: '/admin/banners', data });
export const deleteBanner = (id: string) => request<void>({ method: 'DELETE', url: `/admin/banners/${id}` });
export const reorderBanners = (orderedIds: string[]) =>
  request<AdminBanner[]>({ method: 'PUT', url: '/admin/banners/reorder', data: { orderedIds } });

// 上传
export const getUploadSign = () => request<{ url: string; key: string; signature: string }>({ method: 'POST', url: '/upload/sign' });

// 认养地块
export const fetchFarmPlots = () => request<FarmPlot[]>({ url: '/admin/farm-plots' });
export const saveFarmPlot = (data: Partial<FarmPlot>) =>
  data.id
    ? request<FarmPlot>({ method: 'PUT', url: `/admin/farm-plots/${data.id}`, data })
    : request<FarmPlot>({ method: 'POST', url: '/admin/farm-plots', data });
export const fetchFarmLogs = (plotId: string) => request<FarmLog[]>({ url: `/admin/farm-plots/${plotId}/logs` });
export const addFarmLog = (plotId: string, data: Omit<FarmLog, 'id' | 'plotId'>) =>
  request<FarmLog>({ method: 'POST', url: `/admin/farm-plots/${plotId}/logs`, data });
export const fetchFarmOrders = () => request<import('../types').FarmOrder[]>({ url: '/admin/farm-orders' });

export default api;
