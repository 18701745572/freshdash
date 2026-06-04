import Taro from '@tarojs/taro';

const BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : 'https://api.freshdash.com/api';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: Record<string, string>;
}

export async function request<T>(options: RequestOptions): Promise<T> {
  try {
    const token = Taro.getStorageSync('token');
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

    if (res.statusCode >= 200 && res.statusCode < 300) {
      return res.data as T;
    }
    throw new Error((res.data as any)?.message || `HTTP ${res.statusCode}`);
  } catch (err) {
    console.error('[API Error]', options.url, err);
    throw err;
  }
}
