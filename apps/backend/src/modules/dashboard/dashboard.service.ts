import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const [
      totalOrders,
      totalUsers,
      totalPromoters,
      totalSales,
      pendingOrders,
      completedOrders,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.user.count(),
      this.prisma.promoter.count(),
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: 'COMPLETED' },
      }),
      this.prisma.order.count({
        where: { status: { in: ['PENDING_PAYMENT', 'PENDING_DISPATCH', 'PENDING_SHIPMENT'] } },
      }),
      this.prisma.order.count({ where: { status: 'COMPLETED' } }),
    ]);

    return {
      totalOrders,
      totalUsers,
      totalPromoters,
      totalSales: totalSales._sum.totalAmount || 0,
      pendingOrders,
      completedOrders,
      conversionRate: totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : '0',
    };
  }

  async getDailyStats(days: number = 7) {
    const stats = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const [orders, sales, newUsers] = await Promise.all([
        this.prisma.order.count({
          where: {
            createdAt: { gte: startOfDay, lte: endOfDay },
          },
        }),
        this.prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: {
            createdAt: { gte: startOfDay, lte: endOfDay },
            status: 'COMPLETED',
          },
        }),
        this.prisma.user.count({
          where: {
            createdAt: { gte: startOfDay, lte: endOfDay },
          },
        }),
      ]);

      stats.push({
        date: startOfDay.toISOString().split('T')[0],
        orders,
        sales: sales._sum.totalAmount || 0,
        newUsers,
      });
    }

    return stats;
  }

  async getCategoryStats() {
    const categories = await this.prisma.category.findMany();
    const stats = await Promise.all(
      categories.map(async (cat) => {
        const products = await this.prisma.product.count({ where: { categoryId: cat.id } });
        const orders = await this.prisma.orderItem.count({
          where: { product: { categoryId: cat.id } },
        });
        return {
          name: cat.name,
          productCount: products,
          orderCount: orders,
        };
      })
    );

    return stats;
  }

  async getPromoterRanking(limit: number = 10) {
    const promoters = await this.prisma.promoter.findMany({
      include: { user: true },
      orderBy: { totalCommission: 'desc' },
      take: limit,
    });

    return promoters.map((p, index) => ({
      rank: index + 1,
      name: p.user.nickName || '未知',
      phone: p.user.phone || '-',
      totalCommission: p.totalCommission,
      balance: p.balance,
    }));
  }

  async getSupplierStats() {
    const suppliers = await this.prisma.supplier.findMany({
      include: { orders: true },
    });

    return suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      orderCount: s.orders.length,
      status: s.status,
    }));
  }

  async getOrderStatusStats() {
    const statuses = ['PENDING_PAYMENT', 'PENDING_DISPATCH', 'PENDING_SHIPMENT', 'SHIPPED', 'COMPLETED', 'CANCELLED'];

    const stats = await Promise.all(
      statuses.map((status) =>
        this.prisma.order.count({ where: { status } })
      )
    );

    return statuses.map((status, index) => ({
      status,
      count: stats[index],
    }));
  }
}
