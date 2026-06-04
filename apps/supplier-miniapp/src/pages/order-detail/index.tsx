import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import { useRouter } from '@tarojs/taro';

const mockOrders: Record<string, any> = {
  '1': { id: '1', orderNo: 'XD20240604001', status: '待发货', productName: '烟台红富士苹果', quantity: 2, address: '深圳市南山区科技园南路88号', contact: '张三 13800138000' },
  '2': { id: '2', orderNo: 'XD20240604002', status: '待发货', productName: '鲜活基围虾', quantity: 1, address: '深圳市福田区中心区一路100号', contact: '李四 13900139000' },
};

const OrderDetailPage: React.FC = () => {
  const { id } = useRouter().params;
  const [order] = useState(mockOrders[id || '1']);

  return (
    <View style={{ padding: '20rpx' }}>
      <View style={{ background: '#fff', borderRadius: '16rpx', padding: '24rpx', marginBottom: '20rpx' }}>
        <Text style={{ fontSize: '32rpx', fontWeight: 700, marginBottom: '16rpx' }}>订单信息</Text>
        <View style={{ marginBottom: '12rpx' }}>
          <Text style={{ fontSize: '26rpx', color: '#666' }}>订单编号：{order.orderNo}</Text>
        </View>
        <View style={{ marginBottom: '12rpx' }}>
          <Text style={{ fontSize: '26rpx', color: '#666' }}>商品：{order.productName} x{order.quantity}</Text>
        </View>
        <View style={{ marginBottom: '12rpx' }}>
          <Text style={{ fontSize: '26rpx', color: '#666' }}>状态：</Text>
          <Text style={{ fontSize: '26rpx', color: '#00b578', fontWeight: 600 }}>{order.status}</Text>
        </View>
      </View>

      <View style={{ background: '#fff', borderRadius: '16rpx', padding: '24rpx', marginBottom: '20rpx' }}>
        <Text style={{ fontSize: '32rpx', fontWeight: 700, marginBottom: '16rpx' }}>收货信息</Text>
        <Text style={{ fontSize: '26rpx', color: '#666', marginBottom: '8rpx' }}>{order.contact}</Text>
        <Text style={{ fontSize: '26rpx', color: '#666' }}>{order.address}</Text>
      </View>

      <View
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
        立即发货
      </View>
    </View>
  );
};

export default OrderDetailPage;
