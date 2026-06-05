import { Controller, Get, Param, Post, Body, Query } from '@nestjs/common';
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

  @Get('promoter/:promoterId/withdrawals')
  @ApiOperation({ summary: '获取推广员提现记录' })
  findPromoterWithdrawals(@Param('promoterId') promoterId: string) {
    return this.commissionService.findPromoterWithdrawals(promoterId);
  }

  @Get('withdrawals')
  @ApiOperation({ summary: '获取所有提现申请' })
  findAllWithdrawals(@Query('status') status?: string) {
    return this.commissionService.findAllWithdrawals(status);
  }

  @Post('withdraw')
  @ApiOperation({ summary: '申请提现' })
  applyWithdraw(@Body() body: { promoterId: string; amount: number }) {
    return this.commissionService.applyWithdraw(body.promoterId, body.amount);
  }

  @Post('calculate')
  @ApiOperation({ summary: '计算订单佣金' })
  calculateCommission(@Body() body: { orderId: string }) {
    return this.commissionService.calculateAndCreate(body.orderId);
  }

  @Post('settle')
  @ApiOperation({ summary: '结算佣金' })
  settleCommission(@Body() body: { orderId: string }) {
    return this.commissionService.settleCommission(body.orderId);
  }

  @Post('reverse')
  @ApiOperation({ summary: '追回佣金' })
  reverseCommission(@Body() body: { orderId: string }) {
    return this.commissionService.reverseCommission(body.orderId);
  }
}

@ApiTags('后台-佣金管理')
@Controller('admin/commissions')
export class AdminCommissionController {
  constructor(private readonly commissionService: CommissionService) {}

  @Get('withdrawals')
  @ApiOperation({ summary: '获取提现申请列表' })
  findAllWithdrawals(@Query('status') status?: string) {
    return this.commissionService.findAllWithdrawals(status);
  }

  @Post('settle-all')
  @ApiOperation({ summary: '批量结算待结算佣金' })
  settleAll() {
    return this.commissionService.settlePendingOrders();
  }

  @Post('withdrawals/:id/approve')
  @ApiOperation({ summary: '审核通过提现申请' })
  approveWithdrawal(@Param('id') id: string) {
    return this.commissionService.approveWithdrawal(id);
  }

  @Post('withdrawals/:id/reject')
  @ApiOperation({ summary: '拒绝提现申请' })
  rejectWithdrawal(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.commissionService.rejectWithdrawal(id, reason);
  }

  @Post('withdrawals/:id/pay')
  @ApiOperation({ summary: '打款' })
  payWithdrawal(@Param('id') id: string) {
    return this.commissionService.simulatePayment(id);
  }
}
