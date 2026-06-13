import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async wechatLogin(code: string) {
    const appid = process.env.WX_APP_ID;
    const secret = process.env.WX_APP_SECRET;

    if (!appid || !secret) {
      throw new UnauthorizedException('微信 AppID 或 AppSecret 未配置');
    }

    const { data } = await axios.get(
      'https://api.weixin.qq.com/sns/jscode2session',
      {
        params: {
          appid,
          secret,
          js_code: code,
          grant_type: 'authorization_code',
        },
      },
    );

    if (data.errcode) {
      throw new UnauthorizedException(data.errmsg || '微信登录失败');
    }

    const { openid, session_key, unionid } = data;

    let user = await this.prisma.user.findUnique({
      where: { openId: openid },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          openId: openid,
          unionId: unionid || null,
          sessionKey: session_key,
        },
      });
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { sessionKey: session_key, unionId: unionid || user.unionId },
      });
    }

    const token = this.jwtService.sign({
      userId: user.id,
      openId: user.openId,
    });

    return { token, user };
  }
}
