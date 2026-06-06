import React, { useState, useEffect } from 'react';
import { View, Text, Image, Input } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useCartStore } from '@/stores/cartStore';
import { useAddressStore } from '@/stores/addressStore';
import { useOrderStore } from '@/stores/orderStore';
import { formatPrice } from '@/utils/price';
import styles from './index.module.scss';

const CheckoutPage: React.FC = () => {
  const selectedItems = useCartStore((s) => s.getSelectedItems());
  const subtotal = useCartStore((s) => s.getSubtotal());
  const discount = useCartStore((s) => s.getDiscount());
  const total = useCartStore((s) => s.getTotal());
  const getDefault = useAddressStore((s) => s.getDefault);
  const createOrder = useOrderStore((s) => s.createOrder);
  const updateStatus = useOrderStore((s) => s.updateStatus);

  const [address, setAddress] = useState(getDefault());
  const [remark, setRemark] = useState('');

  useEffect(() => {
    setAddress(getDefault());
  }, [getDefault]);

  useDidShow(() => {
    setAddress(getDefault());
  });

  const handleSelectAddress = () => {
    Taro.navigateTo({ url: '/pages/address-list/index?from=checkout' });
  };

  const handlePay = () => {
    if (!address) {
      Taro.showToast({ title: '请选择收货地址', icon: 'none' });
      return;
    }
    if (selectedItems.length === 0) {
      Taro.showToast({ title: '没有可结算的商品', icon: 'none' });
      return;
    }

    const order = createOrder(selectedItems, address, remark);

    Taro.showLoading({ title: '支付中...' });
    setTimeout(() => {
      Taro.hideLoading();
      updateStatus(order.id, 'pending_dispatch');
      Taro.showToast({ title: '支付成功', icon: 'success' });
      setTimeout(() => {
        Taro.redirectTo({ url: `/pages/order-detail/index?id=${order.id}` });
      }, 1000);
    }, 1500);
  };

  return (
    <View className={styles.page}>
      <View className={styles.addressCard} onClick={handleSelectAddress}>
        {address ? (
          <View className={styles.addressInfo}>
            <Text className={styles.addressName}>{address.name} {address.phone}</Text>
            <Text className={styles.addressDetail}>
              {address.province}{address.city}{address.district}{address.detail}
            </Text>
          </View>
        ) : (
          <Text className={styles.addressName}>请选择收货地址</Text>
        )}
        <Text className={styles.addressArrow}>></Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>商品清单</Text>
        {selectedItems.map((item) => (
          <View key={item.id} className={styles.item}>
            <Image className={styles.itemImage} src={item.product.coverImage} mode="aspectFill" />
            <View className={styles.itemInfo}>
              <Text className={styles.itemName}>{item.product.name}</Text>
              <Text className={styles.itemPrice}>¥{formatPrice(item.product.price)} x{item.quantity}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>订单备注</Text>
        <Input
          className={styles.remarkInput}
          placeholder="选填，可备注配送要求"
          value={remark}
          onInput={(e) => setRemark(e.detail.value)}
        />
      </View>

      <View className={styles.section}>
        <View className={styles.feeRow}>
          <Text className={styles.feeLabel}>商品总额</Text>
          <Text className={styles.feeValue}>¥{formatPrice(subtotal)}</Text>
        </View>
        {discount > 0 && (
          <View className={styles.feeRow}>
            <Text className={styles.feeLabel}>满减优惠</Text>
            <Text className={`${styles.feeValue} ${styles.discountValue}`}>-¥{formatPrice(discount)}</Text>
          </View>
        )}
        <View className={styles.feeRow}>
          <Text className={styles.feeLabel}>运费</Text>
          <Text className={styles.feeValue}>免运费</Text>
        </View>
      </View>

      <View className={styles.footer}>
        <View>
          <Text className={styles.feeLabel}>实付：</Text>
          <Text className={styles.totalPrice}>¥{formatPrice(total)}</Text>
        </View>
        <View className={styles.payBtn} onClick={handlePay}>微信支付</View>
      </View>
    </View>
  );
};

export default CheckoutPage;
