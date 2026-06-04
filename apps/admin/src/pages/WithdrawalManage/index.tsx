import React, { useState } from 'react';
import { Table, Button, Tag, Space } from 'antd';

const mockWithdrawals = [
  { id: '1', promoter: '张三', amount: 45.80, method: '微信支付', applyTime: '2024-06-04 10:30', status: '待审核' },
  { id: '2', promoter: '李四', amount: 120.00, method: '银行卡', applyTime: '2024-06-03 16:20', status: '已通过' },
  { id: '3', promoter: '赵六', amount: 30.00, method: '微信支付', applyTime: '2024-06-02 09:15', status: '已拒绝' },
];

const statusColors: Record<string, string> = {
  '待审核': 'orange',
  '已通过': 'green',
  '已拒绝': 'red',
  '已打款': 'blue',
};

const WithdrawalManage: React.FC = () => {
  const [data] = useState(mockWithdrawals);

  const columns = [
    { title: '推广员', dataIndex: 'promoter', key: 'promoter' },
    { title: '提现金额', dataIndex: 'amount', key: 'amount', render: (v: number) => `¥${v.toFixed(2)}` },
    { title: '提现方式', dataIndex: 'method', key: 'method' },
    { title: '申请时间', dataIndex: 'applyTime', key: 'applyTime' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={statusColors[v] || 'default'}>{v}</Tag> },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          {record.status === '待审核' && (
            <>
              <Button type="link">通过</Button>
              <Button type="link" danger>拒绝</Button>
            </>
          )}
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

export default WithdrawalManage;
