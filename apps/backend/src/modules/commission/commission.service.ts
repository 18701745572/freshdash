import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CommissionService {
  constructor(private prisma: PrismaService) {}

  findByPromoter(promoterId: string) {
    return this.prisma.commission.findMany({
      where: { promoterId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAllWithdrawals() {
    return this.prisma.withdrawal.findMany({
      include: { promoter: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async applyWithdraw(promoterId: string, amount: number) {
    // TODO: 校验可提现金额、风控规则
    return this.prisma.withdrawal.create({
      data: {
        promoterId,
        amount,
        status: 'PENDING',
      },
    });
  }
}
