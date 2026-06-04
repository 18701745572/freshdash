import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, message } from 'antd';
import { fetchProducts } from '../../services/api';

interface Product {
  id: string;
  name: string;
  coverImage: string;
  price: number;
  originalPrice?: number;
  stock: number;
  categoryId: string;
  status: string;
}

const ProductManage: React.FC = () => {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchProducts()
      .then((res: any) => setData(res))
      .catch((err) => message.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { title: '商品名称', dataIndex: 'name', key: 'name' },
    { title: '价格', dataIndex: 'price', key: 'price', render: (v: number) => `¥${(v / 100).toFixed(2)}` },
    { title: '库存', dataIndex: 'stock', key: 'stock' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v === '上架' ? 'green' : 'red'}>{v}</Tag> },
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
      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} />
    </div>
  );
};

export default ProductManage;
