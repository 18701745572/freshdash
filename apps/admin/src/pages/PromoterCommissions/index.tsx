import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, Tag, Spin, message } from 'antd';
import { fetchPromoterCommissions } from '../../services/api';
import type { AdminCommission } from '../../types';
import { formatMoney } from '../../utils/format';

const statusMap: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'orange', label: '待结算' },
  SETTLED: { color: 'green', label: '已结算' },
  DEDUCTED: { color: 'red', label: '已扣减' },
};

export default function PromoterCommissions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<AdminCommission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchPromoterCommissions(id)
      .then(setData)
      .catch((e) => message.error(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spin style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <div>
      <Button style={{ marginBottom: 16 }} onClick={() => navigate('/promoters')}>返回列表</Button>
      <Table
        rowKey="id"
        dataSource={data}
        columns={[
          { title: '订单号', dataIndex: 'orderNo' },
          { title: '佣金金额', dataIndex: 'amount', render: (v: number) => formatMoney(v) },
          {
            title: '状态',
            dataIndex: 'status',
            render: (v: string) => {
              const s = statusMap[v] || { color: 'default', label: v };
              return <Tag color={s.color}>{s.label}</Tag>;
            },
          },
          { title: '产生时间', dataIndex: 'createdAt' },
        ]}
      />
    </div>
  );
}
