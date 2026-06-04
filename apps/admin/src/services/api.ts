import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.message || err.message || '请求失败';
    console.error('[API Error]', msg);
    return Promise.reject(new Error(msg));
  }
);

export default api;

// 商品
export const fetchProducts = () => api.get('/products');
export const fetchProduct = (id: string) => api.get(`/products/${id}`);

// 订单
export const fetchOrders = (params?: { userId?: string; status?: string }) => api.get('/orders', { params });
export const fetchOrder = (id: string) => api.get(`/orders/${id}`);

// 分类
export const fetchCategories = () => api.get('/categories');

// 供应商
export const fetchSuppliers = () => api.get('/suppliers');
export const fetchSupplier = (id: string) => api.get(`/suppliers/${id}`);
export const fetchSupplierOrders = (id: string) => api.get(`/suppliers/${id}/orders`);
export const shipOrder = (supplierId: string, orderId: string, trackingNo: string) =>
  api.post(`/suppliers/${supplierId}/ship`, { orderId, trackingNo });

// 推广员
export const fetchPromoters = () => api.get('/promoters');
export const fetchPromoter = (id: string) => api.get(`/promoters/${id}`);
export const fetchPromoterCommissions = (id: string) => api.get(`/promoters/${id}/commissions`);

// 提现
export const fetchWithdrawals = () => api.get('/commissions/withdrawals'); // TODO: 后端需补充该接口
