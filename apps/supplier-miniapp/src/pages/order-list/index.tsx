import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';

const mockSupplierOrders = [
  { id: '1', orderNo: 'XD20240604001', status: '待发货', productName: '烟台红富士苹果', quantity: 2, address: '深圳市南山区科技园' },
  { id: '2', orderNo: 'XD20240604002', status: '待发货', productName: '鲜活基围虾', quantity: 1, address: '深圳市福田区中心区' },
];

const OrderListPage: React.FC = () => {
  const [orders] = useState(mockSupplierOrders);

  const handleDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/order-detail/index?id=${id}` });
  };

  return (
    <View style={{ padding: '20rpx' }}>
      {orders.map((order) => (
        <View
          key={order.id}
          style={{
            background: '#fff',
            borderRadius: '16rpx',
            padding: '24rpx',
            marginBottom: '20rpx',
            boxShadow: '0 2rpx 12rpx rgba(0,0,0,0.05)',
          }}
          onClick={() => handleDetail(order.id)}
        >
          <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12rpx' }}>
            <Text style={{ fontSize: '28rpx', fontWeight: 600 }}>{order.orderNo}</Text>
            <Text style={{ fontSize: '26rpx', color: '#00b578' }}>{order.status}</Text>
          </View>
          <Text style={{ fontSize: '28rpx', color: '#333' }}>{order.productName} x{order.quantity}</Text>
          <Text style={{ fontSize: '24rpx', color: '#999', marginTop: '8rpx' }}>{order.address}</Text>
        </View>
      ))}
    </View>
  );
};

export default OrderListPage;
