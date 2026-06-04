import React from 'react';
import { View, Text } from '@tarojs/components';
import { useRouter } from '@tarojs/taro';

const OrderDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.params;

  return (
    <View className="page">
      <View className="card">
        <Text className="title">订单详情</Text>
        <Text>订单号：{id || 'XD20240604001'}</Text>
        <Text>商品：烟台红富士苹果 x2</Text>
        <Text>收货人：张三 13800138000</Text>
        <Text>地址：北京市朝阳区xx街道xx号</Text>
        <Text>状态：待发货</Text>
      </View>
    </View>
  );
};

export default OrderDetail;
