import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter, usePullDownRefresh } from '@tarojs/taro';
import { OrderStatus } from '@/types';
import { useOrderStore } from '@/stores/orderStore';
import { formatPrice } from '@/utils/price';
import styles from './index.module.scss';
import classnames from 'classnames';

const statusMap: Record<OrderStatus, string> = {
  pending_payment: '待付款',
  pending_dispatch: '待派单',
  pending_shipment: '待发货',
  shipped: '待收货',
  completed: '已完成',
  cancelled: '已取消',
};

const TABS: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending_payment', label: '待付款' },
  { key: 'pending_dispatch', label: '待派单' },
  { key: 'shipped', label: '待收货' },
  { key: 'completed', label: '已完成' },
];

const OrderListPage: React.FC = () => {
  const { status: initStatus } = useRouter().params;
  const allOrders = useOrderStore((s) => s.orders);
  const updateStatus = useOrderStore((s) => s.updateStatus);
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>(
    (initStatus as OrderStatus) || 'all'
  );
  const [refreshing, setRefreshing] = useState(false);

  const orders = activeTab === 'all'
    ? allOrders
    : allOrders.filter((o) => o.status === activeTab);

  usePullDownRefresh(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 800);
  });

  const handleDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/order-detail/index?id=${id}` });
  };

  const handlePay = (e: any, id: string) => {
    e.stopPropagation();
    Taro.showLoading({ title: '支付中...' });
    setTimeout(() => {
      Taro.hideLoading();
      updateStatus(id, 'shipped');
      Taro.showToast({ title: '支付成功', icon: 'success' });
    }, 1000);
  };

  const handleCancel = (e: any, id: string) => {
    e.stopPropagation();
    Taro.showModal({
      title: '取消订单',
      content: '确定取消该订单吗？',
      success: (res) => {
        if (res.confirm) {
          updateStatus(id, 'cancelled');
          Taro.showToast({ title: '已取消', icon: 'success' });
        }
      },
    });
  };

  return (
    <View className={styles.page}>
      <ScrollView scrollX className={styles.tabBar}>
        {TABS.map((tab) => (
          <View
            key={tab.key}
            className={classnames(styles.tabItem, activeTab === tab.key && styles.tabActive)}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </View>
        ))}
      </ScrollView>

      {orders.length === 0 ? (
        <View className={styles.empty}>
          <Text className={styles.emptyText}>{refreshing ? '刷新中...' : '暂无订单'}</Text>
        </View>
      ) : (
        <ScrollView scrollY className={styles.orderList}>
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
                {order.status === 'pending_payment' && (
                  <>
                    <View className={styles.actionBtn} onClick={(e) => handleCancel(e, order.id)}>取消</View>
                    <View className={classnames(styles.actionBtn, styles.actionBtnPrimary)} onClick={(e) => handlePay(e, order.id)}>继续支付</View>
                  </>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default OrderListPage;
