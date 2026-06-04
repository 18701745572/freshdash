import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, message } from 'antd';
import { fetchWithdrawals } from '../../services/api';

interface Withdrawal {
  id: string;
  promoter: { user: { nickName?: string } };
  amount: number;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  PENDING: 'orange',
  APPROVED: 'green',
  REJECTED: 'red',
  PAID: 'blue',
};

const statusLabels: Record<string, string> = {
  PENDING: '待审核',
  APPROVED: '已通过',
  REJECTED: '已拒绝',
  PAID: '已打款',
};

const WithdrawalManage: React.FC = () => {
  const [data, setData] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchWithdrawals()
      .then((res: any) => setData(res))
      .catch((err) => message.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { title: '推广员', dataIndex: ['promoter', 'user', 'nickName'], key: 'promoter', render: (_: any, record: Withdrawal) => record.promoter?.user?.nickName || '-' },
    { title: '提现金额', dataIndex: 'amount', key: 'amount', render: (v: number) => `¥${(v / 100).toFixed(2)}` },
    { title: '申请时间', dataIndex: 'createdAt', key: 'createdAt' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={statusColors[v] || 'default'}>{statusLabels[v] || v}</Tag> },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Withdrawal) => (
        <Space>
          {record.status === 'PENDING' && (
            <>
              <Button type="link">通过</Button>
              <Button type="link" danger>拒绝</Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return <Table rowKey="id" columns={columns} dataSource={data} loading={loading} />;
};

export default WithdrawalManage;
