import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useAddressStore } from '@/stores/addressStore';
import styles from './index.module.scss';

const AddressListPage: React.FC = () => {
  const { from } = useRouter().params;
  const addresses = useAddressStore((s) => s.addresses);
  const deleteAddress = useAddressStore((s) => s.deleteAddress);
  const setDefault = useAddressStore((s) => s.setDefault);

  const handleAdd = () => {
    Taro.navigateTo({ url: '/pages/address-edit/index' });
  };

  const handleEdit = (id: string) => {
    Taro.navigateTo({ url: `/pages/address-edit/index?id=${id}` });
  };

  const handleDelete = (id: string) => {
    Taro.showModal({
      title: '删除地址',
      content: '确定删除该地址吗？',
      success: (res) => {
        if (res.confirm) {
          deleteAddress(id);
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      },
    });
  };

  const handleSelect = (id: string) => {
    if (from === 'checkout') {
      setDefault(id);
      Taro.navigateBack();
    }
  };

  return (
    <View className={styles.page}>
      {addresses.map((addr) => (
        <View
          key={addr.id}
          className={styles.addressCard}
          onClick={() => from === 'checkout' && handleSelect(addr.id)}
        >
          <View className={styles.header}>
            <Text className={styles.name}>{addr.name}</Text>
            <Text className={styles.phone}>{addr.phone}</Text>
            {addr.isDefault && <Text className={styles.defaultTag}>默认</Text>}
          </View>
          <Text className={styles.detail}>{addr.province}{addr.city}{addr.district}{addr.detail}</Text>
          <View className={styles.actions}>
            {!addr.isDefault && (
              <Text className={styles.action} onClick={(e) => { e.stopPropagation(); setDefault(addr.id); Taro.showToast({ title: '已设为默认', icon: 'success' }); }}>设为默认</Text>
            )}
            <Text className={styles.action} onClick={(e) => { e.stopPropagation(); handleEdit(addr.id); }}>编辑</Text>
            <Text className={styles.action} onClick={(e) => { e.stopPropagation(); handleDelete(addr.id); }}>删除</Text>
          </View>
        </View>
      ))}
      <View className={styles.addBtn} onClick={handleAdd}>+ 新建收货地址</View>
    </View>
  );
};

export default AddressListPage;
