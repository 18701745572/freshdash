import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

type JobData = {
  orderId?: string;
  promoterId?: string;
  delay: number;
};

interface Job {
  id: string;
  data: JobData;
  executeAt: number;
  handler: (data: JobData) => Promise<void>;
}

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private jobs: Map<string, Job> = new Map();
  private timers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  async onModuleInit() {
    console.log('QueueService initialized - using mock timer-based queue');
  }

  async onModuleDestroy() {
    this.timers.forEach((timer) => clearTimeout(timer));
  }

  async add(jobName: string, data: JobData): Promise<string> {
    const jobId = `${jobName}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const executeAt = Date.now() + data.delay;

    const job: Job = {
      id: jobId,
      data,
      executeAt,
      handler: this.getHandler(jobName),
    };

    this.jobs.set(jobId, job);

    const timer = setTimeout(async () => {
      try {
        await job.handler(data);
        this.jobs.delete(jobId);
        this.timers.delete(jobId);
      } catch (error) {
        console.error(`Job ${jobId} failed:`, error);
      }
    }, data.delay);

    this.timers.set(jobId, timer);

    console.log(`[Queue] Added job: ${jobName}, delay: ${data.delay}ms, jobId: ${jobId}`);

    return jobId;
  }

  async remove(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    const timer = this.timers.get(jobId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(jobId);
    }

    this.jobs.delete(jobId);
    return true;
  }

  getJobs(jobName?: string): Job[] {
    const allJobs = Array.from(this.jobs.values());
    if (jobName) {
      return allJobs.filter((job) => job.id.startsWith(jobName));
    }
    return allJobs;
  }

  private getHandler(jobName: string): (data: JobData) => Promise<void> {
    switch (jobName) {
      case 'cancelOrder':
        return this.handleCancelOrder.bind(this);
      case 'settleCommission':
        return this.handleSettleCommission.bind(this);
      default:
        return async () => {};
    }
  }

  private async handleCancelOrder(data: JobData) {
    console.log(`[Queue] Executing cancelOrder for order: ${data.orderId}`);
    try {
      const { OrderService } = await import('../order/order.service');
      const { PrismaService } = await import('../../prisma/prisma.service');
      const { QueueService } = await import('./queue.service');
      
      const prisma = new PrismaService();
      const queueService = new QueueService();
      const orderService = new OrderService(prisma, queueService);
      
      const order = await prisma.order.findUnique({ where: { id: data.orderId } });
      if (order && order.status === 'PENDING_PAYMENT') {
        await orderService.cancel(data.orderId, order.userId);
        console.log(`[Queue] Order ${data.orderId} cancelled successfully`);
      }
    } catch (error) {
      console.error(`[Queue] Failed to cancel order ${data.orderId}:`, error);
    }
  }

  private async handleSettleCommission(data: JobData) {
    console.log(`[Queue] Executing settleCommission for order: ${data.orderId}`);
    try {
      const { CommissionService } = await import('../commission/commission.service');
      const { PrismaService } = await import('../../prisma/prisma.service');
      
      const prisma = new PrismaService();
      const commissionService = new CommissionService(prisma);
      
      await commissionService.settleCommission(data.orderId);
      console.log(`[Queue] Commission settled for order ${data.orderId}`);
    } catch (error) {
      console.error(`[Queue] Failed to settle commission for order ${data.orderId}:`, error);
    }
  }
}
