import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RiskService } from './risk.service';

@ApiTags('风控')
@Controller('risk')
export class RiskController {
  constructor(private readonly riskService: RiskService) {}

  @Post('check-order')
  @ApiOperation({ summary: '检查订单风险' })
  checkOrderRisk(@Body() body: {
    userId: string;
    items: { productId: string; quantity: number }[];
    address: string;
    phone: string;
    deviceId?: string;
    promoterCode?: string;
  }) {
    return this.riskService.checkOrderRisk(body);
  }

  @Post('check-withdraw')
  @ApiOperation({ summary: '检查提现风险' })
  checkWithdrawRisk(@Body() body: { promoterId: string; amount: number }) {
    return this.riskService.checkWithdrawRisk(body.promoterId, body.amount);
  }

  @Post('check-promoter-apply')
  @ApiOperation({ summary: '检查推广员申请风险' })
  checkPromoterApplyRisk(@Body() body: { phone: string; deviceId?: string }) {
    return this.riskService.checkPromoterApplyRisk(body.phone, body.deviceId);
  }

  @Post('record-refund')
  @ApiOperation({ summary: '记录退款（触发佣金追回）' })
  recordRefund(@Body() body: { orderId: string }) {
    return this.riskService.recordRefund(body.orderId);
  }
}
