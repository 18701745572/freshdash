import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RiskService {
  constructor(private prisma: PrismaService) {}

  private violationRecords: Map<string, { count: number; lastTime: number }> = new Map();

  async checkR01(orderUserId: string, promoterCode: string): Promise<{ pass: boolean; message: string }> {
    if (!promoterCode) {
      return { pass: true, message: '未绑定推广员' };
    }

    const promoter = await this.prisma.user.findUnique({
      where: { promoterCode },
    });

    if (!promoter) {
      return { pass: true, message: '推广员不存在' };
    }

    if (orderUserId === promoter.id) {
      return { pass: false, message: 'R01: 不能给自己推广' };
    }

    return { pass: true, message: 'R01: 通过' };
  }

  async checkR02(promoterId: string): Promise<{ pass: boolean; message: string }> {
    const completedOrders = await this.prisma.order.count({
      where: {
        user: { promoterCode: { not: null } },
      },
    });

    if (completedOrders === 0) {
      return { pass: false, message: 'R02: 推广员无完成订单记录' };
    }

    return { pass: true, message: 'R02: 通过' };
  }

  async checkR03(promoterId: string, amount: number): Promise<{ pass: boolean; message: string }> {
    const promoter = await this.prisma.promoter.findUnique({
      where: { id: promoterId },
      include: { user: true },
    });

    if (!promoter) {
      return { pass: false, message: 'R03: 推广员不存在' };
    }

    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(promoter.user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceCreation < 30 && promoter.totalCommission < 100 && amount >= 100) {
      return { pass: false, message: 'R03: 注册未满30天且累计佣金不足100元，无法提现100元以上' };
    }

    return { pass: true, message: 'R03: 通过' };
  }

  async checkR04(deviceId: string): Promise<{ pass: boolean; message: string }> {
    const key = `R04:${deviceId}`;
    const record = this.violationRecords.get(key);
    const now = Date.now();

    if (!record || now - record.lastTime > 24 * 60 * 60 * 1000) {
      this.violationRecords.set(key, { count: 1, lastTime: now });
      return { pass: true, message: 'R04: 通过' };
    }

    if (record.count >= 10) {
      return { pass: false, message: 'R04: 该设备24小时内注册次数超限' };
    }

    record.count++;
    record.lastTime = now;
    return { pass: true, message: 'R04: 通过' };
  }

  async checkR06(promoterId: string): Promise<{ pass: boolean; message: string }> {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));

    const todayWithdrawals = await this.prisma.withdrawal.count({
      where: {
        promoterId,
        createdAt: { gte: startOfDay },
      },
    });

    if (todayWithdrawals >= 3) {
      return { pass: false, message: 'R06: 今日提现次数已达上限' };
    }

    return { pass: true, message: 'R06: 通过' };
  }

  async checkR07(address: string, phone: string, deviceId: string): Promise<{ pass: boolean; message: string }> {
    const key = `R07:${address}:${phone}:${deviceId}`;
    const record = this.violationRecords.get(key);
    const now = Date.now();

    if (!record || now - record.lastTime > 10 * 60 * 1000) {
      this.violationRecords.set(key, { count: 1, lastTime: now });
      return { pass: true, message: 'R07: 通过' };
    }

    if (record.count >= 5) {
      return { pass: false, message: 'R07: 相同地址、手机号、设备短时间内操作频繁' };
    }

    record.count++;
    record.lastTime = now;
    return { pass: true, message: 'R07: 通过' };
  }

  async checkR10(userId: string): Promise<{ pass: boolean; message: string }> {
    const complaintCount = await this.prisma.order.count({
      where: {
        userId,
        status: 'COMPLETED',
      },
    });

    if (complaintCount >= 5) {
      return { pass: false, message: 'R10: 用户投诉未收到次数过多' };
    }

    return { pass: true, message: 'R10: 通过' };
  }

  async checkOrderRisk(orderData: {
    userId: string;
    items: { productId: string; quantity: number }[];
    address: string;
    phone: string;
    deviceId?: string;
    promoterCode?: string;
  }): Promise<{ pass: boolean; violations: string[] }> {
    const violations: string[] = [];

    if (orderData.promoterCode) {
      const r01 = await this.checkR01(orderData.userId, orderData.promoterCode);
      if (!r01.pass) violations.push(r01.message);
    }

    if (orderData.deviceId) {
      const r04 = await this.checkR04(orderData.deviceId);
      if (!r04.pass) violations.push(r04.message);
    }

    const r07 = await this.checkR07(orderData.address, orderData.phone, orderData.deviceId || '');
    if (!r07.pass) violations.push(r07.message);

    return {
      pass: violations.length === 0,
      violations,
    };
  }

  async checkWithdrawRisk(promoterId: string, amount: number): Promise<{ pass: boolean; violations: string[] }> {
    const violations: string[] = [];

    const r03 = await this.checkR03(promoterId, amount);
    if (!r03.pass) violations.push(r03.message);

    const r06 = await this.checkR06(promoterId);
    if (!r06.pass) violations.push(r06.message);

    return {
      pass: violations.length === 0,
      violations,
    };
  }

  async checkPromoterApplyRisk(phone: string, deviceId?: string): Promise<{ pass: boolean; violations: string[] }> {
    const violations: string[] = [];

    if (deviceId) {
      const r04 = await this.checkR04(deviceId);
      if (!r04.pass) violations.push(r04.message);
    }

    return {
      pass: violations.length === 0,
      violations,
    };
  }

  async recordRefund(orderId: string): Promise<void> {
    const commission = await this.prisma.commission.findUnique({
      where: { orderId },
    });

    if (commission && commission.status === 'SETTLED') {
      await this.prisma.$transaction(async (tx) => {
        await tx.commission.update({
          where: { id: commission.id },
          data: { status: 'WITHDRAWN' },
        });

        await tx.promoter.update({
          where: { id: commission.promoterId },
          data: { balance: { decrement: commission.amount } },
        });
      });
    }
  }
}
