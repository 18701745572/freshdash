import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupplierPortalService } from './supplier-portal.service';
import { SupplierLoginDto } from './dto/supplier-login.dto';
import { ShipOrderDto } from './dto/ship-order.dto';
import { SupplierAuthGuard } from './supplier-auth.guard';

@ApiTags('供应商门户')
@Controller('supplier')
export class SupplierPortalController {
  constructor(private readonly portalService: SupplierPortalService) {}

  @Post('auth/login')
  @ApiOperation({ summary: '供应商登录' })
  login(@Body() body: SupplierLoginDto) {
    return this.portalService.login(body.username, body.password);
  }

  @Get('dispatches')
  @UseGuards(SupplierAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取派发的订单列表' })
  dispatches(@Req() req: any, @Query('status') status?: string) {
    return this.portalService.getDispatches(req.supplier.supplierId, status);
  }

  @Get('orders/:id')
  @UseGuards(SupplierAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取订单详情' })
  orderDetail(@Req() req: any, @Param('id') id: string) {
    return this.portalService.getOrderDetail(req.supplier.supplierId, id);
  }

  @Get('stats')
  @UseGuards(SupplierAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取供应商统计数据' })
  stats(@Req() req: any) {
    return this.portalService.getStats(req.supplier.supplierId);
  }

  @Put('orders/:id/ship')
  @UseGuards(SupplierAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '确认发货' })
  ship(@Req() req: any, @Param('id') id: string, @Body() body: ShipOrderDto) {
    return this.portalService.shipOrder(req.supplier.supplierId, id, body.trackingNo);
  }
}
