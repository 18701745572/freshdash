import { Injectable } from '@nestjs/common';

const mockProducts = [
  { id: '1', name: '烟台红富士苹果', coverImage: 'https://picsum.photos/id/292/300/300', price: 1990, originalPrice: 2990, unit: '500g', tags: ['热卖', '新鲜'], categoryId: '1', stock: 100 },
  { id: '2', name: '进口香蕉', coverImage: 'https://picsum.photos/id/312/300/300', price: 890, originalPrice: 1290, unit: '500g', tags: ['特价'], categoryId: '1', stock: 200 },
  { id: '3', name: '鲜活基围虾', coverImage: 'https://picsum.photos/id/431/300/300', price: 3990, originalPrice: 4990, unit: '250g', tags: ['鲜活'], categoryId: '3', stock: 50 },
];

@Injectable()
export class ProductService {
  findAll(categoryId?: string) {
    if (categoryId) {
      return mockProducts.filter((p) => p.categoryId === categoryId);
    }
    return mockProducts;
  }

  findOne(id: string) {
    return mockProducts.find((p) => p.id === id) || null;
  }
}
