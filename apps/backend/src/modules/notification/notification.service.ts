import { Injectable, OnModuleInit } from '@nestjs/common';

export interface SmsMessage {
  phone: string;
  template: string;
  params?: Record<string, string>;
}

export interface EmailMessage {
  to: string;
  subject: string;
  template: string;
  params?: Record<string, string>;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class NotificationService implements OnModuleInit {
  private smsQueue: SmsMessage[] = [];
  private emailQueue: EmailMessage[] = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;

  async onModuleInit() {
    this.intervalId = setInterval(() => {
      this.processQueues();
    }, 5000);
    console.log('[NotificationService] Initialized - Mock SMS/Email processor started');
  }

  onDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  async sendSms(message: SmsMessage): Promise<NotificationResult> {
    try {
      const templateContent = this.getSmsTemplate(message.template, message.params);
      console.log(`[SMS] Sending to ${message.phone}: ${templateContent}`);
      
      this.smsQueue.push(message);

      return {
        success: true,
        messageId: `SMS_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendEmail(message: EmailMessage): Promise<NotificationResult> {
    try {
      const htmlContent = this.getEmailTemplate(message.template, message.params);
      console.log(`[Email] Sending to ${message.to}: ${message.subject}`);
      
      this.emailQueue.push(message);

      return {
        success: true,
        messageId: `EMAIL_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendOrderCreatedNotification(userId: string, orderNo: string, totalAmount: number) {
    console.log(`[Notification] Order created: ${orderNo}, amount: ${totalAmount}`);
    return { success: true };
  }

  async sendOrderPaidNotification(userId: string, orderNo: string) {
    console.log(`[Notification] Order paid: ${orderNo}`);
    return { success: true };
  }

  async sendOrderShippedNotification(userId: string, orderNo: string, trackingNo: string) {
    console.log(`[Notification] Order shipped: ${orderNo}, tracking: ${trackingNo}`);
    return { success: true };
  }

  async sendOrderCompletedNotification(userId: string, orderNo: string) {
    console.log(`[Notification] Order completed: ${orderNo}`);
    return { success: true };
  }

  async sendWithdrawApprovedNotification(promoterId: string, amount: number) {
    console.log(`[Notification] Withdrawal approved: ${amount}`);
    return { success: true };
  }

  async sendWithdrawRejectedNotification(promoterId: string, amount: number, reason?: string) {
    console.log(`[Notification] Withdrawal rejected: ${amount}, reason: ${reason}`);
    return { success: true };
  }

  async sendCommissionSettledNotification(promoterId: string, amount: number) {
    console.log(`[Notification] Commission settled: ${amount}`);
    return { success: true };
  }

  private processQueues() {
    if (this.smsQueue.length > 0) {
      const message = this.smsQueue.shift();
      console.log(`[SMS Queue] Processed: ${message.phone}`);
    }

    if (this.emailQueue.length > 0) {
      const message = this.emailQueue.shift();
      console.log(`[Email Queue] Processed: ${message.to}`);
    }
  }

  private getSmsTemplate(template: string, params?: Record<string, string>): string {
    const templates: Record<string, string> = {
      'order_created': `您的订单已创建，订单号：${params?.orderNo || ''}，金额：${params?.amount || ''}元`,
      'order_paid': `您的订单已支付，订单号：${params?.orderNo || ''}，我们将尽快为您发货`,
      'order_shipped': `您的订单已发货，订单号：${params?.orderNo || ''}，快递单号：${params?.trackingNo || ''}`,
      'order_completed': `您的订单已完成，感谢您的购买！`,
      'withdraw_approved': `您的提现申请已通过，金额：${params?.amount || ''}元`,
      'withdraw_rejected': `您的提现申请被拒绝，原因：${params?.reason || '不符合提现条件'}`,
      'commission_settled': `您有新的佣金到账，金额：${params?.amount || ''}元`,
    };

    return templates[template] || `Template: ${template}`;
  }

  private getEmailTemplate(template: string, params?: Record<string, string>): string {
    const templates: Record<string, string> = {
      'order_created': `<h1>订单创建成功</h1><p>订单号：${params?.orderNo || ''}</p><p>金额：${params?.amount || ''}元</p>`,
      'order_shipped': `<h1>订单已发货</h1><p>订单号：${params?.orderNo || ''}</p><p>快递单号：${params?.trackingNo || ''}</p>`,
    };

    return templates[template] || `<h1>Notification</h1><p>Template: ${template}</p>`;
  }
}
