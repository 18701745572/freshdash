import { CommissionRecord, PromoterStats } from '@/types';

export const MOCK_PROMOTER_CODE = 'FRESH2024';

export const mockPromoterStats: PromoterStats = {
  totalCommission: 12580,
  settledAmount: 8000,
  pendingAmount: 4580,
  referralCount: 23,
  orderCount: 45,
};

export const mockCommissionRecords: CommissionRecord[] = [
  { id: '1', name: '订单佣金', time: '2024-06-04 12:30', amount: 350 },
  { id: '2', name: '订单佣金', time: '2024-06-03 10:15', amount: 280 },
  { id: '3', name: '订单佣金', time: '2024-06-02 18:45', amount: 520 },
];
