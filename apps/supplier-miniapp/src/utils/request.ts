import Taro from '@tarojs/taro';
import { clearAuthSession, getToken } from './auth';

const BASE_URL =
  process.env.TARO_APP_API_BASE ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://api.freshdash.com');

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: Record<string, unknown>;
  header?: Record<string, string>;
}

interface ApiResponse<T> {
  data?: T;
  message?: string;
}

export async function request<T>(options: RequestOptions): Promise<T> {
  const token = getToken();

  try {
    const res = await Taro.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.header,
      },
    });

    if (res.statusCode === 401) {
      clearAuthSession();
      Taro.redirectTo({ url: '/pages/login/index' });
      throw new Error('登录已过期，请重新登录');
    }

    if (res.statusCode >= 200 && res.statusCode < 300) {
      const body = res.data as ApiResponse<T> | T;
      if (body && typeof body === 'object' && 'data' in (body as ApiResponse<T>)) {
        return (body as ApiResponse<T>).data as T;
      }
      return body as T;
    }

    const message = (res.data as ApiResponse<T>)?.message || `HTTP ${res.statusCode}`;
    throw new Error(message);
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('网络请求失败');
  }
}
