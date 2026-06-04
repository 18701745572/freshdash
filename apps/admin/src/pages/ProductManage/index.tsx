import React, { useState } from 'react';
import { Table, Button, Tag, Space } from 'antd';

const mockProducts = [
  { id: '1', name: '烟台红富士苹果', price: 19.90, stock: 100, category: '水果', status: '上架' },
  { id: '2', name: '进口香蕉', price: 8.90, stock: 200, category: '水果', status: '上架' },
  { id: '3', name: '鲜活基围虾', price: 39.90, stock: 50, category: '海鲜', status: '上架' },
];

const ProductManage: React.FC = () => {
  const [data] = useState(mockProducts);

  const columns = [
    { title: '商品名称', dataIndex: 'name', key: 'name' },
    { title: '分类', dataIndex: 'category', key: 'category' },
    { title: '价格', dataIndex: 'price', key: 'price', render: (v: number) => `¥${v.toFixed(2)}` },
    { title: '库存', dataIndex: 'stock', key: 'stock' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color="green">{v}</Tag> },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space>
          <Button type="link">编辑</Button>
          <Button type="link" danger>下架</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary">+ 新增商品</Button>
      </div>
      <Table rowKey="id" columns={columns} dataSource={data} />
    </div>
  );
};

export default ProductManage;
