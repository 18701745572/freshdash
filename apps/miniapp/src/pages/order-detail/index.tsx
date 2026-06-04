import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import { useRouter } from '@tarojs/taro';
import { Order, OrderStatus } from '@/types';
import styles from './index.module.scss';

const statusMap: Record<OrderStatus, { text: string; desc: string }> = {
  pending_payment: { text: '待付款', desc: '请在30分钟内完成支付' },
  pending_dispatch: { text: '待派单', desc: '商家正在为您安排发货' },
  pending_shipment: { text: '待发货', desc: '商家正在备货中' },
  shipped: { text: '待收货', desc: '商品正在配送中' },
  completed: { text: '已完成', desc: '感谢您的购买' },
  cancelled: { text: '已取消', desc: '订单已取消' },
};

const mockOrders: Order[] = [
  {
    id: '1', orderNo: 'XD20240604001', status: 'pending_payment',
    totalAmount: 4880, items: [
      { id: 'i1', productName: '烟台红富士苹果', productImage: 'https://picsum.photos/id/292/300/300', price: 1990, quantity: 1 },
      { id: 'i2', productName: '鲜活基围虾', productImage: 'https://picsum.photos/id/431/300/300', price: 3990, quantity: 1 },
    ],
    createdAt: '2024-06-04 10:30',
  },
];

const OrderDetailPage: React.FC = () => {
  const { id } = useRouter().params;
  const [order] = useState(mockOrders.find((o) => o.id === id) || mockOrders[0]);
  const statusInfo = statusMap[order.status];
  const formatPrice = (price: number) => (price / 100).toFixed(2);

  return (
    <View className={styles.page}>
      <View className={styles.statusBar}>
        <Text className={styles.statusText}>{statusInfo.text}</Text>
        <Text className={styles.statusDesc}>{statusInfo.desc}</Text>
      </View>

      <View className={styles.card}>
        <Text className={styles.cardTitle}>商品信息</Text>
        {order.items.map((item) => (
          <View key={item.id} className={styles.item}>
            <Image className={styles.itemImage} src={item.productImage} mode="aspectFill" />
            <View className={styles.itemInfo}>
              <Text className={styles.itemName}>{item.productName}</Text>
              <Text className={styles.itemPrice}>¥{formatPrice(item.price)} x{item.quantity}</Text>
            </View>
          </View>
        ))}
        <View className={styles.totalRow}>
          <Text className={styles.label}>商品总额</Text>
          <Text className={styles.totalValue}>¥{formatPrice(order.totalAmount)}</Text>
        </View>
      </View>

      <View className={styles.card}>
        <Text className={styles.cardTitle}>订单信息</Text>
        <View className={styles.row}>
          <Text className={styles.label}>订单编号</Text>
          <Text className={styles.value}>{order.orderNo}</Text>
        </View>
        <View className={styles.row}>
          <Text className={styles.label}>下单时间</Text>
          <Text className={styles.value}>{order.createdAt}</Text>
        </View>
      </View>
    </View>
  );
};

export default OrderDetailPage;
