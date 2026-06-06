import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PromoterService {
  constructor(private prisma: PrismaService) {}

  private generatePromoterCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private generateSmsCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private smsCodeStore: Map<string, { code: string; expiresAt: number }> = new Map();

  async sendSmsCode(phone: string) {
    const code = this.generateSmsCode();
    this.smsCodeStore.set(phone, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    console.log(`[模拟发送短信] 验证码: ${code}，手机号: ${phone}`);

    return { success: true, message: '验证码已发送' };
  }

  async verifySmsCode(phone: string, code: string): Promise<boolean> {
    const stored = this.smsCodeStore.get(phone);
    if (!stored) {
      return false;
    }
    if (Date.now() > stored.expiresAt) {
      this.smsCodeStore.delete(phone);
      return false;
    }
    if (stored.code !== code) {
      return false;
    }
    this.smsCodeStore.delete(phone);
    return true;
  }

  async apply(userId: string, phone: string, code: string) {
    const isValid = await this.verifySmsCode(phone, code);
    if (!isValid) {
      throw new BadRequestException('验证码无效或已过期');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    if (user.isPromoter) {
      throw new ConflictException('您已经是推广员');
    }

    let codeExists = true;
    let promoterCode = '';
    while (codeExists) {
      promoterCode = this.generatePromoterCode();
      const exists = await this.prisma.user.findUnique({
        where: { promoterCode },
      });
      codeExists = !!exists;
    }

    const promoter = await this.prisma.promoter.create({
      data: {
        userId,
        totalCommission: 0,
        balance: 0,
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { isPromoter: true, promoterCode },
    });

    return { promoter, promoterCode };
  }

  async bind(userId: string, promoterCode: string) {
    const promoter = await this.prisma.user.findFirst({
      where: { promoterCode },
    });

    if (!promoter || !promoter.isPromoter) {
      throw new BadRequestException('推广码无效');
    }

    if (userId === promoter.id) {
      throw new BadRequestException('不能绑定自己的推广码');
    }

    const existingBind = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (existingBind?.promoterCode) {
      throw new ConflictException('您已经绑定了推广员');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { promoterCode },
    });

    return { success: true, message: '绑定成功' };
  }

  async getQrcode(promoterId: string) {
    const promoter = await this.prisma.promoter.findUnique({
      where: { id: promoterId },
      include: { user: true },
    });

    if (!promoter) {
      throw new BadRequestException('推广员不存在');
    }

    return {
      qrcodeUrl: `https://qrcode.example.com/${promoter.user.promoterCode}`,
      promoterCode: promoter.user.promoterCode,
    };
  }

  findAll() {
    return this.prisma.promoter.findMany({
      include: { user: true },
    });
  }

  findOne(id: string) {
    return this.prisma.promoter.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  findByUserId(userId: string) {
    return this.prisma.promoter.findUnique({
      where: { userId },
      include: { user: true },
    });
  }

  findCommissions(promoterId: string) {
    return this.prisma.commission.findMany({
      where: { promoterId },
      include: { order: true },
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
}
