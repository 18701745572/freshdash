import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { verifySupplierToken } from '../../common/utils/supplier-token.util';

@Injectable()
export class SupplierAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization as string | undefined;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';

    const payload = verifySupplierToken(token);
    if (!payload) {
      throw new UnauthorizedException('登录已过期，请重新登录');
    }

    request.supplier = payload;
    return true;
  }
}
