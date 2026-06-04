import React, { useState } from 'react';
import { Table, Button, Tag, Space } from 'antd';

const mockSuppliers = [
  { id: '1', name: '烟台果园直供', contact: '王经理 13800138001', status: '合作中', orderCount: 156 },
  { id: '2', name: '青岛海鲜批发', contact: '李经理 13900139002', status: '合作中', orderCount: 89 },
  { id: '3', name: '寿光蔬菜基地', contact: '张经理 13700137003', status: '待审核', orderCount: 0 },
];

const SupplierManage: React.FC = () => {
  const [data] = useState(mockSuppliers);

  const columns = [
    { title: '供应商名称', dataIndex: 'name', key: 'name' },
    { title: '联系人', dataIndex: 'contact', key: 'contact' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v === '合作中' ? 'green' : 'orange'}>{v}</Tag> },
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
      <Table rowKey="id" columns={columns} dataSource={data} />
    </div>
  );
};

export default SupplierManage;
