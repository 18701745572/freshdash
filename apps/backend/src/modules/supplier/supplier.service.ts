import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class SupplierService {
  constructor(private prisma: PrismaService) {}

  private generateToken(supplierId: string): string {
    const secret = process.env.JWT_SECRET || 'freshdash-secret-key';
    const payload = { supplierId, type: 'supplier', iat: Date.now() };
    const header = { alg: 'HS256', typ: 'JWT' };

    const base64Header = Buffer.from(JSON.stringify(header)).toString('base64');
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');

    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${base64Header}.${base64Payload}`)
      .digest('base64');

    return `${base64Header}.${base64Payload}.${signature}`;
  }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async login(username: string, password: string) {
    // For demo, we use a simple username/password check
    // In production, this should query a supplier credentials table
    const supplier = await this.prisma.supplier.findFirst({
      where: { name: username },
    });

    if (!supplier) {
      throw new UnauthorizedException('供应商不存在');
    }

    // Simple password check (in production, use bcrypt)
    const hashedPassword = this.hashPassword(password);
    if (supplier.phone !== password && supplier.phone !== hashedPassword) {
      throw new UnauthorizedException('密码错误');
    }

    const token = this.generateToken(supplier.id);
    return { token, supplier };
  }

  findAll() {
    return this.prisma.supplier.findMany();
  }

  findOne(id: string) {
    return this.prisma.supplier.findUnique({ where: { id } });
  }

  findOrders(supplierId: string) {
    return this.prisma.orderDispatch.findMany({
      where: { supplierId },
      include: {
        order: {
          include: { items: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async shipOrder(supplierId: string, orderId: string, trackingNo: string) {
    // Verify supplier has this order
    const dispatch = await this.prisma.orderDispatch.findFirst({
      where: { supplierId, orderId },
    });

    if (!dispatch) {
      throw new BadRequestException('无权操作此订单');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.orderDispatch.update({
        where: { id: dispatch.id },
        data: { status: 'SHIPPED', trackingNo, shippedAt: new Date() },
      });

      // Check if all dispatches are shipped
      const remaining = await tx.orderDispatch.count({
        where: { orderId, status: { not: 'SHIPPED' } },
      });

      if (remaining === 0) {
        await tx.order.update({
          where: { id: orderId },
          data: { status: 'SHIPPED', trackingNo, shippedAt: new Date() },
        });
      }
    });

    return { success: true };
  }
}
