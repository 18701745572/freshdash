import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { Order, OrderStatus } from '@/types';
import styles from './index.module.scss';

const statusMap: Record<OrderStatus, string> = {
  pending_payment: '待付款',
  pending_dispatch: '待派单',
  pending_shipment: '待发货',
  shipped: '待收货',
  completed: '已完成',
  cancelled: '已取消',
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
  {
    id: '2', orderNo: 'XD20240603002', status: 'shipped',
    totalAmount: 2990, items: [
      { id: 'i3', productName: '精品五花肉', productImage: 'https://picsum.photos/id/401/300/300', price: 2990, quantity: 1 },
    ],
    createdAt: '2024-06-03 15:20',
  },
];

const OrderListPage: React.FC = () => {
  const { status } = useRouter().params;
  const [orders] = useState(() =>
    status ? mockOrders.filter((o) => o.status === status) : mockOrders
  );

  const formatPrice = (price: number) => (price / 100).toFixed(2);

  const handleDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/order-detail/index?id=${id}` });
  };

  if (orders.length === 0) {
    return (
      <View className={styles.empty}>
        <Text className={styles.emptyText}>暂无订单</Text>
      </View>
    );
  }

  return (
    <ScrollView scrollY className={styles.page}>
      {orders.map((order) => (
        <View key={order.id} className={styles.orderCard} onClick={() => handleDetail(order.id)}>
          <View className={styles.orderHeader}>
            <Text className={styles.orderNo}>订单号：{order.orderNo}</Text>
            <Text className={styles.orderStatus}>{statusMap[order.status]}</Text>
          </View>
          {order.items.map((item) => (
            <View key={item.id} className={styles.orderItem}>
              <Image className={styles.orderItemImage} src={item.productImage} mode="aspectFill" />
              <View className={styles.orderItemInfo}>
                <Text className={styles.orderItemName}>{item.productName}</Text>
                <Text className={styles.orderItemPrice}>¥{formatPrice(item.price)} x{item.quantity}</Text>
              </View>
            </View>
          ))}
          <View className={styles.orderFooter}>
            <Text className={styles.totalLabel}>合计：</Text>
            <Text className={styles.totalPrice}>¥{formatPrice(order.totalAmount)}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default OrderListPage;
