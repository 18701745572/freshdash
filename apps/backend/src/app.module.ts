import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { CommissionModule } from './modules/commission/commission.module';
import { CategoryModule } from './modules/category/category.module';
import { BannerModule } from './modules/banner/banner.module';
import { SupplierModule } from './modules/supplier/supplier.module';
import { PromoterModule } from './modules/promoter/promoter.module';
import { AddressModule } from './modules/address/address.module';
import { CartModule } from './modules/cart/cart.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    ProductModule,
    CategoryModule,
    BannerModule,
    OrderModule,
    CommissionModule,
    SupplierModule,
    PromoterModule,
    AddressModule,
    CartModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
