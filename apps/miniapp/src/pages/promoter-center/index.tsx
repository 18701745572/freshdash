import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

const mockStats = {
  totalCommission: 12580,
  settledAmount: 8000,
  pendingAmount: 4580,
  referralCount: 23,
  orderCount: 45,
};

const mockRecords = [
  { id: '1', name: '订单佣金', time: '2024-06-04 12:30', amount: 350 },
  { id: '2', name: '订单佣金', time: '2024-06-03 10:15', amount: 280 },
  { id: '3', name: '订单佣金', time: '2024-06-02 18:45', amount: 520 },
];

const PromoterCenterPage: React.FC = () => {
  const [stats] = useState(mockStats);
  const [records] = useState(mockRecords);

  const formatPrice = (price: number) => (price / 100).toFixed(2);

  const handleCopy = () => {
    Taro.setClipboardData({ data: 'FRESH2024' });
  };

  const handlePoster = () => {
    Taro.navigateTo({ url: '/pages/promoter-poster/index' });
  };

  const handleWithdraw = () => {
    Taro.showModal({
      title: '申请提现',
      content: `可提现金额：¥${formatPrice(stats.pendingAmount)}`,
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '申请已提交', icon: 'success' });
        }
      },
    });
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.totalCommission}>¥{formatPrice(stats.totalCommission)}</Text>
        <Text className={styles.commissionLabel}>累计佣金（元）</Text>
      </View>

      <View className={styles.statsGrid}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>¥{formatPrice(stats.settledAmount)}</Text>
          <Text className={styles.statLabel}>已结算</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>¥{formatPrice(stats.pendingAmount)}</Text>
          <Text className={styles.statLabel}>待结算</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{stats.referralCount}</Text>
          <Text className={styles.statLabel}>推广人数</Text>
        </View>
      </View>

      <View className={styles.card}>
        <Text className={styles.cardTitle}>我的推广码</Text>
        <View className={styles.codeRow}>
          <Text className={styles.codeValue}>FRESH2024</Text>
          <View className={styles.copyBtn} onClick={handleCopy}>复制</View>
        </View>
        <View className={styles.posterBtn} onClick={handlePoster}>生成推广海报</View>
      </View>

      <View className={styles.card}>
        <Text className={styles.cardTitle}>佣金明细</Text>
        {records.map((record) => (
          <View key={record.id} className={styles.recordItem}>
            <View className={styles.recordInfo}>
              <Text className={styles.recordName}>{record.name}</Text>
              <Text className={styles.recordTime}>{record.time}</Text>
            </View>
            <Text className={styles.recordAmount}>+¥{formatPrice(record.amount)}</Text>
          </View>
        ))}
      </View>

      <View className={styles.withdrawBtn} onClick={handleWithdraw}>申请提现</View>
    </ScrollView>
  );
};

export default PromoterCenterPage;
