import { Product } from '@/types';

export const mockProducts: Product[] = [
  { id: '1', name: '烟台红富士苹果', coverImage: 'https://picsum.photos/id/292/300/300', price: 1990, originalPrice: 2990, unit: '500g', tags: ['热卖', '新鲜'], categoryId: '1', stock: 100 },
  { id: '2', name: '进口香蕉', coverImage: 'https://picsum.photos/id/312/300/300', price: 890, originalPrice: 1290, unit: '500g', tags: ['特价'], categoryId: '1', stock: 80 },
  { id: '3', name: '赣南脐橙', coverImage: 'https://picsum.photos/id/326/300/300', price: 1590, originalPrice: 1990, unit: '500g', tags: ['当季'], categoryId: '1', stock: 60 },
  { id: '4', name: '精品五花肉', coverImage: 'https://picsum.photos/id/401/300/300', price: 2990, originalPrice: 3590, unit: '500g', tags: ['热卖'], categoryId: '3', stock: 50 },
  { id: '5', name: '鲜活基围虾', coverImage: 'https://picsum.photos/id/431/300/300', price: 3990, originalPrice: 4990, unit: '500g', tags: ['限时'], categoryId: '4', stock: 30 },
  { id: '6', name: '有机西兰花', coverImage: 'https://picsum.photos/id/570/300/300', price: 690, originalPrice: 890, unit: '300g', tags: ['有机'], categoryId: '2', stock: 100 },
  { id: '7', name: '土鸡蛋', coverImage: 'https://picsum.photos/id/580/300/300', price: 1590, originalPrice: 1990, unit: '10枚', tags: ['农家'], categoryId: '5', stock: 200 },
  { id: '8', name: '鲜牛奶', coverImage: 'https://picsum.photos/id/625/300/300', price: 1290, originalPrice: 1590, unit: '1L', tags: ['冷链'], categoryId: '5', stock: 80 },
  { id: '9', name: '五常大米', coverImage: 'https://picsum.photos/id/835/300/300', price: 5990, originalPrice: 7990, unit: '5kg', tags: ['包邮'], categoryId: '6', stock: 40 },
  { id: '10', name: '三文鱼刺身', coverImage: 'https://picsum.photos/id/1080/300/300', price: 8990, originalPrice: 10990, unit: '200g', tags: ['进口'], categoryId: '4', stock: 20 },
];

export const mockSeckillProducts: Product[] = [
  { id: '101', name: '智利车厘子', coverImage: 'https://picsum.photos/id/1015/300/300', price: 2990, originalPrice: 5990, unit: '500g', tags: ['秒杀'], categoryId: '1', stock: 15 },
  { id: '102', name: '阳光玫瑰葡萄', coverImage: 'https://picsum.photos/id/1018/300/300', price: 1990, originalPrice: 3990, unit: '500g', tags: ['秒杀'], categoryId: '1', stock: 25 },
  { id: '103', name: '澳洲牛排', coverImage: 'https://picsum.photos/id/1036/300/300', price: 3990, originalPrice: 7990, unit: '200g', tags: ['秒杀'], categoryId: '3', stock: 10 },
  { id: '104', name: '波士顿龙虾', coverImage: 'https://picsum.photos/id/1039/300/300', price: 8990, originalPrice: 15990, unit: '只', tags: ['秒杀'], categoryId: '4', stock: 5 },
];

export const allProducts = [...mockProducts, ...mockSeckillProducts];

export const getProductById = (id: string) => allProducts.find((p) => p.id === id);

export const searchProducts = (keyword: string) => {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return [];
  return allProducts.filter((p) => p.name.toLowerCase().includes(kw));
};

export const getProductsByCategory = (categoryId: string) =>
  allProducts.filter((p) => p.categoryId === categoryId);
