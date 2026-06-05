import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Tag, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { fetchFarmPlots } from '../../services/api';
import type { FarmPlot } from '../../types';
import { formatMoney } from '../../utils/format';

export default function FarmPlots() {
  const navigate = useNavigate();
  const [data, setData] = useState<FarmPlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchFarmPlots()
      .then(setData)
      .catch((e) => message.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/farm-plots/new')}>新增地块</Button>
        <Button onClick={() => navigate('/farm-orders')}>认养订单</Button>
      </Space>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        columns={[
          { title: '地块名称', dataIndex: 'name' },
          { title: '面积（㎡）', dataIndex: 'area' },
          { title: '季度价', dataIndex: 'quarterPrice', render: (v: number) => formatMoney(v) },
          { title: '年价', dataIndex: 'yearPrice', render: (v: number) => formatMoney(v) },
          { title: '库存', dataIndex: 'stock' },
          {
            title: '状态',
            dataIndex: 'status',
            render: (v: string) => <Tag color={v === 'AVAILABLE' ? 'green' : 'red'}>{v === 'AVAILABLE' ? '可认养' : '已满'}</Tag>,
          },
          {
            title: '操作',
            key: 'action',
            render: (_: unknown, record: FarmPlot) => (
              <Space>
                <Button type="link" onClick={() => navigate(`/farm-plots/${record.id}/edit`)}>编辑</Button>
                <Button type="link" onClick={() => navigate(`/farm-plots/${record.id}/logs`)}>农事记录</Button>
              </Space>
            ),
          },
        ]}
      />
    </div>
  );
}
