import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async createPayment(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new BadRequestException('订单不存在');
    }
    if (order.userId !== userId) {
      throw new BadRequestException('无权支付此订单');
    }
    if (order.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException('订单状态不允许支付');
    }

    return {
      orderId: order.id,
      orderNo: order.orderNo,
      totalAmount: order.totalAmount,
      payUrl: `https://pay.weixin.qq.com/example/${order.id}`,
      timestamp: Date.now(),
    };
  }

  async handlePayNotify(body: any) {
    const { orderNo, transactionId, totalFee, resultCode } = body;

    if (resultCode !== 'SUCCESS') {
      return { return_code: 'FAIL', return_msg: '支付失败' };
    }

    const order = await this.prisma.order.findUnique({
      where: { orderNo },
    });

    if (!order) {
      return { return_code: 'FAIL', return_msg: '订单不存在' };
    }

    if (order.status !== 'PENDING_PAYMENT') {
      return { return_code: 'SUCCESS', return_msg: '订单状态已处理' };
    }

    await this.prisma.order.update({
      where: { orderNo },
      data: {
        status: 'PENDING_DISPATCH',
        trackingNo: transactionId,
      },
    });

    return { return_code: 'SUCCESS', return_msg: 'OK' };
  }

  async refund(orderId: string, userId: string, amount?: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new BadRequestException('订单不存在');
    }
    if (order.userId !== userId) {
      throw new BadRequestException('无权操作此订单');
    }
    if (order.status !== 'COMPLETED' && order.status !== 'SHIPPED') {
      throw new BadRequestException('订单状态不允许退款');
    }

    const refundAmount = amount || order.totalAmount;

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      });

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    });

    return {
      success: true,
      refundAmount,
      refundId: `RF${Date.now()}`,
    };
  }
}
