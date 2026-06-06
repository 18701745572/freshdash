import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { OrderStatus } from '@/types';
import { useOrderStore } from '@/stores/orderStore';
import { formatPrice } from '@/utils/price';
import styles from './index.module.scss';
import classnames from 'classnames';

const statusMap: Record<OrderStatus, { text: string; desc: string }> = {
  pending_payment: { text: '待付款', desc: '请在30分钟内完成支付' },
  pending_dispatch: { text: '待派单', desc: '商家正在为您安排发货' },
  pending_shipment: { text: '待发货', desc: '商家正在备货中' },
  shipped: { text: '待收货', desc: '商品正在配送中' },
  completed: { text: '已完成', desc: '感谢您的购买' },
  cancelled: { text: '已取消', desc: '订单已取消' },
};

const OrderDetailPage: React.FC = () => {
  const { id } = useRouter().params;
  const order = useOrderStore((s) => s.getById(id || ''));
  const updateStatus = useOrderStore((s) => s.updateStatus);

  if (!order) {
    return (
      <View className={styles.page}>
        <Text>订单不存在</Text>
      </View>
    );
  }

  const statusInfo = statusMap[order.status];

  const handlePay = () => {
    Taro.showLoading({ title: '支付中...' });
    setTimeout(() => {
      Taro.hideLoading();
      updateStatus(order.id, 'shipped');
      Taro.showToast({ title: '支付成功', icon: 'success' });
    }, 1000);
  };

  const handleCancel = () => {
    Taro.showModal({
      title: '取消订单',
      content: '确定取消该订单吗？',
      success: (res) => {
        if (res.confirm) {
          updateStatus(order.id, 'cancelled');
          Taro.showToast({ title: '已取消', icon: 'success' });
        }
      },
    });
  };

  const handleConfirm = () => {
    Taro.showModal({
      title: '确认收货',
      content: '确认已收到商品？',
      success: (res) => {
        if (res.confirm) {
          updateStatus(order.id, 'completed');
          Taro.showToast({ title: '收货成功', icon: 'success' });
        }
      },
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.statusBar}>
        <Text className={styles.statusText}>{statusInfo.text}</Text>
        <Text className={styles.statusDesc}>{statusInfo.desc}</Text>
      </View>

      {order.address && (
        <View className={styles.card}>
          <Text className={styles.cardTitle}>收货地址</Text>
          <Text className={styles.value}>{order.address.name} {order.address.phone}</Text>
          <Text className={styles.label}>
            {order.address.province}{order.address.city}{order.address.district}{order.address.detail}
          </Text>
        </View>
      )}

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
        {order.discountAmount && order.discountAmount > 0 && (
          <View className={styles.row}>
            <Text className={styles.label}>满减优惠</Text>
            <Text className={styles.value}>-¥{formatPrice(order.discountAmount)}</Text>
          </View>
        )}
        <View className={styles.totalRow}>
          <Text className={styles.label}>实付金额</Text>
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
        {order.remark && (
          <View className={styles.row}>
            <Text className={styles.label}>备注</Text>
            <Text className={styles.value}>{order.remark}</Text>
          </View>
        )}
      </View>

      <View className={styles.actionBar}>
        {order.status === 'pending_payment' && (
          <>
            <View className={styles.actionBtn} onClick={handleCancel}>取消订单</View>
            <View className={classnames(styles.actionBtn, styles.actionBtnPrimary)} onClick={handlePay}>继续支付</View>
          </>
        )}
        {order.status === 'shipped' && (
          <View className={classnames(styles.actionBtn, styles.actionBtnPrimary)} onClick={handleConfirm}>确认收货</View>
        )}
      </View>
    </View>
  );
};

export default OrderDetailPage;
