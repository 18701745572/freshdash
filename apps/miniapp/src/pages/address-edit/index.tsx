import React, { useState, useEffect } from 'react';
import { View, Text, Input, Switch } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useAddressStore } from '@/stores/addressStore';
import styles from './index.module.scss';

const AddressEditPage: React.FC = () => {
  const { id } = useRouter().params;
  const getById = useAddressStore((s) => s.getById);
  const addAddress = useAddressStore((s) => s.addAddress);
  const updateAddress = useAddressStore((s) => s.updateAddress);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState('广东省');
  const [city, setCity] = useState('深圳市');
  const [district, setDistrict] = useState('南山区');
  const [detail, setDetail] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (id) {
      const addr = getById(id);
      if (addr) {
        setName(addr.name);
        setPhone(addr.phone);
        setProvince(addr.province);
        setCity(addr.city);
        setDistrict(addr.district);
        setDetail(addr.detail);
        setIsDefault(addr.isDefault);
      }
    }
  }, [id, getById]);

  const handleSave = () => {
    if (!name.trim()) {
      Taro.showToast({ title: '请输入收货人', icon: 'none' });
      return;
    }
    if (!/^1\d{10}$/.test(phone)) {
      Taro.showToast({ title: '请输入正确手机号', icon: 'none' });
      return;
    }
    if (!detail.trim()) {
      Taro.showToast({ title: '请输入详细地址', icon: 'none' });
      return;
    }

    const data = { name, phone, province, city, district, detail, isDefault };
    if (id) {
      updateAddress(id, data);
    } else {
      addAddress(data);
    }
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
        <Input className={styles.input} placeholder="请输入手机号" type="number" maxlength={11} value={phone} onInput={(e) => setPhone(e.detail.value)} />
      </View>
      <View className={styles.formItem}>
        <Text className={styles.label}>省市区</Text>
        <Input className={styles.input} placeholder="省" value={province} onInput={(e) => setProvince(e.detail.value)} />
      </View>
      <View className={styles.formItem}>
        <Text className={styles.label}></Text>
        <Input className={styles.input} placeholder="市" value={city} onInput={(e) => setCity(e.detail.value)} />
      </View>
      <View className={styles.formItem}>
        <Text className={styles.label}></Text>
        <Input className={styles.input} placeholder="区" value={district} onInput={(e) => setDistrict(e.detail.value)} />
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
