import React, { useCallback, useState } from 'react';
import { View } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import OrderCard from '@/components/OrderCard';
import EmptyState from '@/components/EmptyState';
import { supplierService } from '@/services';
import { SupplierOrder } from '@/types';
import { requireAuth } from '@/utils/auth';
import styles from './index.module.scss';

const HistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const orderList = await supplierService.fetchShippedOrders();
      setOrders(orderList);
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
      <View className={styles.list}>
        {!loading && orders.length === 0 ? (
          <EmptyState text="暂无已发货订单" icon="🚚" />
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              showShippedInfo
              onClick={() => handleDetail(order.id)}
            />
          ))
        )}
      </View>
    </View>
  );
};

export default HistoryPage;
