import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string, status?: string) {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }
    return this.prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  async create(data: { userId: string; items: { productId: string; quantity: number }[] }) {
    // TODO: 计算总价并创建订单
    return this.prisma.order.create({
      data: {
        orderNo: `XD${Date.now()}`,
        userId: data.userId,
        status: 'PENDING_PAYMENT',
        totalAmount: 0,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            productName: '商品',
            productImage: '',
            price: 0,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });
  }
}
