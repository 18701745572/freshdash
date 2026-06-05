import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Tag, message } from 'antd';
import { fetchFarmOrders } from '../../services/api';
import type { FarmOrder } from '../../types';
import { formatMoney } from '../../utils/format';

const statusMap: Record<string, { color: string; label: string }> = {
  ACTIVE: { color: 'green', label: '认养中' },
  EXPIRED: { color: 'default', label: '已到期' },
  CANCELLED: { color: 'red', label: '已取消' },
};

export default function FarmOrders() {
  const navigate = useNavigate();
  const [data, setData] = useState<FarmOrder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchFarmOrders()
      .then(setData)
      .catch((e) => message.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Button style={{ marginBottom: 16 }} onClick={() => navigate('/farm-plots')}>返回地块列表</Button>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        columns={[
          { title: '用户', dataIndex: 'userName' },
          { title: '地块', dataIndex: 'plotName' },
          { title: '期限', dataIndex: 'period' },
          { title: '金额', dataIndex: 'amount', render: (v: number) => formatMoney(v) },
          {
            title: '状态',
            dataIndex: 'status',
            render: (v: string) => {
              const s = statusMap[v] || { color: 'default', label: v };
              return <Tag color={s.color}>{s.label}</Tag>;
            },
          },
          { title: '下单时间', dataIndex: 'createdAt' },
        ]}
      />
    </div>
  );
}
