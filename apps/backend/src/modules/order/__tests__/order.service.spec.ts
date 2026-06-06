import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from '../order.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { QueueService } from '../../queue/queue.service';
import { BadRequestException } from '@nestjs/common';

describe('OrderService', () => {
  let orderService: OrderService;
  let prismaService: PrismaService;
  let queueService: QueueService;

  const mockPrismaService = {
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    orderItem: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    address: {
      findUnique: jest.fn(),
    },
    discountRule: {
      findMany: jest.fn(),
    },
    orderDispatch: {
      create: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((fn) => fn(mockPrismaService)),
  };

  const mockQueueService = {
    add: jest.fn(),
    remove: jest.fn(),
    getJobs: jest.fn().mockReturnValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: QueueService, useValue: mockQueueService },
      ],
    }).compile();

    orderService = module.get<OrderService>(OrderService);
    prismaService = module.get<PrismaService>(PrismaService);
    queueService = module.get<QueueService>(QueueService);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return orders for a user', async () => {
      const mockOrders = [
        { id: '1', orderNo: 'XD001', userId: 'user1', status: 'PENDING_PAYMENT' },
      ];
      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);

      const result = await orderService.findAll('user1');

      expect(result).toEqual(mockOrders);
      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter orders by status', async () => {
      const mockOrders = [
        { id: '1', orderNo: 'XD001', userId: 'user1', status: 'COMPLETED' },
      ];
      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);

      const result = await orderService.findAll('user1', 'COMPLETED');

      expect(result).toEqual(mockOrders);
      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1', status: 'COMPLETED' },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a single order', async () => {
      const mockOrder = { id: '1', orderNo: 'XD001', userId: 'user1' };
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      const result = await orderService.findOne('1');

      expect(result).toEqual(mockOrder);
      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { items: true },
      });
    });
  });

  describe('create', () => {
    it('should create an order successfully', async () => {
      const mockProducts = [
        { id: 'p1', name: 'Product 1', price: 1000, stock: 10, coverImage: 'img.jpg' },
      ];
      const mockOrder = {
        id: 'o1',
        orderNo: 'XD001',
        userId: 'user1',
        status: 'PENDING_PAYMENT',
        totalAmount: 1000,
        items: [{ productId: 'p1', productName: 'Product 1', price: 1000, quantity: 1 }],
      };

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);
      mockPrismaService.order.create.mockResolvedValue(mockOrder);
      mockPrismaService.product.update.mockResolvedValue({});
      mockPrismaService.discountRule.findMany.mockResolvedValue([]);

      const result = await orderService.create({
        userId: 'user1',
        items: [{ productId: 'p1', quantity: 1 }],
      });

      expect(result.orderNo).toBeDefined();
      expect(mockQueueService.add).toHaveBeenCalledWith('cancelOrder', {
        orderId: expect.any(String),
        delay: 30 * 60 * 1000,
      });
    });

    it('should throw error if product not found', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);

      await expect(
        orderService.create({
          userId: 'user1',
          items: [{ productId: 'nonexistent', quantity: 1 }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if stock insufficient', async () => {
      const mockProducts = [
        { id: 'p1', name: 'Product 1', price: 1000, stock: 0, coverImage: 'img.jpg' },
      ];
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      await expect(
        orderService.create({
          userId: 'user1',
          items: [{ productId: 'p1', quantity: 1 }],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('pay', () => {
    it('should update order status to PENDING_DISPATCH on payment', async () => {
      const mockOrder = { id: '1', orderNo: 'XD001', userId: 'user1', status: 'PENDING_PAYMENT' };
      const updatedOrder = { ...mockOrder, status: 'PENDING_DISPATCH' };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.order.update.mockResolvedValue(updatedOrder);

      const result = await orderService.pay('1');

      expect(result.status).toBe('PENDING_DISPATCH');
      expect(mockQueueService.getJobs).toHaveBeenCalledWith('cancelOrder');
    });

    it('should throw error if order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(orderService.pay('nonexistent')).rejects.toThrow(BadRequestException);
    });

    it('should throw error if order status is not PENDING_PAYMENT', async () => {
      const mockOrder = { id: '1', orderNo: 'XD001', userId: 'user1', status: 'COMPLETED' };
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      await expect(orderService.pay('1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('should cancel order and restore stock', async () => {
      const mockOrder = { id: '1', orderNo: 'XD001', userId: 'user1', status: 'PENDING_PAYMENT' };
      const mockItems = [{ productId: 'p1', quantity: 1 }];

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.orderItem.findMany.mockResolvedValue(mockItems);
      mockPrismaService.order.update.mockResolvedValue({ ...mockOrder, status: 'CANCELLED' });
      mockPrismaService.product.update.mockResolvedValue({});

      const result = await orderService.cancel('1', 'user1');

      expect(result).toEqual({ success: true });
    });

    it('should throw error if user is not authorized', async () => {
      const mockOrder = { id: '1', orderNo: 'XD001', userId: 'user1', status: 'PENDING_PAYMENT' };
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      await expect(orderService.cancel('1', 'wrongUser')).rejects.toThrow(BadRequestException);
    });
  });

  describe('confirmReceipt', () => {
    it('should confirm receipt and schedule commission settlement', async () => {
      const mockOrder = { id: '1', orderNo: 'XD001', userId: 'user1', status: 'SHIPPED' };
      const updatedOrder = { ...mockOrder, status: 'COMPLETED' };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.order.update.mockResolvedValue(updatedOrder);

      const result = await orderService.confirmReceipt('1', 'user1');

      expect(result.status).toBe('COMPLETED');
      expect(mockQueueService.add).toHaveBeenCalledWith('settleCommission', {
        orderId: '1',
        delay: 7 * 24 * 60 * 60 * 1000,
      });
    });
  });
});
