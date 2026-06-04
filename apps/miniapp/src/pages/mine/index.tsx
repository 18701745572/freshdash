import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const handleNav = (url: string) => {
    Taro.navigateTo({ url });
  };

  const orderStatuses = [
    { icon: '💰', label: '待付款', url: '/pages/order-list/index?status=pending_payment' },
    { icon: '📦', label: '待发货', url: '/pages/order-list/index?status=pending_shipment' },
    { icon: '🚚', label: '待收货', url: '/pages/order-list/index?status=shipped' },
    { icon: '✅', label: '已完成', url: '/pages/order-list/index?status=completed' },
  ];

  const menus = [
    { icon: '📍', label: '地址管理', url: '/pages/address-list/index' },
    { icon: '💵', label: '推广中心', url: '/pages/promoter-center/index' },
    { icon: '💬', label: '联系客服', url: '' },
  ];

  return (
    <ScrollView scrollY className={styles.page}>
      {/* 用户信息 */}
      <View className={styles.header}>
        <View className={styles.avatar}>👤</View>
        <View className={styles.userInfo}>
          <Text className={styles.nickName}>微信用户</Text>
          <Text className={styles.phone}>点击登录</Text>
        </View>
      </View>

      {/* 订单入口 */}
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

      {/* 功能菜单 */}
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
