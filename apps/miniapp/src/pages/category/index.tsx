import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { mockCategoryTree, getProductsByCategory } from '@/services';
import { formatPrice } from '@/utils/price';
import styles from './index.module.scss';
import classnames from 'classnames';

const CategoryPage: React.FC = () => {
  const [activeId, setActiveId] = useState(mockCategoryTree[0]?.id);
  const activeCategory = mockCategoryTree.find((c) => c.id === activeId);
  const products = getProductsByCategory(activeId);

  useDidShow(() => {
    const savedId = Taro.getStorageSync('active_category_id');
    if (savedId) {
      setActiveId(savedId);
      Taro.removeStorageSync('active_category_id');
    }
  });

  useEffect(() => {
    if (!activeId && mockCategoryTree[0]) {
      setActiveId(mockCategoryTree[0].id);
    }
  }, [activeId]);

  const handleProductClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/product-detail/index?id=${id}` });
  };

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.sidebar}>
        {mockCategoryTree.map((cat) => (
          <View
            key={cat.id}
            className={classnames(styles.sidebarItem, activeId === cat.id && styles.sidebarItemActive)}
            onClick={() => setActiveId(cat.id)}
          >
            <Text>{cat.name}</Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView scrollY className={styles.content}>
        <Text className={styles.contentTitle}>{activeCategory?.name}</Text>
        <View className={styles.productGrid}>
          {products.length > 0 ? products.map((product) => (
            <View key={product.id} className={styles.productItem} onClick={() => handleProductClick(product.id)}>
              <Image className={styles.productImage} src={product.coverImage} mode="aspectFill" />
              <Text className={styles.productName}>{product.name}</Text>
              <Text className={styles.productPrice}>¥{formatPrice(product.price)}</Text>
            </View>
          )) : (
            <Text className={styles.emptyText}>该分类暂无商品</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default CategoryPage;
