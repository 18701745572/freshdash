import React, { useEffect, useState } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuthStore } from '@/stores/authStore';
import { isTokenValid } from '@/utils/auth';
import styles from './index.module.scss';

const LoginPage: React.FC = () => {
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isTokenValid()) {
      Taro.switchTab({ url: '/pages/index/index' });
    }
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Taro.showToast({ title: '请输入账号和密码', icon: 'none' });
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
      Taro.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/index/index' });
      }, 500);
    } catch (err) {
      Taro.showToast({
        title: err instanceof Error ? err.message : '登录失败',
        icon: 'none',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.logo}>🥬</Text>
        <Text className={styles.title}>鲜达供应商端</Text>
        <Text className={styles.subtitle}>登录后处理平台派发的订单</Text>
      </View>

      <View className={styles.form}>
        <View className={styles.field}>
          <Text className={styles.label}>登录账号</Text>
          <Input
            className={styles.input}
            placeholder="请输入平台分配的账号"
            value={username}
            onInput={(e) => setUsername(e.detail.value)}
          />
        </View>

        <View className={styles.field}>
          <Text className={styles.label}>登录密码</Text>
          <View className={styles.passwordRow}>
            <Input
              className={styles.input}
              placeholder="请输入密码"
              password={!showPassword}
              value={password}
              onInput={(e) => setPassword(e.detail.value)}
            />
            <Text className={styles.toggle} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? '隐藏' : '显示'}
            </Text>
          </View>
        </View>

        <View
          className={`${styles.button} ${loading ? styles.buttonDisabled : ''}`}
          onClick={loading ? undefined : handleLogin}
        >
          <Text className={styles.buttonText}>{loading ? '登录中...' : '登录'}</Text>
        </View>
      </View>

      <Text className={styles.hint}>测试账号：13800138000 / 123456</Text>
    </View>
  );
};

export default LoginPage;
