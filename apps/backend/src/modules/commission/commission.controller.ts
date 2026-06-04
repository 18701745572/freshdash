import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CommissionService } from './commission.service';

@ApiTags('佣金')
@Controller('commissions')
export class CommissionController {
  constructor(private readonly commissionService: CommissionService) {}

  @Get('promoter/:promoterId')
  @ApiOperation({ summary: '获取推广员佣金记录' })
  findByPromoter(@Param('promoterId') promoterId: string) {
    return this.commissionService.findByPromoter(promoterId);
  }

  @Post('withdraw')
  @ApiOperation({ summary: '申请提现' })
  applyWithdraw(@Body() body: { promoterId: string; amount: number }) {
    return this.commissionService.applyWithdraw(body.promoterId, body.amount);
  }
}
