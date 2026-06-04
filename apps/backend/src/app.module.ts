import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { CommissionModule } from './modules/commission/commission.module';

@Module({
  imports: [PrismaModule, UserModule, ProductModule, OrderModule, CommissionModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
