import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationService } from './notification.service';

@ApiTags('通知')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('sms')
  @ApiOperation({ summary: '发送短信' })
  sendSms(@Body() body: { phone: string; template: string; params?: Record<string, string> }) {
    return this.notificationService.sendSms({
      phone: body.phone,
      template: body.template,
      params: body.params,
    });
  }

  @Post('email')
  @ApiOperation({ summary: '发送邮件' })
  sendEmail(@Body() body: { to: string; subject: string; template: string; params?: Record<string, string> }) {
    return this.notificationService.sendEmail({
      to: body.to,
      subject: body.subject,
      template: body.template,
      params: body.params,
    });
  }
}
