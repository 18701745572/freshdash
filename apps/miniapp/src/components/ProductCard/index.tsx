import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import { Product } from '@/types';
import styles from './index.module.scss';

interface Props {
  product: Product;
  onClick?: () => void;
}

const ProductCard: React.FC<Props> = ({ product, onClick }) => {
  const formatPrice = (price: number) => (price / 100).toFixed(2);

  return (
    <View className={styles.card} onClick={onClick}>
      <Image className={styles.image} src={product.coverImage} mode="aspectFill" />
      <View className={styles.info}>
        <Text className={styles.name}>{product.name}</Text>
        <View className={styles.tags}>
          {product.tags.map((tag) => (
            <Text key={tag} className={styles.tag}>{tag}</Text>
          ))}
        </View>
        <View className={styles.priceRow}>
          <Text className={styles.price}>¥{formatPrice(product.price)}</Text>
          {product.originalPrice && (
            <Text className={styles.originalPrice}>¥{formatPrice(product.originalPrice)}</Text>
          )}
          <Text className={styles.unit}>/{product.unit}</Text>
        </View>
      </View>
    </View>
  );
};

export default ProductCard;
