import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { signSupplierToken } from '../../common/utils/supplier-token.util';

interface AddressSnapshot {
  name?: string;
  phone?: string;
  detail?: string;
  address?: string;
}

@Injectable()
export class SupplierPortalService {
  constructor(private prisma: PrismaService) {}

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  private parseAddress(raw?: string | null): { name: string; phone: string; address: string } {
    if (!raw) {
      return { name: '', phone: '', address: '' };
    }
    try {
      const parsed = JSON.parse(raw) as AddressSnapshot;
      return {
        name: parsed.name || '',
        phone: parsed.phone || '',
        address: parsed.detail || parsed.address || raw,
      };
    } catch {
      return { name: '', phone: '', address: raw };
    }
  }

  private formatOrder(order: any) {
    const receiver = this.parseAddress(order.address);
    return {
      id: order.id,
      orderNo: order.orderNo,
      status: order.status,
      createdAt: order.createdAt.toISOString().replace('T', ' ').slice(0, 19),
      shippedAt: order.shippedAt
        ? order.shippedAt.toISOString().replace('T', ' ').slice(0, 19)
        : undefined,
      itemCount: order.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
      trackingNo: order.trackingNo || undefined,
      receiver,
      items: order.items.map((item: any) => ({
        id: item.id,
        name: item.productName,
        quantity: item.quantity,
        unitPrice: item.price / 100,
      })),
      remark: order.remark || undefined,
    };
  }

  async login(username: string, password: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: {
        OR: [{ username }, { phone: username }],
        status: 'ACTIVE',
      },
    });

    if (!supplier?.passwordHash) {
      throw new UnauthorizedException('账号或密码错误');
    }

    const passwordHash = this.hashPassword(password);
    if (passwordHash !== supplier.passwordHash) {
      throw new UnauthorizedException('账号或密码错误');
    }

    const token = signSupplierToken(supplier.id, supplier.name);
    return {
      token,
      supplierId: supplier.id,
      supplierName: supplier.name,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };
  }

  async getDispatches(supplierId: string, status?: string) {
    const where: any = { supplierId };
    if (status === 'pending') {
      where.status = 'PENDING_SHIPMENT';
    } else if (status === 'shipped') {
      where.status = { in: ['SHIPPED', 'COMPLETED'] };
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => this.formatOrder(order));
  }

  async getOrderDetail(supplierId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, supplierId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    return this.formatOrder(order);
  }

  async getStats(supplierId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayPending, totalShipped] = await Promise.all([
      this.prisma.order.count({
        where: {
          supplierId,
          status: 'PENDING_SHIPMENT',
          createdAt: { gte: today },
        },
      }),
      this.prisma.order.count({
        where: {
          supplierId,
          status: { in: ['SHIPPED', 'COMPLETED'] },
        },
      }),
    ]);

    return { todayPending, totalShipped };
  }

  async shipOrder(supplierId: string, orderId: string, trackingNo?: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, supplierId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== 'PENDING_SHIPMENT') {
      throw new ForbiddenException('订单状态不允许发货');
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'SHIPPED',
        trackingNo: trackingNo || null,
        shippedAt: new Date(),
      },
    });

    return { success: true };
  }
}
