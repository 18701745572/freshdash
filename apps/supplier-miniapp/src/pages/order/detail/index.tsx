import React, { useCallback, useState } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro, { useDidShow, useRouter } from '@tarojs/taro';
import { supplierService } from '@/services';
import { SupplierOrder } from '@/types';
import { requireAuth } from '@/utils/auth';
import styles from './index.module.scss';

const OrderDetailPage: React.FC = () => {
  const { id } = useRouter().params;
  const [order, setOrder] = useState<SupplierOrder | null>(null);
  const [trackingNo, setTrackingNo] = useState('');
  const [loading, setLoading] = useState(true);
  const [shipping, setShipping] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await supplierService.fetchOrderDetail(id);
      if (!data) {
        Taro.showToast({ title: '订单不存在', icon: 'none' });
        return;
      }
      setOrder(data);
      setTrackingNo(data.trackingNo || '');
    } catch (err) {
      Taro.showToast({
        title: err instanceof Error ? err.message : '加载失败',
        icon: 'none',
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useDidShow(() => {
    if (requireAuth()) {
      loadOrder();
    }
  });

  const handleShip = () => {
    if (!order || order.status !== 'PENDING_SHIPMENT') return;

    Taro.showModal({
      title: '确认发货',
      content: '确认该订单已发货？',
      success: async (res) => {
        if (!res.confirm) return;
        setShipping(true);
        try {
          await supplierService.shipOrder(order.id, { trackingNo: trackingNo.trim() || undefined });
          Taro.showToast({ title: '发货成功', icon: 'success' });
          setTimeout(() => {
            Taro.navigateBack();
          }, 800);
        } catch (err) {
          Taro.showToast({
            title: err instanceof Error ? err.message : '发货失败',
            icon: 'none',
          });
        } finally {
          setShipping(false);
        }
      },
    });
  };

  if (loading) {
    return (
      <View className={styles.page}>
        <Text className={styles.loading}>加载中...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View className={styles.page}>
        <Text className={styles.loading}>订单不存在</Text>
      </View>
    );
  }

  const isPending = order.status === 'PENDING_SHIPMENT';

  return (
    <View className={styles.page}>
      <View className={styles.card}>
        <Text className={styles.title}>订单信息</Text>
        <Text className={styles.row}>订单号：{order.orderNo}</Text>
        <Text className={styles.row}>下单时间：{order.createdAt}</Text>
        <Text className={`${styles.row} ${styles.status}`}>
          状态：{isPending ? '待发货' : '已发货'}
        </Text>
        {order.shippedAt && <Text className={styles.row}>发货时间：{order.shippedAt}</Text>}
      </View>

      <View className={styles.card}>
        <Text className={styles.title}>商品清单</Text>
        {order.items.map((item) => (
          <View key={item.id} className={styles.item}>
            <Text className={styles.itemName}>{item.name}</Text>
            <Text className={styles.itemMeta}>
              {item.spec ? `${item.spec} · ` : ''}¥{item.unitPrice} x{item.quantity}
            </Text>
          </View>
        ))}
      </View>

      <View className={styles.card}>
        <Text className={styles.title}>收货地址</Text>
        <Text className={styles.row}>
          {order.receiver.name} {order.receiver.phone}
        </Text>
        <Text className={styles.row}>{order.receiver.address}</Text>
      </View>

      {order.remark && (
        <View className={styles.card}>
          <Text className={styles.title}>订单备注</Text>
          <Text className={styles.remark}>{order.remark}</Text>
        </View>
      )}

      {isPending && (
        <View className={styles.shipBar}>
          <Input
            className={styles.trackingInput}
            placeholder="快递单号（选填）"
            value={trackingNo}
            onInput={(e) => setTrackingNo(e.detail.value)}
          />
          <View
            className={styles.shipButton}
            onClick={shipping ? undefined : handleShip}
          >
            <Text className={styles.shipButtonText}>
              {shipping ? '提交中...' : '确认发货'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default OrderDetailPage;
