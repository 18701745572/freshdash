import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentService } from './payment.service';

@ApiTags('支付')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create')
  @ApiOperation({ summary: '创建支付订单' })
  createPayment(@Body() body: { orderId: string; userId: string }) {
    return this.paymentService.createPayment(body.orderId, body.userId);
  }

  @Post('wx/notify')
  @ApiOperation({ summary: '微信支付回调' })
  handlePayNotify(@Body() body: any) {
    return this.paymentService.handlePayNotify(body);
  }

  @Post('refund')
  @ApiOperation({ summary: '申请退款' })
  refund(@Body() body: { orderId: string; userId: string; amount?: number }) {
    return this.paymentService.refund(body.orderId, body.userId, body.amount);
  }
}
