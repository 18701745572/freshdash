import Taro from '@tarojs/taro';

const TOKEN_KEY = 'supplier_token';
const SUPPLIER_ID_KEY = 'supplier_id';
const SUPPLIER_NAME_KEY = 'supplier_name';
const EXPIRES_AT_KEY = 'supplier_token_expires_at';

export function getToken(): string {
  return Taro.getStorageSync(TOKEN_KEY) || '';
}

export function getSupplierId(): string {
  return Taro.getStorageSync(SUPPLIER_ID_KEY) || '';
}

export function getSupplierName(): string {
  return Taro.getStorageSync(SUPPLIER_NAME_KEY) || '';
}

export function isTokenValid(): boolean {
  const token = getToken();
  const expiresAt = Number(Taro.getStorageSync(EXPIRES_AT_KEY) || 0);
  return Boolean(token && expiresAt > Date.now());
}

export function saveAuthSession(data: {
  token: string;
  supplierId: string;
  supplierName: string;
  expiresAt: number;
}) {
  Taro.setStorageSync(TOKEN_KEY, data.token);
  Taro.setStorageSync(SUPPLIER_ID_KEY, data.supplierId);
  Taro.setStorageSync(SUPPLIER_NAME_KEY, data.supplierName);
  Taro.setStorageSync(EXPIRES_AT_KEY, data.expiresAt);
}

export function clearAuthSession() {
  Taro.removeStorageSync(TOKEN_KEY);
  Taro.removeStorageSync(SUPPLIER_ID_KEY);
  Taro.removeStorageSync(SUPPLIER_NAME_KEY);
  Taro.removeStorageSync(EXPIRES_AT_KEY);
}

export function requireAuth() {
  if (!isTokenValid()) {
    Taro.redirectTo({ url: '/pages/login/index' });
    return false;
  }
  return true;
}
