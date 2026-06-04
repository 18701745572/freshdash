import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { CommissionService } from './commission.service';

@Controller('commissions')
export class CommissionController {
  constructor(private readonly commissionService: CommissionService) {}

  @Get('promoter/:promoterId')
  findByPromoter(@Param('promoterId') promoterId: string) {
    return this.commissionService.findByPromoter(promoterId);
  }

  @Post('withdraw')
  applyWithdraw(@Body() body: { promoterId: string; amount: number }) {
    return this.commissionService.applyWithdraw(body.promoterId, body.amount);
  }
}
