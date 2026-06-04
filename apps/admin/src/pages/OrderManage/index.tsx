import React, { useState } from 'react';
import { Table, Button, Tag, Space } from 'antd';

const mockOrders = [
  { id: '1', orderNo: 'XD20240604001', user: '张三', totalAmount: 48.80, status: '待付款', createdAt: '2024-06-04 10:30' },
  { id: '2', orderNo: 'XD20240604002', user: '李四', totalAmount: 29.90, status: '待发货', createdAt: '2024-06-04 09:15' },
  { id: '3', orderNo: 'XD20240604003', user: '王五', totalAmount: 99.00, status: '已完成', createdAt: '2024-06-03 18:20' },
];

const statusColors: Record<string, string> = {
  '待付款': 'orange',
  '待派单': 'blue',
  '待发货': 'cyan',
  '待收货': 'purple',
  '已完成': 'green',
  '已取消': 'default',
};

const OrderManage: React.FC = () => {
  const [data] = useState(mockOrders);

  const columns = [
    { title: '订单编号', dataIndex: 'orderNo', key: 'orderNo' },
    { title: '用户', dataIndex: 'user', key: 'user' },
    { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', render: (v: number) => `¥${v.toFixed(2)}` },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={statusColors[v] || 'default'}>{v}</Tag> },
    { title: '下单时间', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link">详情</Button>
          {record.status === '待派单' && <Button type="link">派单</Button>}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Table rowKey="id" columns={columns} dataSource={data} />
    </div>
  );
};

export default OrderManage;
