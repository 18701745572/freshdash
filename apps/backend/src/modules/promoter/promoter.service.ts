import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PromoterService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.promoter.findMany();
  }

  findOne(id: string) {
    return this.prisma.promoter.findUnique({ where: { id } });
  }

  findCommissions(promoterId: string) {
    return this.prisma.commission.findMany({
      where: { promoterId },
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
