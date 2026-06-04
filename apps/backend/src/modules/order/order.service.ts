import { Injectable } from '@nestjs/common';

const mockOrders = [
  {
    id: '1', orderNo: 'XD20240604001', userId: '1', status: 'PENDING_PAYMENT',
    totalAmount: 4880, items: [
      { id: 'i1', productId: '1', productName: '烟台红富士苹果', productImage: 'https://picsum.photos/id/292/300/300', price: 1990, quantity: 1 },
      { id: 'i2', productId: '3', productName: '鲜活基围虾', productImage: 'https://picsum.photos/id/431/300/300', price: 3990, quantity: 1 },
    ],
    createdAt: '2024-06-04T10:30:00.000Z',
  },
];

@Injectable()
export class OrderService {
  findAll(userId: string, status?: string) {
    let orders = mockOrders.filter((o) => o.userId === userId);
    if (status) {
      orders = orders.filter((o) => o.status === status);
    }
    return orders;
  }

  findOne(id: string) {
    return mockOrders.find((o) => o.id === id) || null;
  }

  create(body: { userId: string; items: { productId: string; quantity: number }[] }) {
    const newOrder = {
      id: String(mockOrders.length + 1),
      orderNo: `XD${Date.now()}`,
      userId: body.userId,
      status: 'PENDING_PAYMENT',
      totalAmount: 0,
      items: body.items.map((item, idx) => ({ id: `i${idx}`, productId: item.productId, productName: '商品', productImage: '', price: 0, quantity: item.quantity })),
      createdAt: new Date().toISOString(),
    };
    mockOrders.push(newOrder as any);
    return newOrder;
  }
}
