import React from 'react';
import { View, Text } from '@tarojs/components';
import { SupplierOrder } from '@/types';
import { maskName, maskPhone } from '@/utils/mask';
import styles from './index.module.scss';

interface OrderCardProps {
  order: SupplierOrder;
  showShippedInfo?: boolean;
  onClick?: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, showShippedInfo, onClick }) => (
  <View className={styles.card} onClick={onClick}>
    <View className={styles.header}>
      <Text className={styles.orderNo}>{order.orderNo}</Text>
      <Text className={styles.status}>
        {order.status === 'PENDING_SHIPMENT' ? '待发货' : '已发货'}
      </Text>
    </View>
    <Text className={styles.meta}>
      {showShippedInfo && order.shippedAt
        ? `发货时间：${order.shippedAt}`
        : `下单时间：${order.createdAt}`}
    </Text>
    <Text className={styles.meta}>商品总数：{order.itemCount}</Text>
    {!showShippedInfo && (
      <>
        <Text className={styles.receiver}>
          收货人：{maskName(order.receiver.name)} {maskPhone(order.receiver.phone)}
        </Text>
        <Text className={styles.address}>{order.receiver.address}</Text>
      </>
    )}
    {showShippedInfo && order.trackingNo && (
      <Text className={styles.meta}>快递单号：{order.trackingNo}</Text>
    )}
  </View>
);

export default OrderCard;
