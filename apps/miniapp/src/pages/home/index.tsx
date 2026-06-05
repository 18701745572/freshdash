import React, { useState } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import BannerSwiper from '@/components/BannerSwiper';
import ProductCard from '@/components/ProductCard';
import { mockBanners, mockCategories, mockProducts, mockSeckillProducts } from '@/services';
import { formatPrice } from '@/utils/price';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const [products] = useState(mockProducts);
  const [seckillProducts] = useState(mockSeckillProducts);

  const handleProductClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/product-detail/index?id=${id}` });
  };

  const handleSearch = () => {
    Taro.navigateTo({ url: '/pages/search/index' });
  };

  const handleCategoryClick = (id: string) => {
    Taro.switchTab({ url: '/pages/category/index' });
    Taro.setStorageSync('active_category_id', id);
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.searchBar} onClick={handleSearch}>
        <Text className={styles.searchIcon}>🔍</Text>
        <Text className={styles.searchText}>搜索新鲜好物</Text>
      </View>

      <BannerSwiper banners={mockBanners} />

      <View className={styles.categoryGrid}>
        {mockCategories.map((cat) => (
          <View key={cat.id} className={styles.categoryItem} onClick={() => handleCategoryClick(cat.id)}>
            <Text className={styles.categoryIcon}>{cat.icon}</Text>
            <Text className={styles.categoryName}>{cat.name}</Text>
          </View>
        ))}
      </View>

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
