import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  async findOne(id: string) {
    return { id, nickName: '微信用户', isPromoter: false };
  }

  async login(code: string) {
    return { token: 'mock_jwt_token_' + code, user: { id: '1', nickName: '微信用户' } };
  }
}
