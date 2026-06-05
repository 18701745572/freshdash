import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
  ) {}

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

  async create(data: {
    userId: string;
    items: { productId: string; quantity: number }[];
    addressId?: string;
    remark?: string;
  }) {
    const productIds = data.items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('部分商品不存在');
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new BadRequestException(`商品不存在: ${item.productId}`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(`商品库存不足: ${product.name}`);
      }
      totalAmount += product.price * item.quantity;
      orderItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.coverImage,
        price: product.price,
        quantity: item.quantity,
      });
    }

    const discountAmount = await this.calculateDiscount(totalAmount);
    const finalAmount = totalAmount - discountAmount;

    let addressSnapshot = '';
    if (data.addressId) {
      const address = await this.prisma.address.findUnique({
        where: { id: data.addressId },
      });
      if (address) {
        addressSnapshot = `${address.province}${address.city}${address.district}${address.detail} (${address.name} ${address.phone})`;
      }
    }

    const order = await this.prisma.$transaction(async (tx) => {
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return tx.order.create({
        data: {
          orderNo: `XD${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
          userId: data.userId,
          status: 'PENDING_PAYMENT',
          totalAmount: finalAmount,
          address: addressSnapshot,
          items: {
            create: orderItems,
          },
        },
        include: { items: true },
      });
    });

    await this.queueService.add('cancelOrder', {
      orderId: order.id,
      delay: 30 * 60 * 1000,
    });

    return {
      ...order,
      originalAmount: totalAmount,
      discountAmount,
    };
  }

  private async calculateDiscount(totalAmount: number): Promise<number> {
    const rules = await this.prisma.discountRule.findMany({
      where: { isActive: true },
    });

    if (rules.length === 0) {
      return 0;
    }

    let bestDiscount = 0;

    for (const rule of rules) {
      const tiers = rule.tiers as Array<{ threshold: number; discount: number }>;
      const applicableTiers = tiers.filter((t) => t.threshold <= totalAmount);
      if (applicableTiers.length > 0) {
        const bestTier = applicableTiers.reduce((a, b) =>
          a.discount > b.discount ? a : b
        );
        if (bestTier.discount > bestDiscount) {
          bestDiscount = bestTier.discount;
        }
      }
    }

    return bestDiscount;
  }

  async pay(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new BadRequestException('订单不存在');
    }
    if (order.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException('订单状态不允许支付');
    }

    const pendingJobs = this.queueService.getJobs('cancelOrder');
    for (const job of pendingJobs) {
      if (job.data.orderId === orderId) {
        await this.queueService.remove(job.id);
        break;
      }
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PENDING_DISPATCH' },
    });

    return await this.prisma.order.findUnique({ where: { id: orderId } });
  }

  async cancel(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new BadRequestException('订单不存在');
    }
    if (order.userId !== userId) {
      throw new BadRequestException('无权取消此订单');
    }
    if (order.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException('订单状态不允许取消');
    }

    const pendingJobs = this.queueService.getJobs('cancelOrder');
    for (const job of pendingJobs) {
      if (job.data.orderId === orderId) {
        await this.queueService.remove(job.id);
        break;
      }
    }

    await this.prisma.$transaction(async (tx) => {
      const items = await tx.orderItem.findMany({ where: { orderId } });
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      });
    });

    return { success: true };
  }

  async confirmReceipt(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new BadRequestException('订单不存在');
    }
    if (order.userId !== userId) {
      throw new BadRequestException('无权确认此订单');
    }
    if (order.status !== 'SHIPPED') {
      throw new BadRequestException('订单状态不允许确认收货');
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'COMPLETED' },
    });

    await this.queueService.add('settleCommission', {
      orderId: orderId,
      delay: 7 * 24 * 60 * 60 * 1000,
    });

    return await this.prisma.order.findUnique({ where: { id: orderId } });
  }

  async dispatch(orderId: string, supplierId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new BadRequestException('订单不存在');
    }
    if (order.status !== 'PENDING_DISPATCH') {
      throw new BadRequestException('订单状态不允许派单');
    }

    return this.prisma.orderDispatch.create({
      data: {
        orderId,
        supplierId,
        status: 'PENDING',
      },
    });
  }

  async ship(dispatchId: string, trackingNo?: string) {
    const dispatch = await this.prisma.orderDispatch.findUnique({
      where: { id: dispatchId },
    });
    if (!dispatch) {
      throw new BadRequestException('派单记录不存在');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.orderDispatch.update({
        where: { id: dispatchId },
        data: { status: 'SHIPPED', trackingNo, shippedAt: new Date() },
      });

      const remaining = await tx.orderDispatch.count({
        where: { orderId: dispatch.orderId, status: { not: 'SHIPPED' } },
      });

      if (remaining === 0) {
        await tx.order.update({
          where: { id: dispatch.orderId },
          data: { status: 'SHIPPED', trackingNo },
        });
      }
    });

    return { success: true };
  }

  findAllBySupplier(supplierId: string) {
    return this.prisma.order.findMany({
      where: { supplierId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async autoDispatch(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      throw new BadRequestException('订单不存在');
    }
    if (order.status !== 'PENDING_DISPATCH') {
      throw new BadRequestException('订单状态不允许派单');
    }

    const groups = order.items.reduce((acc, item) => {
      const supplierId = item.product.supplierId;
      if (!acc[supplierId]) {
        acc[supplierId] = [];
      }
      acc[supplierId].push(item);
      return acc;
    }, {} as Record<string, typeof order.items>);

    const dispatchResults = [];

    for (const supplierId of Object.keys(groups)) {
      const dispatch = await this.prisma.orderDispatch.create({
        data: {
          orderId,
          supplierId,
          status: 'PENDING',
        },
      });
      dispatchResults.push(dispatch);
    }

    const pendingDispatches = await this.prisma.orderDispatch.count({
      where: { orderId, status: 'PENDING' },
    });

    const newStatus = pendingDispatches === 0 ? 'PENDING_SHIPMENT' : 'PENDING_DISPATCH';
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    return {
      success: true,
      dispatchedCount: dispatchResults.length,
      dispatches: dispatchResults,
    };
  }

  async batchAutoDispatch(orderIds: string[]) {
    const results = [];

    for (const orderId of orderIds) {
      try {
        const result = await this.autoDispatch(orderId);
        results.push({ orderId, success: true, ...result });
      } catch (error) {
        results.push({ orderId, success: false, error: error.message });
      }
    }

    return results;
  }

  async revokeDispatch(dispatchId: string) {
    const dispatch = await this.prisma.orderDispatch.findUnique({
      where: { id: dispatchId },
    });

    if (!dispatch) {
      throw new BadRequestException('派单记录不存在');
    }
    if (dispatch.status === 'SHIPPED') {
      throw new BadRequestException('已发货的派单不能撤销');
    }

    await this.prisma.orderDispatch.delete({
      where: { id: dispatchId },
    });

    return { success: true };
  }
}
