import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SupplierService } from './supplier.service';

@ApiTags('供应商')
@Controller('suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post('login')
  @ApiOperation({ summary: '供应商登录' })
  login(@Body() body: { username: string; password: string }) {
    return this.supplierService.login(body.username, body.password);
  }

  @Get()
  @ApiOperation({ summary: '获取供应商列表' })
  findAll() {
    return this.supplierService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取供应商详情' })
  findOne(@Param('id') id: string) {
    return this.supplierService.findOne(id);
  }

  @Get(':id/orders')
  @ApiOperation({ summary: '获取供应商待发货订单' })
  findOrders(@Param('id') id: string) {
    return this.supplierService.findOrders(id);
  }

  @Post(':id/ship')
  @ApiOperation({ summary: '供应商发货' })
  ship(@Param('id') id: string, @Body() body: { orderId: string; trackingNo: string }) {
    return this.supplierService.shipOrder(id, body.orderId, body.trackingNo);
  }
}
