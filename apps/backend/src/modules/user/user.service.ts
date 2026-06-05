import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  private generateToken(userId: string): string {
    const secret = process.env.JWT_SECRET || 'freshdash-secret-key';
    const payload = { userId, iat: Date.now() };
    const header = { alg: 'HS256', typ: 'JWT' };

    const base64Header = Buffer.from(JSON.stringify(header)).toString('base64');
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');

    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${base64Header}.${base64Payload}`)
      .digest('base64');

    return `${base64Header}.${base64Payload}.${signature}`;
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async login(code: string) {
    // TODO: 调用微信接口换取 openId (这里使用 mock)
    const openId = `mock_openid_${code}`;
    let user = await this.prisma.user.findUnique({ where: { openId } });
    if (!user) {
      user = await this.prisma.user.create({
        data: { openId, nickName: '微信用户' },
      });
    }
    const token = this.generateToken(user.id);
    return { token, user };
  }

  async create(data: CreateUserDto) {
    return this.prisma.user.create({ data });
  }

  async findByOpenId(openId: string) {
    return this.prisma.user.findUnique({ where: { openId } });
  }
}
