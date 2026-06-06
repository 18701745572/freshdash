import * as api from './api';
import * as mock from './mock/supplierOrders';

const USE_MOCK = process.env.TARO_APP_USE_MOCK !== 'false';

export const supplierService = {
  login: USE_MOCK ? mock.mockLogin : api.login,
  fetchPendingOrders: USE_MOCK ? mock.mockFetchPendingOrders : api.fetchPendingOrders,
  fetchShippedOrders: USE_MOCK ? mock.mockFetchShippedOrders : api.fetchShippedOrders,
  fetchOrderDetail: USE_MOCK ? mock.mockFetchOrderDetail : api.fetchOrderDetail,
  fetchStats: USE_MOCK ? mock.mockFetchStats : api.fetchStats,
  shipOrder: USE_MOCK ? mock.mockShipOrder : api.shipOrder,
};
