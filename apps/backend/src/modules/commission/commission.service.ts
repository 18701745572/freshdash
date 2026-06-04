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

  async applyWithdraw(promoterId: string, amount: number) {
    // TODO: 校验可提现金额并创建提现记录
    return { message: '提现申请已提交', promoterId, amount };
  }
}
