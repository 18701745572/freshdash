export const USE_MOCK = true;

export { mockBanners } from './mock/banners';
export { mockCategories, mockCategoryTree } from './mock/categories';
export {
  mockProducts,
  mockSeckillProducts,
  allProducts,
  getProductById,
  searchProducts,
  getProductsByCategory,
} from './mock/products';
export { mockPromoterStats, mockCommissionRecords, MOCK_PROMOTER_CODE } from './mock/promoter';

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

export async function fetchBanners() {
  await delay();
  const { mockBanners } = await import('./mock/banners');
  return mockBanners;
}

export async function fetchProducts(params?: { categoryId?: string; keyword?: string }) {
  await delay();
  const { allProducts, searchProducts, getProductsByCategory } = await import('./mock/products');
  if (params?.keyword) return searchProducts(params.keyword);
  if (params?.categoryId) return getProductsByCategory(params.categoryId);
  return allProducts.filter((p) => !p.id.startsWith('10'));
}

export async function fetchProductById(id: string) {
  await delay();
  const { getProductById } = await import('./mock/products');
  return getProductById(id);
}

export async function mockWxLogin() {
  await delay(300);
  return {
    token: 'mock-jwt-' + Date.now(),
    userInfo: {
      id: 'user-001',
      nickName: '鲜达用户',
      avatarUrl: 'https://picsum.photos/id/64/200/200',
      phone: '138****8000',
    },
  };
}

export async function mockSendSms(_phone: string) {
  await delay(500);
  return { success: true, code: '123456' };
}

export async function mockCartPreview(items: { productId: string; quantity: number }[]) {
  await delay(200);
  const { getProductById } = await import('./mock/products');
  for (const item of items) {
    const product = getProductById(item.productId);
    if (!product) return { valid: false, message: '商品不存在' };
    const stock = product.stock ?? 100;
    if (item.quantity > stock) {
      return { valid: false, message: `${product.name} 库存不足` };
    }
  }
  return { valid: true };
}
