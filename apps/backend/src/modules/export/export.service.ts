import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  async exportOrdersToExcel(supplierId?: string): Promise<string> {
    const where: any = {};
    if (supplierId) {
      where.supplierId = supplierId;
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const rows = [];
    rows.push(['订单号', '下单时间', '商品名称', '数量', '单价', '小计', '收货地址', '状态']);

    for (const order of orders) {
      const statusMap: Record<string, string> = {
        PENDING_PAYMENT: '待支付',
        PENDING_DISPATCH: '待派单',
        PENDING_SHIPMENT: '待发货',
        SHIPPED: '已发货',
        COMPLETED: '已完成',
        CANCELLED: '已取消',
      };

      for (const item of order.items) {
        rows.push([
          order.orderNo,
          order.createdAt.toISOString().split('T')[0],
          item.productName,
          item.quantity,
          (item.price / 100).toFixed(2),
          ((item.price * item.quantity) / 100).toFixed(2),
          order.address || '-',
          statusMap[order.status] || order.status,
        ]);
      }
    }

    return this.generateExcelContent(rows);
  }

  async exportSupplierShipment(supplierId: string): Promise<string> {
    const dispatches = await this.prisma.orderDispatch.findMany({
      where: { supplierId, status: 'PENDING' },
      include: {
        order: {
          include: { items: true },
        },
      },
    });

    const rows = [];
    rows.push(['派单号', '订单号', '商品名称', '数量', '单价', '小计', '收货地址', '收货人', '联系电话']);

    for (const dispatch of dispatches) {
      for (const item of dispatch.order.items) {
        const addressMatch = dispatch.order.address?.match(/(.+)\s*\((.+)\s+(.+)\)/);
        let receiverName = '';
        let receiverPhone = '';
        if (addressMatch) {
          receiverName = addressMatch[2];
          receiverPhone = addressMatch[3];
        }

        rows.push([
          dispatch.id,
          dispatch.order.orderNo,
          item.productName,
          item.quantity,
          (item.price / 100).toFixed(2),
          ((item.price * item.quantity) / 100).toFixed(2),
          dispatch.order.address || '-',
          receiverName,
          receiverPhone,
        ]);
      }
    }

    return this.generateExcelContent(rows);
  }

  private generateExcelContent(rows: string[][]): string {
    const headers = rows[0];
    const dataRows = rows.slice(1);

    let csvContent = headers.join('\t') + '\n';
    
    for (const row of dataRows) {
      csvContent += row.map(cell => {
        if (typeof cell === 'string' && cell.includes('\t')) {
          return `"${cell}"`;
        }
        return cell;
      }).join('\t') + '\n';
    }

    return csvContent;
  }
}
