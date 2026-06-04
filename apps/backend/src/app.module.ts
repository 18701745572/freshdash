import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { SupplierModule } from './modules/supplier/supplier.module';
import { PromoterModule } from './modules/promoter/promoter.module';

@Module({
  imports: [UserModule, ProductModule, OrderModule, SupplierModule, PromoterModule],
})
export class AppModule {}
