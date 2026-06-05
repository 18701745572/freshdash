import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

const FarmPage: React.FC = () => {
  const handleNotify = () => {
    Taro.showToast({ title: '已登记，上线后通知您', icon: 'success' });
  };

  return (
    <View className={styles.page}>
      <Image
        className={styles.image}
        src="https://picsum.photos/id/1080/750/400"
        mode="aspectFill"
      />
      <Text className={styles.title}>认养一块菜地</Text>
      <Text className={styles.desc}>
        远程认养有机菜地，实时查看生长过程，{'\n'}
        成熟后新鲜配送到家。{'\n'}
        功能即将上线，敬请期待！
      </Text>
      <View className={styles.notifyBtn} onClick={handleNotify}>通知我</View>
      <Text className={styles.badge}>Demo / MVP 占位页</Text>
    </View>
  );
};

export default FarmPage;
