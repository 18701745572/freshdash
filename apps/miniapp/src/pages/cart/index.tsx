import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { mockProducts } from '@/data/products';
import styles from './index.module.scss';
import classnames from 'classnames';

const CartPage: React.FC = () => {
  const [items, setItems] = useState(
    mockProducts.slice(0, 3).map((p) => ({
      id: `cart-${p.id}`,
      product: p,
      quantity: 1,
      selected: true,
    }))
  );

  const toggleSelect = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const changeQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const selectedItems = items.filter((i) => i.selected);
  const totalPrice = selectedItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const formatPrice = (price: number) => (price / 100).toFixed(2);

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      Taro.showToast({ title: '请选择商品', icon: 'none' });
      return;
    }
    Taro.navigateTo({ url: '/pages/order-list/index' });
  };

  if (items.length === 0) {
    return (
      <View className={styles.empty}>
        <Text className={styles.emptyText}>购物车是空的，去逛逛吧~</Text>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <ScrollView scrollY>
        {items.map((item) => (
          <View key={item.id} className={styles.cartItem}>
            <View
              className={classnames(styles.checkbox, item.selected && styles.checkboxChecked)}
              onClick={() => toggleSelect(item.id)}
            >
              {item.selected && <Text style={{ color: '#fff', fontSize: '24rpx' }}>✓</Text>}
            </View>
            <Image className={styles.itemImage} src={item.product.coverImage} mode="aspectFill" />
            <View className={styles.itemInfo}>
              <Text className={styles.itemName}>{item.product.name}</Text>
              <Text className={styles.itemPrice}>¥{formatPrice(item.product.price)}</Text>
              <View className={styles.quantityControl}>
                <View className={styles.qtyBtn} onClick={() => changeQty(item.id, -1)}>-</View>
                <Text className={styles.qtyValue}>{item.quantity}</Text>
                <View className={styles.qtyBtn} onClick={() => changeQty(item.id, 1)}>+</View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View className={styles.footer}>
        <View className={styles.totalSection}>
          <Text className={styles.totalLabel}>合计：</Text>
          <Text className={styles.totalPrice}>¥{formatPrice(totalPrice)}</Text>
        </View>
        <View className={styles.submitBtn} onClick={handleCheckout}>
          去结算({selectedItems.length})
        </View>
      </View>
    </View>
  );
};

export default CartPage;
