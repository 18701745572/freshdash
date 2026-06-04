import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, message } from 'antd';
import { fetchOrders } from '../../services/api';

interface Order {
  id: string;
  orderNo: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

const OrderManage: React.FC = () => {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchOrders()
      .then((res: any) => setData(res))
      .catch((err) => message.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const statusColors: Record<string, string> = {
    PENDING_PAYMENT: 'orange',
    PENDING_DISPATCH: 'blue',
    PENDING_SHIPMENT: 'cyan',
    SHIPPED: 'purple',
    COMPLETED: 'green',
    CANCELLED: 'red',
  };

  const statusLabels: Record<string, string> = {
    PENDING_PAYMENT: '待付款',
    PENDING_DISPATCH: '待派单',
    PENDING_SHIPMENT: '待发货',
    SHIPPED: '待收货',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
  };

  const columns = [
    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo' },
    { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', render: (v: number) => `¥${(v / 100).toFixed(2)}` },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={statusColors[v] || 'default'}>{statusLabels[v] || v}</Tag> },
    { title: '下单时间', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space>
          <Button type="link">详情</Button>
          <Button type="link">派单</Button>
        </Space>
      ),
    },
  ];

  return <Table rowKey="id" columns={columns} dataSource={data} loading={loading} />;
};

export default OrderManage;
