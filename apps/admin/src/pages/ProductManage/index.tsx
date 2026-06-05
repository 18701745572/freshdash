import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Tag, Space, message, Select, Input, Upload, Modal } from 'antd';
import { PlusOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import { fetchProducts, fetchCategories, fetchSuppliers, importProducts } from '../../services/api';
import type { AdminProduct } from '../../types';
import { formatMoney, exportProductsToExcel, parseProductImportFile } from '../../utils/excel';

export default function ProductManage() {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<string>();
  const [status, setStatus] = useState<string>();
  const [supplierId, setSupplierId] = useState<string>();
  const [keyword, setKeyword] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);

  const loadData = useCallback(() => {
    setLoading(true);
    fetchProducts({ page, pageSize: 10, categoryId, status, supplierId, keyword: keyword || undefined })
      .then((res) => {
        setData(res.list);
        setTotal(res.total);
      })
      .catch((err) => message.error(err.message))
      .finally(() => setLoading(false));
  }, [page, categoryId, status, supplierId, keyword]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
    fetchSuppliers({ pageSize: 100 }).then((res) => setSuppliers(res.list)).catch(() => {});
  }, []);

  const handleImport = async (file: File) => {
    try {
      const rows = await parseProductImportFile(file);
      const result = await importProducts(rows);
      Modal.info({
        title: '导入结果',
        content: (
          <div>
            <p>成功 {result.success} 条，失败 {result.failed} 条</p>
            {result.errors.length > 0 && (
              <ul>{result.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
            )}
          </div>
        ),
      });
      loadData();
    } catch (e) {
      message.error((e as Error).message);
    }
    return false;
  };

  const handleExport = async () => {
    const res = await fetchProducts({ categoryId, status, supplierId, keyword, pageSize: 1000 });
    exportProductsToExcel(res.list);
  };

  const columns = [
    {
      title: '缩略图',
      dataIndex: 'mainImages',
      width: 80,
      render: (imgs: string[]) => imgs?.[0] ? <img src={imgs[0]} alt="" style={{ width: 48, height: 48, objectFit: 'cover' }} /> : '-',
    },
    { title: '商品名称', dataIndex: 'name' },
    { title: '分类', dataIndex: 'categoryName' },
    { title: '售价', dataIndex: 'price', render: (v: number) => formatMoney(v) },
    { title: '成本价', dataIndex: 'costPrice', render: (v: number) => formatMoney(v) },
    { title: '库存', dataIndex: 'stock' },
    { title: '默认供应商', dataIndex: 'supplierName', render: (v: string) => v || '-' },
    {
      title: '状态',
      dataIndex: 'isOnSale',
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? '上架' : '下架'}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: AdminProduct) => (
        <Space>
          <Button type="link" onClick={() => navigate(`/products/${record.id}/edit`)}>编辑</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/products/new')}>新增商品</Button>
        <Upload accept=".xlsx,.xls" showUploadList={false} beforeUpload={handleImport}>
          <Button icon={<UploadOutlined />}>Excel 导入</Button>
        </Upload>
        <Button icon={<DownloadOutlined />} onClick={handleExport}>导出 Excel</Button>
        <Select
          allowClear
          placeholder="分类"
          style={{ width: 120 }}
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          onChange={setCategoryId}
        />
        <Select
          allowClear
          placeholder="状态"
          style={{ width: 100 }}
          options={[
            { value: 'on_sale', label: '上架' },
            { value: 'off_sale', label: '下架' },
          ]}
          onChange={setStatus}
        />
        <Select
          allowClear
          placeholder="供应商"
          style={{ width: 150 }}
          options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
          onChange={setSupplierId}
        />
        <Input.Search placeholder="搜索商品" allowClear onSearch={setKeyword} style={{ width: 200 }} />
      </Space>
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
