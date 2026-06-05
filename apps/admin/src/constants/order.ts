import type { OrderStatus } from '../types';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: '待付款',
  PENDING_DISPATCH: '待派单',
  PENDING_SHIP: '待发货',
  PENDING_RECEIVE: '待收货',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  REFUNDED: '已退款',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'orange',
  PENDING_DISPATCH: 'blue',
  PENDING_SHIP: 'cyan',
  PENDING_RECEIVE: 'purple',
  COMPLETED: 'green',
  CANCELLED: 'red',
  REFUNDED: 'default',
};
