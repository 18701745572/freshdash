import React, { useState } from 'react';
import { View, Text, Swiper, SwiperItem, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { getProductById } from '@/services';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/utils/price';
import styles from './index.module.scss';

const ProductDetailPage: React.FC = () => {
  const { id } = useRouter().params;
  const product = getProductById(id || '') || getProductById('1')!;
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);

  const handleAddCart = () => {
    addItem(product, quantity);
    Taro.showToast({ title: '已加入购物车', icon: 'success' });
  };

  const handleBuy = () => {
    addItem(product, quantity);
    Taro.switchTab({ url: '/pages/cart/index' });
  };

  return (
    <View className={styles.page}>
      <Swiper className={styles.swiper} indicatorDots indicatorColor="#999" indicatorActiveColor="#00b578">
        <SwiperItem>
          <Image className={styles.swiperImage} src={product.coverImage} mode="aspectFill" />
        </SwiperItem>
      </Swiper>

      <View className={styles.infoSection}>
        <View className={styles.priceRow}>
          <Text className={styles.price}>¥{formatPrice(product.price)}</Text>
          {product.originalPrice && (
            <Text className={styles.originalPrice}>¥{formatPrice(product.originalPrice)}</Text>
          )}
        </View>
        <Text className={styles.name}>{product.name}</Text>
        <View className={styles.tags}>
          {product.tags.map((tag) => (
            <Text key={tag} className={styles.tag}>{tag}</Text>
          ))}
        </View>
      </View>

      <View className={styles.specSection}>
        <View className={styles.specRow}>
          <Text className={styles.specLabel}>规格</Text>
          <Text>{product.unit}</Text>
        </View>
        <View className={styles.specRow}>
          <Text className={styles.specLabel}>数量</Text>
          <View className={styles.quantityControl}>
            <View className={styles.qtyBtn} onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</View>
            <Text className={styles.qtyValue}>{quantity}</Text>
            <View className={styles.qtyBtn} onClick={() => setQuantity(quantity + 1)}>+</View>
          </View>
        </View>
      </View>

      <View className={styles.descSection}>
        <Text className={styles.descTitle}>商品介绍</Text>
        <Text className={styles.descContent}>
          {product.name}，精选优质产地，新鲜直达。{product.unit}装，品质保证，售后无忧。
        </Text>
      </View>

      <View className={styles.footer}>
        <View className={styles.cartBtn} onClick={handleAddCart}>加入购物车</View>
        <View className={styles.buyBtn} onClick={handleBuy}>立即购买</View>
      </View>
    </View>
  );
};

export default ProductDetailPage;
