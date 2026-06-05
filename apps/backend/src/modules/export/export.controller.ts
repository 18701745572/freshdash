import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ExportService } from './export.service';

@ApiTags('数据导出')
@Controller('admin/export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('orders')
  @ApiOperation({ summary: '导出订单列表' })
  async exportOrders(@Query('supplierId') supplierId?: string) {
    const content = await this.exportService.exportOrdersToExcel(supplierId);
    return {
      filename: `orders_${Date.now()}.csv`,
      content,
    };
  }

  @Get('supplier/:supplierId/shipment')
  @ApiOperation({ summary: '导出供应商发货表' })
  async exportSupplierShipment(@Param('supplierId') supplierId: string) {
    const content = await this.exportService.exportSupplierShipment(supplierId);
    return {
      filename: `shipment_${supplierId}_${Date.now()}.csv`,
      content,
    };
  }
}
