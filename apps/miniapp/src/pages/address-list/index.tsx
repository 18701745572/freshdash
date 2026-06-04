import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Address } from '@/types';
import styles from './index.module.scss';

const mockAddresses: Address[] = [
  {
    id: '1', name: '张三', phone: '13800138000',
    province: '广东省', city: '深圳市', district: '南山区',
    detail: '科技园南路88号', isDefault: true,
  },
  {
    id: '2', name: '李四', phone: '13900139000',
    province: '广东省', city: '深圳市', district: '福田区',
    detail: '中心区一路100号', isDefault: false,
  },
];

const AddressListPage: React.FC = () => {
  const [addresses] = useState(mockAddresses);

  const handleAdd = () => {
    Taro.navigateTo({ url: '/pages/address-edit/index' });
  };

  return (
    <View className={styles.page}>
      {addresses.map((addr) => (
        <View key={addr.id} className={styles.addressCard}>
          <View className={styles.header}>
            <Text className={styles.name}>{addr.name}</Text>
            <Text className={styles.phone}>{addr.phone}</Text>
            {addr.isDefault && <Text className={styles.defaultTag}>默认</Text>}
          </View>
          <Text className={styles.detail}>{addr.province}{addr.city}{addr.district}{addr.detail}</Text>
          <View className={styles.actions}>
            <Text className={styles.action}>编辑</Text>
            <Text className={styles.action}>删除</Text>
          </View>
        </View>
      ))}
      <View className={styles.addBtn} onClick={handleAdd}>+ 新建收货地址</View>
    </View>
  );
};

export default AddressListPage;
