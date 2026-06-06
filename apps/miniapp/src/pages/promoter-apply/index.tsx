import React, { useState, useEffect } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { usePromoterStore } from '@/stores/promoterStore';
import { mockSendSms } from '@/services';
import styles from './index.module.scss';
import classnames from 'classnames';

const PromoterApplyPage: React.FC = () => {
  const apply = usePromoterStore((s) => s.apply);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [mockCode, setMockCode] = useState('');

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendSms = async () => {
    if (!/^1\d{10}$/.test(phone)) {
      Taro.showToast({ title: '请输入正确手机号', icon: 'none' });
      return;
    }
    const res = await mockSendSms(phone);
    setMockCode(res.code);
    setCountdown(60);
    Taro.showToast({ title: `验证码：${res.code}`, icon: 'none', duration: 3000 });
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Taro.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }
    if (!/^1\d{10}$/.test(phone)) {
      Taro.showToast({ title: '请输入正确手机号', icon: 'none' });
      return;
    }
    if (!code || code !== mockCode) {
      Taro.showToast({ title: '验证码错误', icon: 'none' });
      return;
    }

    const ok = await apply({ name, phone, inviteCode });
    if (ok) {
      Taro.showToast({ title: '申请成功', icon: 'success' });
      setTimeout(() => {
        Taro.redirectTo({ url: '/pages/promoter-center/index' });
      }, 1000);
    }
  };

  return (
    <View className={styles.page}>
      <Text className={styles.title}>成为推广员</Text>
      <Text className={styles.desc}>分享好物，赚取佣金，零门槛加入</Text>

      <View className={styles.formItem}>
        <Text className={styles.label}>姓名</Text>
        <Input className={styles.input} placeholder="请输入真实姓名" value={name} onInput={(e) => setName(e.detail.value)} />
      </View>

      <View className={styles.formItem}>
        <Text className={styles.label}>手机号</Text>
        <Input className={styles.input} placeholder="请输入手机号" type="number" maxlength={11} value={phone} onInput={(e) => setPhone(e.detail.value)} />
      </View>

      <View className={styles.formItem}>
        <Text className={styles.label}>验证码</Text>
        <View className={styles.smsRow}>
          <Input className={styles.input} placeholder="请输入验证码" type="number" maxlength={6} value={code} onInput={(e) => setCode(e.detail.value)} />
          <View
            className={classnames(styles.smsBtn, countdown > 0 && styles.smsBtnDisabled)}
            onClick={countdown > 0 ? undefined : handleSendSms}
          >
            {countdown > 0 ? `${countdown}s` : '获取验证码'}
          </View>
        </View>
      </View>

      <View className={styles.formItem}>
        <Text className={styles.label}>邀请码</Text>
        <Input className={styles.input} placeholder="选填" value={inviteCode} onInput={(e) => setInviteCode(e.detail.value)} />
      </View>

      <View className={styles.submitBtn} onClick={handleSubmit}>提交申请</View>
    </View>
  );
};

export default PromoterApplyPage;
