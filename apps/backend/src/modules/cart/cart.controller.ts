import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CartService } from './cart.service';

@ApiTags('购物车')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: '获取购物车' })
  getCart(@Body('userId') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post('items')
  @ApiOperation({ summary: '添加商品到购物车' })
  addItem(@Body() body: { userId: string; productId: string; quantity: number }) {
    return this.cartService.addItem(body.userId, body.productId, body.quantity);
  }

  @Put('items/:id')
  @ApiOperation({ summary: '修改购物车商品数量' })
  updateItem(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.cartService.updateItem(id, quantity);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: '删除购物车商品' })
  removeItem(@Param('id') id: string) {
    return this.cartService.removeItem(id);
  }

  @Post('preview')
  @ApiOperation({ summary: '预览购物车满减' })
  preview(@Body('userId') userId: string) {
    return this.cartService.previewDiscount(userId);
  }

  @Delete('clear')
  @ApiOperation({ summary: '清空购物车' })
  clearCart(@Body('userId') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
