import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SupplierService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.supplier.findMany();
  }

  findOne(id: string) {
    return this.prisma.supplier.findUnique({ where: { id } });
  }

  findOrders(supplierId: string) {
    return this.prisma.order.findMany({
      where: { supplierId, status: 'PENDING_SHIPMENT' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async shipOrder(supplierId: string, orderId: string, trackingNo: string) {
    // TODO: 校验供应商权限并更新订单状态
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'SHIPPED', trackingNo, shippedAt: new Date() },
    });
  }
}
