import React from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuthStore } from '@/stores/authStore';
import { usePromoterStore } from '@/stores/promoterStore';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const userInfo = useAuthStore((s) => s.userInfo);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const login = useAuthStore((s) => s.login);
  const isPromoter = usePromoterStore((s) => s.isPromoter);

  const handleNav = (url: string) => {
    Taro.navigateTo({ url });
  };

  const handleLogin = () => {
    if (!isLoggedIn) {
      login();
    }
  };

  const orderStatuses = [
    { icon: '💰', label: '待付款', url: '/pages/order-list/index?status=pending_payment' },
    { icon: '📦', label: '待派单', url: '/pages/order-list/index?status=pending_dispatch' },
    { icon: '🚚', label: '待收货', url: '/pages/order-list/index?status=shipped' },
    { icon: '✅', label: '已完成', url: '/pages/order-list/index?status=completed' },
  ];

  const menus = [
    { icon: '📍', label: '地址管理', url: '/pages/address-list/index' },
    { icon: '💵', label: isPromoter ? '推广中心' : '申请推广员', url: isPromoter ? '/pages/promoter-center/index' : '/pages/promoter-apply/index' },
    { icon: '🌱', label: '认养菜地', url: '/pages/farm/index' },
    { icon: '💬', label: '联系客服', url: '' },
  ];

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header} onClick={handleLogin}>
        {userInfo?.avatarUrl ? (
          <Image className={styles.avatarImg} src={userInfo.avatarUrl} mode="aspectFill" />
        ) : (
          <View className={styles.avatar}>👤</View>
        )}
        <View className={styles.userInfo}>
          <Text className={styles.nickName}>{userInfo?.nickName || '微信用户'}</Text>
          <Text className={styles.phone}>{userInfo?.phone || (isLoggedIn ? '' : '点击登录')}</Text>
        </View>
      </View>

      <View className={styles.orderSection}>
        <View className={styles.orderHeader}>
          <Text className={styles.orderTitle}>我的订单</Text>
          <Text className={styles.orderMore} onClick={() => handleNav('/pages/order-list/index')}>全部 ></Text>
        </View>
        <View className={styles.orderStatusList}>
          {orderStatuses.map((s) => (
            <View key={s.label} className={styles.statusItem} onClick={() => handleNav(s.url)}>
              <Text className={styles.statusIcon}>{s.icon}</Text>
              <Text className={styles.statusLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.menuList}>
        {menus.map((menu) => (
          <View key={menu.label} className={styles.menuItem} onClick={() => menu.url && handleNav(menu.url)}>
            <Text className={styles.menuIcon}>{menu.icon}</Text>
            <Text className={styles.menuText}>{menu.label}</Text>
            <Text className={styles.menuArrow}>></Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default MinePage;
