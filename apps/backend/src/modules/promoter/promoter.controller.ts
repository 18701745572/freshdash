import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PromoterService } from './promoter.service';

@ApiTags('推广员')
@Controller('promoter')
export class PromoterController {
  constructor(private readonly promoterService: PromoterService) {}

  @Post('sms-code')
  @ApiOperation({ summary: '发送验证码' })
  sendSmsCode(@Body() body: { phone: string }) {
    return this.promoterService.sendSmsCode(body.phone);
  }

  @Post('apply')
  @ApiOperation({ summary: '申请成为推广员' })
  apply(@Body() body: { userId: string; phone: string; code: string }) {
    return this.promoterService.apply(body.userId, body.phone, body.code);
  }

  @Post('bind')
  @ApiOperation({ summary: '绑定推广员' })
  bind(@Body() body: { userId: string; promoterCode: string }) {
    return this.promoterService.bind(body.userId, body.promoterCode);
  }

  @Get('me')
  @ApiOperation({ summary: '获取当前用户推广员信息' })
  getMe(@Body('userId') userId: string) {
    return this.promoterService.findByUserId(userId);
  }

  @Get(':id/qrcode')
  @ApiOperation({ summary: '获取推广二维码' })
  getQrcode(@Param('id') id: string) {
    return this.promoterService.getQrcode(id);
  }

  @Get('commissions')
  @ApiOperation({ summary: '获取我的佣金记录' })
  getMyCommissions(@Body('promoterId') promoterId: string) {
    return this.promoterService.findCommissions(promoterId);
  }

  @Post('withdraw')
  @ApiOperation({ summary: '申请提现' })
  withdraw(@Body() body: { promoterId: string; amount: number }) {
    return this.promoterService.applyWithdraw(body.promoterId, body.amount);
  }
}

@ApiTags('后台-推广员管理')
@Controller('admin/promoters')
export class AdminPromoterController {
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
}
