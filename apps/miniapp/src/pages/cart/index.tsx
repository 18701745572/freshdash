import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/utils/price';
import styles from './index.module.scss';
import classnames from 'classnames';

const SWIPE_THRESHOLD = 60;

const CartPage: React.FC = () => {
  const items = useCartStore((s) => s.items);
  const toggleSelect = useCartStore((s) => s.toggleSelect);
  const toggleAll = useCartStore((s) => s.toggleAll);
  const changeQty = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const preview = useCartStore((s) => s.preview);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const discount = useCartStore((s) => s.getDiscount());
  const total = useCartStore((s) => s.getTotal());
  const isAllSelected = useCartStore((s) => s.isAllSelected());
  const getSelectedItems = useCartStore((s) => s.getSelectedItems);

  const [swipeOffset, setSwipeOffset] = useState<Record<string, number>>({});
  const [touchStartX, setTouchStartX] = useState(0);

  const selectedItems = getSelectedItems();

  const handleTouchStart = (id: string, e: any) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (id: string, e: any) => {
    const delta = e.touches[0].clientX - touchStartX;
    if (delta < 0) {
      setSwipeOffset((prev) => ({ ...prev, [id]: Math.max(delta, -120) }));
    } else {
      setSwipeOffset((prev) => ({ ...prev, [id]: 0 }));
    }
  };

  const handleTouchEnd = (id: string) => {
    const offset = swipeOffset[id] || 0;
    if (offset < -SWIPE_THRESHOLD) {
      setSwipeOffset((prev) => ({ ...prev, [id]: -120 }));
    } else {
      setSwipeOffset((prev) => ({ ...prev, [id]: 0 }));
    }
  };

  const handleDelete = (id: string) => {
    removeItem(id);
    setSwipeOffset((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleCheckout = () => {
    const result = preview();
    if (!result.valid) {
      Taro.showToast({ title: result.message || '无法结算', icon: 'none' });
      return;
    }
    Taro.navigateTo({ url: '/pages/checkout/index' });
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
          <View key={item.id} className={styles.swipeWrapper}>
            <View
              className={styles.deleteBtn}
              onClick={() => handleDelete(item.id)}
            >
              删除
            </View>
            <View
              className={styles.cartItem}
              style={{ transform: `translateX(${swipeOffset[item.id] || 0}px)` }}
              onTouchStart={(e) => handleTouchStart(item.id, e)}
              onTouchMove={(e) => handleTouchMove(item.id, e)}
              onTouchEnd={() => handleTouchEnd(item.id)}
            >
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
                  <View className={styles.qtyBtn} onClick={() => changeQty(item.id, item.quantity - 1)}>-</View>
                  <Text className={styles.qtyValue}>{item.quantity}</Text>
                  <View className={styles.qtyBtn} onClick={() => changeQty(item.id, item.quantity + 1)}>+</View>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {discount > 0 && (
        <View className={styles.discountBar}>
          已满50元，已减 ¥{formatPrice(discount)}
        </View>
      )}

      <View className={styles.footer}>
        <View
          className={classnames(styles.checkbox, isAllSelected && styles.checkboxChecked)}
          onClick={() => toggleAll(!isAllSelected)}
        >
          {isAllSelected && <Text style={{ color: '#fff', fontSize: '24rpx' }}>✓</Text>}
        </View>
        <Text className={styles.selectAllLabel} onClick={() => toggleAll(!isAllSelected)}>全选</Text>
        <View className={styles.totalSection}>
          <Text className={styles.totalLabel}>合计：</Text>
          <Text className={styles.totalPrice}>¥{formatPrice(total)}</Text>
          {discount > 0 && (
            <Text className={styles.subtotalHint}>已减¥{formatPrice(discount)}</Text>
          )}
        </View>
        <View className={styles.submitBtn} onClick={handleCheckout}>
          去结算({selectedItems.length})
        </View>
      </View>
    </View>
  );
};

export default CartPage;
