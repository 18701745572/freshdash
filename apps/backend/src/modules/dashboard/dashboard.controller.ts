import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('数据看板')
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: '获取概览统计' })
  getOverview() {
    return this.dashboardService.getOverview();
  }

  @Get('daily-stats')
  @ApiOperation({ summary: '获取每日统计' })
  getDailyStats(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days, 10) : 7;
    return this.dashboardService.getDailyStats(daysNum);
  }

  @Get('category-stats')
  @ApiOperation({ summary: '获取分类统计' })
  getCategoryStats() {
    return this.dashboardService.getCategoryStats();
  }

  @Get('promoter-ranking')
  @ApiOperation({ summary: '获取推广员排行榜' })
  getPromoterRanking(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.dashboardService.getPromoterRanking(limitNum);
  }

  @Get('supplier-stats')
  @ApiOperation({ summary: '获取供应商统计' })
  getSupplierStats() {
    return this.dashboardService.getSupplierStats();
  }

  @Get('order-status')
  @ApiOperation({ summary: '获取订单状态统计' })
  getOrderStatusStats() {
    return this.dashboardService.getOrderStatusStats();
  }
}
