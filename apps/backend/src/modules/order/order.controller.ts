import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrderService } from './order.service';

@ApiTags('订单')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: '获取订单列表' })
  findAll(@Query('userId') userId: string, @Query('status') status?: string) {
    return this.orderService.findAll(userId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取订单详情' })
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建订单' })
  create(@Body() body: {
    userId: string;
    items: { productId: string; quantity: number }[];
    addressId?: string;
    remark?: string;
  }) {
    return this.orderService.create(body);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: '支付订单' })
  pay(@Param('id') id: string) {
    return this.orderService.pay(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: '取消订单' })
  cancel(@Param('id') id: string, @Body('userId') userId: string) {
    return this.orderService.cancel(id, userId);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: '确认收货' })
  confirmReceipt(@Param('id') id: string, @Body('userId') userId: string) {
    return this.orderService.confirmReceipt(id, userId);
  }

  @Post(':id/dispatch')
  @ApiOperation({ summary: '派单给供应商' })
  dispatch(@Param('id') id: string, @Body('supplierId') supplierId: string) {
    return this.orderService.dispatch(id, supplierId);
  }
}

@ApiTags('商家订单')
@Controller('supplier/orders')
export class SupplierOrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: '获取商家订单列表' })
  findBySupplier(@Query('supplierId') supplierId: string) {
    return this.orderService.findAllBySupplier(supplierId);
  }

  @Post('dispatch/:id/ship')
  @ApiOperation({ summary: '商家发货' })
  ship(@Param('id') dispatchId: string, @Body('trackingNo') trackingNo?: string) {
    return this.orderService.ship(dispatchId, trackingNo);
  }
}
