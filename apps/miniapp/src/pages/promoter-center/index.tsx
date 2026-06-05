import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { usePromoterStore } from '@/stores/promoterStore';
import { getPromoterCode } from '@/stores/promoterStore';
import { formatPrice } from '@/utils/price';
import styles from './index.module.scss';

const PromoterCenterPage: React.FC = () => {
  const stats = usePromoterStore((s) => s.stats);
  const records = usePromoterStore((s) => s.records);
  const withdraw = usePromoterStore((s) => s.withdraw);
  const isPromoter = usePromoterStore((s) => s.isPromoter);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const code = getPromoterCode();

  useEffect(() => {
    if (!isPromoter) {
      Taro.redirectTo({ url: '/pages/promoter-apply/index' });
    }
  }, [isPromoter]);

  if (!isPromoter) return null;

  const handleCopy = () => {
    Taro.setClipboardData({ data: code });
  };

  const handlePoster = () => {
    Taro.navigateTo({ url: '/pages/promoter-poster/index' });
  };

  const handleWithdraw = () => {
    const amount = Math.round(parseFloat(withdrawAmount) * 100);
    if (isNaN(amount) || amount <= 0) {
      Taro.showToast({ title: '请输入提现金额', icon: 'none' });
      return;
    }
    const result = withdraw(amount);
    if (result.success) {
      Taro.showToast({ title: '提现申请已提交', icon: 'success' });
      setWithdrawAmount('');
    } else {
      Taro.showToast({ title: result.message || '提现失败', icon: 'none' });
    }
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
          <Text className={styles.codeValue}>{code}</Text>
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

      <View className={styles.withdrawSection}>
        <Text className={styles.cardTitle}>申请提现（最低10元）</Text>
        <Input
          className={styles.withdrawInput}
          placeholder="请输入提现金额"
          type="digit"
          value={withdrawAmount}
          onInput={(e) => setWithdrawAmount(e.detail.value)}
        />
        <View className={styles.withdrawBtn} onClick={handleWithdraw}>申请提现</View>
      </View>
    </ScrollView>
  );
};

export default PromoterCenterPage;
