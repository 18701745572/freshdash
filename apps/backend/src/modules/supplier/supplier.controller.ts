import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SupplierService } from './supplier.service';

@Controller('suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Get()
  findAll() {
    return this.supplierService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.supplierService.findOne(id);
  }

  @Get(':id/orders')
  findOrders(@Param('id') id: string) {
    return this.supplierService.findOrders(id);
  }

  @Post(':id/ship')
  ship(@Param('id') id: string, @Body() body: { orderId: string; trackingNo: string }) {
    return this.supplierService.shipOrder(id, body.orderId, body.trackingNo);
  }
}
