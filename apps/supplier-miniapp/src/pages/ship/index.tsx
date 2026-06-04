import React, { useState } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';

const ShipPage: React.FC = () => {
  const [company, setCompany] = useState('');
  const [trackingNo, setTrackingNo] = useState('');

  const handleSubmit = () => {
    if (!company || !trackingNo) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    Taro.showToast({ title: '发货成功', icon: 'success' });
    setTimeout(() => Taro.navigateBack(), 1500);
  };

  return (
    <View style={{ padding: '20rpx' }}>
      <View style={{ background: '#fff', borderRadius: '16rpx', padding: '24rpx', marginBottom: '20rpx' }}>
        <Text style={{ fontSize: '28rpx', marginBottom: '16rpx' }}>物流公司</Text>
        <Input
          style={{ height: '80rpx', background: '#f5f5f5', borderRadius: '8rpx', padding: '0 20rpx', fontSize: '28rpx' }}
          placeholder="请输入物流公司"
          value={company}
          onInput={(e) => setCompany(e.detail.value)}
        />
      </View>

      <View style={{ background: '#fff', borderRadius: '16rpx', padding: '24rpx', marginBottom: '40rpx' }}>
        <Text style={{ fontSize: '28rpx', marginBottom: '16rpx' }}>物流单号</Text>
        <Input
          style={{ height: '80rpx', background: '#f5f5f5', borderRadius: '8rpx', padding: '0 20rpx', fontSize: '28rpx' }}
          placeholder="请输入物流单号"
          value={trackingNo}
          onInput={(e) => setTrackingNo(e.detail.value)}
        />
      </View>

      <View
        onClick={handleSubmit}
        style={{
          height: '88rpx',
          background: '#00b578',
          borderRadius: '44rpx',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '30rpx',
          fontWeight: 600,
        }}
      >
        确认发货
      </View>
    </View>
  );
};

export default ShipPage;
