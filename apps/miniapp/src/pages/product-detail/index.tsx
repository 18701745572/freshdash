import React, { useState, useEffect } from 'react';
import { View, Text, Swiper, SwiperItem, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { mockProducts } from '@/data/products';
import styles from './index.module.scss';

const ProductDetailPage: React.FC = () => {
  const { id } = useRouter().params;
  const [product] = useState(mockProducts.find((p) => p.id === id) || mockProducts[0]);

  useEffect(() => {
    console.log('[ProductDetail] id=', id);
  }, [id]);

  const formatPrice = (price: number) => (price / 100).toFixed(2);

  const handleAddCart = () => {
    Taro.showToast({ title: '已加入购物车', icon: 'success' });
  };

  const handleBuy = () => {
    Taro.navigateTo({ url: '/pages/order-list/index' });
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
