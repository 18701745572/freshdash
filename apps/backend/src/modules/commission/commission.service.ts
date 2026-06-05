import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CommissionService {
  constructor(private prisma: PrismaService) {}

  private calculateCommission(order: any): number {
    const actualAmount = order.totalAmount;
    
    const costPrice = order.items.reduce((sum: number, item: any) => {
      const cost = Math.floor(item.price * 0.6);
      return sum + cost * item.quantity;
    }, 0);

    const discountAmount = order.originalAmount ? order.originalAmount - actualAmount : 0;

    const reserveAmount = Math.floor(actualAmount * 0.02);

    const netProfit = actualAmount - costPrice - discountAmount - reserveAmount;

    const commission = Math.max(0, Math.floor(netProfit * 0.03));

    return commission;
  }

  async calculateAndCreate(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        user: true,
      },
    });

    if (!order) {
      throw new BadRequestException('订单不存在');
    }

    if (!order.user.promoterCode) {
      return null;
    }

    const promoter = await this.prisma.user.findUnique({
      where: { promoterCode: order.user.promoterCode },
    });

    if (!promoter || !promoter.isPromoter) {
      return null;
    }

    const promoterRecord = await this.prisma.promoter.findUnique({
      where: { userId: promoter.id },
    });

    if (!promoterRecord) {
      return null;
    }

    const commissionAmount = this.calculateCommission(order);

    if (commissionAmount <= 0) {
      return null;
    }

    const commission = await this.prisma.commission.create({
      data: {
        orderId,
        promoterId: promoterRecord.id,
        amount: commissionAmount,
        status: 'PENDING',
      },
    });

    return commission;
  }

  async settleCommission(orderId: string) {
    const commission = await this.prisma.commission.findUnique({
      where: { orderId },
    });

    if (!commission) {
      throw new BadRequestException('佣金记录不存在');
    }

    if (commission.status !== 'PENDING') {
      throw new BadRequestException('佣金状态不允许结算');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.commission.update({
        where: { id: commission.id },
        data: { status: 'SETTLED', settledAt: new Date() },
      });

      await tx.promoter.update({
        where: { id: commission.promoterId },
        data: {
          balance: { increment: commission.amount },
          totalCommission: { increment: commission.amount },
        },
      });
    });

    return { success: true };
  }

  async reverseCommission(orderId: string) {
    const commission = await this.prisma.commission.findUnique({
      where: { orderId },
    });

    if (!commission) {
      throw new BadRequestException('佣金记录不存在');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.commission.update({
        where: { id: commission.id },
        data: { status: 'WITHDRAWN' },
      });

      await tx.promoter.update({
        where: { id: commission.promoterId },
        data: {
          balance: { decrement: commission.amount },
        },
      });
    });

    return { success: true };
  }

  findByPromoter(promoterId: string) {
    return this.prisma.commission.findMany({
      where: { promoterId },
      include: { order: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAllWithdrawals(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    return this.prisma.withdrawal.findMany({
      where,
      include: { promoter: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async applyWithdraw(promoterId: string, amount: number) {
    const promoter = await this.prisma.promoter.findUnique({ where: { id: promoterId } });
    if (!promoter) {
      throw new BadRequestException('推广员不存在');
    }

    if (amount <= 0) {
      throw new BadRequestException('提现金额必须大于0');
    }

    if (promoter.balance < amount) {
      throw new BadRequestException('余额不足');
    }

    const status = amount < 100 ? 'APPROVED' : 'PENDING';

    return this.prisma.withdrawal.create({
      data: {
        promoterId,
        amount,
        status,
      },
    });
  }

  async settlePendingOrders() {
    const completedOrders = await this.prisma.order.findMany({
      where: {
        status: 'COMPLETED',
      },
    });

    for (const order of completedOrders) {
      const existingCommission = await this.prisma.commission.findUnique({
        where: { orderId: order.id },
      });

      if (!existingCommission) {
        await this.calculateAndCreate(order.id);
      }
    }

    return { success: true };
  }

  async approveWithdrawal(withdrawalId: string) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { promoter: true },
    });

    if (!withdrawal) {
      throw new BadRequestException('提现记录不存在');
    }

    if (withdrawal.status !== 'PENDING') {
      throw new BadRequestException('提现状态不允许审核');
    }

    if (withdrawal.promoter.balance < withdrawal.amount) {
      throw new BadRequestException('推广员余额不足');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: { status: 'APPROVED', reviewedAt: new Date() },
      });

      await tx.promoter.update({
        where: { id: withdrawal.promoterId },
        data: { balance: { decrement: withdrawal.amount } },
      });
    });

    return { success: true };
  }

  async rejectWithdrawal(withdrawalId: string, reason?: string) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      throw new BadRequestException('提现记录不存在');
    }

    if (withdrawal.status !== 'PENDING') {
      throw new BadRequestException('提现状态不允许审核');
    }

    await this.prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { status: 'REJECTED', reviewedAt: new Date() },
    });

    return { success: true, reason };
  }

  async simulatePayment(withdrawalId: string) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { promoter: { include: { user: true } } },
    });

    if (!withdrawal) {
      throw new BadRequestException('提现记录不存在');
    }

    if (withdrawal.status !== 'APPROVED') {
      throw new BadRequestException('提现状态不允许打款');
    }

    console.log(`[模拟打款] 金额: ${withdrawal.amount} 元, 推广员: ${withdrawal.promoter.user.phone}`);

    await this.prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { status: 'PAID' },
    });

    return {
      success: true,
      transactionId: `TX${Date.now()}`,
      message: '打款成功',
    };
  }

  findPromoterWithdrawals(promoterId: string) {
    return this.prisma.withdrawal.findMany({
      where: { promoterId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
