import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PromoterService } from './promoter.service';

@ApiTags('推广员')
@Controller('promoters')
export class PromoterController {
  constructor(private readonly promoterService: PromoterService) {}

  @Get()
  @ApiOperation({ summary: '获取推广员列表' })
  findAll() {
    return this.promoterService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取推广员详情' })
  findOne(@Param('id') id: string) {
    return this.promoterService.findOne(id);
  }

  @Get(':id/commissions')
  @ApiOperation({ summary: '获取推广员佣金记录' })
  findCommissions(@Param('id') id: string) {
    return this.promoterService.findCommissions(id);
  }

  @Post(':id/withdraw')
  @ApiOperation({ summary: '推广员申请提现' })
  withdraw(@Param('id') id: string, @Body() body: { amount: number }) {
    return this.promoterService.applyWithdraw(id, body.amount);
  }
}
