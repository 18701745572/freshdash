import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Input, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Product } from '@/types';
import { searchProducts } from '@/services';
import { formatPrice } from '@/utils/price';
import styles from './index.module.scss';

const HISTORY_KEY = 'search_history';

const SearchPage: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const saved = Taro.getStorageSync(HISTORY_KEY) || [];
    setHistory(saved);
  }, []);

  const doSearch = useCallback((kw: string) => {
    const trimmed = kw.trim();
    if (!trimmed) {
      setResults([]);
      setSearched(false);
      return;
    }
    const found = searchProducts(trimmed);
    setResults(found);
    setSearched(true);

    const newHistory = [trimmed, ...history.filter((h) => h !== trimmed)].slice(0, 10);
    setHistory(newHistory);
    Taro.setStorageSync(HISTORY_KEY, newHistory);
  }, [history]);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(keyword), 300);
    return () => clearTimeout(timer);
  }, [keyword, doSearch]);

  const handleClearHistory = () => {
    setHistory([]);
    Taro.removeStorageSync(HISTORY_KEY);
  };

  const handleProductClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/product-detail/index?id=${id}` });
  };

  return (
    <View className={styles.page}>
      <View className={styles.searchBar}>
        <Input
          className={styles.searchInput}
          placeholder="搜索新鲜好物"
          focus
          value={keyword}
          onInput={(e) => setKeyword(e.detail.value)}
        />
        <Text className={styles.cancelBtn} onClick={() => Taro.navigateBack()}>取消</Text>
      </View>

      {!searched && history.length > 0 && (
        <View className={styles.historySection}>
          <View className={styles.historyHeader}>
            <Text className={styles.historyTitle}>搜索历史</Text>
            <Text className={styles.clearBtn} onClick={handleClearHistory}>清空</Text>
          </View>
          <View className={styles.historyTags}>
            {history.map((h) => (
              <Text key={h} className={styles.historyTag} onClick={() => setKeyword(h)}>{h}</Text>
            ))}
          </View>
        </View>
      )}

      {searched && results.length === 0 && (
        <View className={styles.empty}>
          <Text className={styles.emptyText}>未找到相关商品</Text>
        </View>
      )}

      {results.length > 0 && (
        <ScrollView scrollY className={styles.resultList}>
          {results.map((product) => (
            <View key={product.id} className={styles.resultItem} onClick={() => handleProductClick(product.id)}>
              <Image className={styles.resultImage} src={product.coverImage} mode="aspectFill" />
              <View className={styles.resultInfo}>
                <Text className={styles.resultName}>{product.name}</Text>
                <Text className={styles.resultPrice}>¥{formatPrice(product.price)}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default SearchPage;
