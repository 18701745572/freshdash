import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

const PromoterPosterPage: React.FC = () => {
  const handleSave = () => {
    Taro.showToast({ title: '海报保存成功', icon: 'success' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.poster}>
        <Text className={styles.logo}>鲜达生鲜</Text>
        <Text className={styles.slogan}>新鲜直达，品质生活</Text>
        <View className={styles.qrPlaceholder}>二维码区域</View>
        <Text className={styles.codeText}>推广码：FRESH2024</Text>
        <Text className={styles.tip}>长按识别小程序，开启生鲜之旅</Text>
      </View>
      <View className={styles.saveBtn} onClick={handleSave}>保存海报到相册</View>
    </View>
  );
};

export default PromoterPosterPage;
