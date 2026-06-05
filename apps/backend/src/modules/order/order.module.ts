import { Module } from '@nestjs/common';
import { OrderController, SupplierOrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  controllers: [OrderController, SupplierOrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
