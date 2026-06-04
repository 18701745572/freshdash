import React, { useState } from 'react';
import { Table, Button, Tag, Space } from 'antd';

const mockPromoters = [
  { id: '1', name: '张三', phone: '13800138000', totalCommission: 125.80, referralCount: 23, status: '正常' },
  { id: '2', name: '李四', phone: '13900139000', totalCommission: 68.50, referralCount: 12, status: '正常' },
  { id: '3', name: '王五', phone: '13700137000', totalCommission: 0, referralCount: 0, status: '禁用' },
];

const PromoterManage: React.FC = () => {
  const [data] = useState(mockPromoters);

  const columns = [
    { title: '推广员', dataIndex: 'name', key: 'name' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    { title: '累计佣金', dataIndex: 'totalCommission', key: 'totalCommission', render: (v: number) => `¥${v.toFixed(2)}` },
    { title: '推广人数', dataIndex: 'referralCount', key: 'referralCount' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v === '正常' ? 'green' : 'red'}>{v}</Tag> },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space>
          <Button type="link">详情</Button>
          <Button type="link" danger>禁用</Button>
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

export default PromoterManage;
