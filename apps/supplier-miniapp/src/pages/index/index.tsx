import React, { useCallback, useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import OrderCard from '@/components/OrderCard';
import EmptyState from '@/components/EmptyState';
import { supplierService } from '@/services';
import { SupplierOrder, SupplierStats } from '@/types';
import { requireAuth } from '@/utils/auth';
import styles from './index.module.scss';

const IndexPage: React.FC = () => {
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [stats, setStats] = useState<SupplierStats>({ todayPending: 0, totalShipped: 0 });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [orderList, statsData] = await Promise.all([
        supplierService.fetchPendingOrders(),
        supplierService.fetchStats(),
      ]);
      setOrders(orderList);
      setStats(statsData);
    } catch (err) {
      Taro.showToast({
        title: err instanceof Error ? err.message : '加载失败',
        icon: 'none',
      });
    } finally {
      setLoading(false);
      Taro.stopPullDownRefresh();
    }
  }, []);

  useDidShow(() => {
    if (requireAuth()) {
      loadData();
    }
  });

  usePullDownRefresh(() => {
    loadData();
  });

  const handleDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/order/detail/index?id=${id}` });
  };

  return (
    <View className={styles.page}>
      <View className={styles.stats}>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{stats.todayPending}</Text>
          <Text className={styles.statLabel}>今日待发货</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{stats.totalShipped}</Text>
          <Text className={styles.statLabel}>累计已发货</Text>
        </View>
      </View>

      <View className={styles.list}>
        {!loading && orders.length === 0 ? (
          <EmptyState text="暂无待发货订单，休息一下吧" />
        ) : (
          orders.map((order) => (
            <OrderCard key={order.id} order={order} onClick={() => handleDetail(order.id)} />
          ))
        )}
      </View>
    </View>
  );
};

export default IndexPage;
