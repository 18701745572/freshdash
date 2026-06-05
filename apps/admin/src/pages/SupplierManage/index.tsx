import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Tag, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { fetchSuppliers } from '../../services/api';
import type { AdminSupplier } from '../../types';

export default function SupplierManage() {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminSupplier[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const loadData = useCallback(() => {
    setLoading(true);
    fetchSuppliers({ page, pageSize: 10 })
      .then((res) => {
        setData(res.list);
        setTotal(res.total);
      })
      .catch((err) => message.error(err.message))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const columns = [
    { title: '供应商名称', dataIndex: 'name' },
    { title: '联系人', dataIndex: 'contactName' },
    { title: '手机号', dataIndex: 'phone' },
    { title: '登录账号', dataIndex: 'loginName' },
    {
      title: '账号状态',
      dataIndex: 'status',
      render: (v: string) => <Tag color={v === 'ACTIVE' ? 'green' : 'orange'}>{v === 'ACTIVE' ? '正常' : '已禁用'}</Tag>,
    },
    { title: '创建时间', dataIndex: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: AdminSupplier) => (
        <Space>
          <Button type="link" onClick={() => navigate(`/suppliers/${record.id}/edit`)}>编辑</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }} onClick={() => navigate('/suppliers/new')}>
        新增供应商
      </Button>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ current: page, total, onChange: setPage }}
      />
    </div>
  );
}
