import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import BannerSwiper from '@/components/BannerSwiper';
import ProductCard from '@/components/ProductCard';
import { mockBanners } from '@/data/banners';
import { mockCategories } from '@/data/categories';
import { mockProducts, mockSeckillProducts } from '@/data/products';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const [products] = useState(mockProducts);
  const [seckillProducts] = useState(mockSeckillProducts);

  useEffect(() => {
    console.log('[Home] page mounted');
  }, []);

  const handleProductClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/product-detail/index?id=${id}` });
  };

  const formatPrice = (price: number) => (price / 100).toFixed(2);

  return (
    <ScrollView scrollY className={styles.page}>
      {/* 搜索栏 */}
      <View className={styles.searchBar}>
        <Text className={styles.searchIcon}>🔍</Text>
        <Text className={styles.searchText}>搜索新鲜好物</Text>
      </View>

      {/* Banner 轮播 */}
      <BannerSwiper banners={mockBanners} />

      {/* 分类快捷入口 */}
      <View className={styles.categoryGrid}>
        {mockCategories.map((cat) => (
          <View key={cat.id} className={styles.categoryItem}>
            <Text className={styles.categoryIcon}>{cat.icon}</Text>
            <Text className={styles.categoryName}>{cat.name}</Text>
          </View>
        ))}
      </View>

      {/* 限时秒杀 */}
      <View className={styles.seckillSection}>
        <View className={styles.seckillHeader}>
          <Text className={styles.seckillTitle}>⚡ 限时秒杀</Text>
          <Text className={styles.seckillMore}>更多 ></Text>
        </View>
        <ScrollView scrollX className={styles.seckillList}>
          {seckillProducts.map((product) => (
            <View key={product.id} className={styles.seckillItem} onClick={() => handleProductClick(product.id)}>
              <Image className={styles.seckillImage} src={product.coverImage} mode="aspectFill" />
              <View className={styles.seckillName}>{product.name}</View>
              <View>
                <Text className={styles.seckillPrice}>¥{formatPrice(product.price)}</Text>
                <Text className={styles.seckillOriginal}>¥{formatPrice(product.originalPrice || 0)}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* 商品推荐 */}
      <View className={styles.recommendSection}>
        <Text className={styles.recommendHeader}>🌟 精选推荐</Text>
        <View className={styles.recommendGrid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onClick={() => handleProductClick(product.id)} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;
