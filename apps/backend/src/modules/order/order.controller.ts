import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
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
  create(@Body() body: { userId: string; items: { productId: string; quantity: number }[] }) {
    return this.orderService.create(body);
  }
}
