import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, message } from 'antd';
import { fetchPromoters } from '../../services/api';

interface Promoter {
  id: string;
  user: { nickName?: string; phone?: string };
  totalCommission: number;
  balance: number;
  status: string;
}

const PromoterManage: React.FC = () => {
  const [data, setData] = useState<Promoter[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchPromoters()
      .then((res: any) => setData(res))
      .catch((err) => message.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { title: '推广员', dataIndex: ['user', 'nickName'], key: 'name', render: (_: any, record: Promoter) => record.user?.nickName || '-' },
    { title: '手机号', dataIndex: ['user', 'phone'], key: 'phone', render: (_: any, record: Promoter) => record.user?.phone || '-' },
    { title: '累计佣金', dataIndex: 'totalCommission', key: 'totalCommission', render: (v: number) => `¥${(v / 100).toFixed(2)}` },
    { title: '余额', dataIndex: 'balance', key: 'balance', render: (v: number) => `¥${(v / 100).toFixed(2)}` },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v === 'ACTIVE' ? 'green' : 'red'}>{v === 'ACTIVE' ? '正常' : '禁用'}</Tag> },
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

  return <Table rowKey="id" columns={columns} dataSource={data} loading={loading} />;
};

export default PromoterManage;
