import React, { useState } from 'react';
import { View, Text, Input, Switch } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

const AddressEditPage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [detail, setDetail] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const handleSave = () => {
    Taro.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => Taro.navigateBack(), 1000);
  };

  return (
    <View className={styles.page}>
      <View className={styles.formItem}>
        <Text className={styles.label}>收货人</Text>
        <Input className={styles.input} placeholder="请输入姓名" value={name} onInput={(e) => setName(e.detail.value)} />
      </View>
      <View className={styles.formItem}>
        <Text className={styles.label}>手机号</Text>
        <Input className={styles.input} placeholder="请输入手机号" value={phone} onInput={(e) => setPhone(e.detail.value)} />
      </View>
      <View className={styles.formItem}>
        <Text className={styles.label}>详细地址</Text>
        <Input className={styles.input} placeholder="请输入详细地址" value={detail} onInput={(e) => setDetail(e.detail.value)} />
      </View>
      <View className={styles.switchRow}>
        <Text className={styles.label}>设为默认</Text>
        <Switch checked={isDefault} onChange={(e) => setIsDefault(e.detail.value)} />
      </View>
      <View className={styles.saveBtn} onClick={handleSave}>保存</View>
    </View>
  );
};

export default AddressEditPage;
