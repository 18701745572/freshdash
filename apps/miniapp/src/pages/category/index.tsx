import React, { useState } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { mockCategoryTree } from '@/data/categories';
import { mockProducts } from '@/data/products';
import styles from './index.module.scss';
import classnames from 'classnames';

const CategoryPage: React.FC = () => {
  const [activeId, setActiveId] = useState(mockCategoryTree[0]?.id);
  const activeCategory = mockCategoryTree.find((c) => c.id === activeId);

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
          {mockProducts.slice(0, 6).map((product) => (
            <View key={product.id} className={styles.productItem} onClick={() => handleProductClick(product.id)}>
              <Image className={styles.productImage} src={product.coverImage} mode="aspectFill" />
              <Text className={styles.productName}>{product.name}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default CategoryPage;
