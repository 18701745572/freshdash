import { Test, TestingModule } from '@nestjs/testing';
import { CommissionService } from '../commission.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('CommissionService', () => {
  let commissionService: CommissionService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    order: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    promoter: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    commission: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    withdrawal: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn((fn) => fn(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommissionService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    commissionService = module.get<CommissionService>(CommissionService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('calculateAndCreate', () => {
    it('should create commission for eligible order', async () => {
      const mockOrder = {
        id: 'o1',
        totalAmount: 10000,
        originalAmount: 11000,
        userId: 'user1',
        items: [{ price: 10000, quantity: 1 }],
        user: { promoterCode: 'ABC123' },
      };
      const mockPromoter = { id: 'p1', userId: 'user2', balance: 0, totalCommission: 0 };
      const mockCommission = { id: 'c1', orderId: 'o1', promoterId: 'p1', amount: 100, status: 'PENDING' };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.user.findUnique.mockResolvedValue(mockPromoter);
      mockPrismaService.promoter.findUnique.mockResolvedValue(mockPromoter);
      mockPrismaService.commission.create.mockResolvedValue(mockCommission);

      const result = await commissionService.calculateAndCreate('o1');

      expect(result).toBeDefined();
      expect(mockPrismaService.commission.create).toHaveBeenCalled();
    });

    it('should return null if order has no promoter', async () => {
      const mockOrder = {
        id: 'o1',
        userId: 'user1',
        items: [],
        user: { promoterCode: null },
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      const result = await commissionService.calculateAndCreate('o1');

      expect(result).toBeNull();
    });

    it('should throw error if order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(commissionService.calculateAndCreate('nonexistent')).rejects.toThrow(BadRequestException);
    });
  });

  describe('settleCommission', () => {
    it('should settle commission successfully', async () => {
      const mockCommission = { id: 'c1', orderId: 'o1', promoterId: 'p1', amount: 100, status: 'PENDING' };
      const mockPromoter = { id: 'p1', balance: 0, totalCommission: 0 };

      mockPrismaService.commission.findUnique.mockResolvedValue(mockCommission);
      mockPrismaService.promoter.findUnique.mockResolvedValue(mockPromoter);
      mockPrismaService.commission.update.mockResolvedValue({ ...mockCommission, status: 'SETTLED' });
      mockPrismaService.promoter.update.mockResolvedValue({ ...mockPromoter, balance: 100 });

      const result = await commissionService.settleCommission('o1');

      expect(result).toEqual({ success: true });
    });

    it('should throw error if commission not found', async () => {
      mockPrismaService.commission.findUnique.mockResolvedValue(null);

      await expect(commissionService.settleCommission('nonexistent')).rejects.toThrow(BadRequestException);
    });

    it('should throw error if commission already settled', async () => {
      const mockCommission = { id: 'c1', status: 'SETTLED' };
      mockPrismaService.commission.findUnique.mockResolvedValue(mockCommission);

      await expect(commissionService.settleCommission('o1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('applyWithdraw', () => {
    it('should create withdrawal request', async () => {
      const mockPromoter = { id: 'p1', balance: 500, totalCommission: 1000 };
      const mockWithdrawal = { id: 'w1', promoterId: 'p1', amount: 200, status: 'PENDING' };

      mockPrismaService.promoter.findUnique.mockResolvedValue(mockPromoter);
      mockPrismaService.withdrawal.create.mockResolvedValue(mockWithdrawal);

      const result = await commissionService.applyWithdraw('p1', 200);

      expect(result).toEqual(mockWithdrawal);
    });

    it('should throw error if balance insufficient', async () => {
      const mockPromoter = { id: 'p1', balance: 100 };
      mockPrismaService.promoter.findUnique.mockResolvedValue(mockPromoter);

      await expect(commissionService.applyWithdraw('p1', 500)).rejects.toThrow(BadRequestException);
    });

    it('should auto-approve if amount less than 100', async () => {
      const mockPromoter = { id: 'p1', balance: 500 };
      const mockWithdrawal = { id: 'w1', promoterId: 'p1', amount: 50, status: 'APPROVED' };

      mockPrismaService.promoter.findUnique.mockResolvedValue(mockPromoter);
      mockPrismaService.withdrawal.create.mockResolvedValue(mockWithdrawal);

      const result = await commissionService.applyWithdraw('p1', 50);

      expect(result.status).toBe('APPROVED');
    });
  });

  describe('approveWithdrawal', () => {
    it('should approve withdrawal and deduct balance', async () => {
      const mockWithdrawal = { id: 'w1', promoterId: 'p1', amount: 200, status: 'PENDING' };
      const mockPromoter = { id: 'p1', balance: 500 };

      mockPrismaService.withdrawal.findUnique.mockResolvedValue(mockWithdrawal);
      mockPrismaService.promoter.findUnique.mockResolvedValue(mockPromoter);
      mockPrismaService.withdrawal.update.mockResolvedValue({ ...mockWithdrawal, status: 'APPROVED' });
      mockPrismaService.promoter.update.mockResolvedValue({ ...mockPromoter, balance: 300 });

      const result = await commissionService.approveWithdrawal('w1');

      expect(result).toEqual({ success: true });
    });
  });

  describe('rejectWithdrawal', () => {
    it('should reject withdrawal', async () => {
      const mockWithdrawal = { id: 'w1', promoterId: 'p1', amount: 200, status: 'PENDING' };

      mockPrismaService.withdrawal.findUnique.mockResolvedValue(mockWithdrawal);
      mockPrismaService.withdrawal.update.mockResolvedValue({ ...mockWithdrawal, status: 'REJECTED' });

      const result = await commissionService.rejectWithdrawal('w1', '不符合条件');

      expect(result.success).toBe(true);
    });
  });
});
