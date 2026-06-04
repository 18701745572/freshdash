import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  findAll(@Query('userId') userId: string, @Query('status') status?: string) {
    return this.orderService.findAll(userId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Post()
  create(@Body() body: { userId: string; items: { productId: string; quantity: number }[] }) {
    return this.orderService.create(body);
  }
}
