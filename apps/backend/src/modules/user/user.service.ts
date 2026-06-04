import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async login(code: string) {
    // TODO: 调用微信接口换取 openId
    const openId = `mock_openid_${code}`;
    let user = await this.prisma.user.findUnique({ where: { openId } });
    if (!user) {
      user = await this.prisma.user.create({
        data: { openId, nickName: '微信用户' },
      });
    }
    return { token: 'mock_jwt_token', user };
  }

  async create(data: CreateUserDto) {
    return this.prisma.user.create({ data });
  }
}
