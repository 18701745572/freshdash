import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PromoterService } from './promoter.service';

@Controller('promoters')
export class PromoterController {
  constructor(private readonly promoterService: PromoterService) {}

  @Get()
  findAll() {
    return this.promoterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promoterService.findOne(id);
  }

  @Get(':id/commissions')
  findCommissions(@Param('id') id: string) {
    return this.promoterService.findCommissions(id);
  }

  @Post(':id/withdraw')
  withdraw(@Param('id') id: string, @Body() body: { amount: number }) {
    return this.promoterService.applyWithdraw(id, body.amount);
  }
}
