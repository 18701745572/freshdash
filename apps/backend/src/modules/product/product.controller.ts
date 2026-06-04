import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProductService } from './product.service';

@ApiTags('商品')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: '获取商品列表' })
  findAll(@Query('categoryId') categoryId?: string) {
    return this.productService.findAll(categoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取商品详情' })
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }
}
