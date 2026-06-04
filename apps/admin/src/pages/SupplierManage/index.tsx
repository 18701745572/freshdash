import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, message } from 'antd';
import { fetchSuppliers } from '../../services/api';

interface Supplier {
  id: string;
  name: string;
  contact: string;
  status: string;
  orderCount: number;
}

const SupplierManage: React.FC = () => {
  const [data, setData] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchSuppliers()
      .then((res: any) => setData(res))
      .catch((err) => message.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { title: '供应商名称', dataIndex: 'name', key: 'name' },
    { title: '联系人', dataIndex: 'contact', key: 'contact' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v === 'ACTIVE' ? 'green' : 'orange'}>{v === 'ACTIVE' ? '合作中' : '待审核'}</Tag> },
    { title: '累计订单', dataIndex: 'orderCount', key: 'orderCount' },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space>
          <Button type="link">编辑</Button>
          <Button type="link">查看订单</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary">+ 新增供应商</Button>
      </div>
      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} />
    </div>
  );
};

export default SupplierManage;
