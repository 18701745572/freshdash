import { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, message, Modal, Form, InputNumber, Select, Switch, Image } from 'antd';
import { PlusOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { fetchBanners, saveBanner, deleteBanner, reorderBanners, fetchProducts, fetchCategories } from '../../services/api';
import type { AdminBanner } from '../../types';
import ImageUpload from '../../components/ImageUpload';

export default function BannerManage() {
  const [data, setData] = useState<AdminBanner[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBanner | null>(null);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [form] = Form.useForm();

  const loadData = () => {
    setLoading(true);
    fetchBanners()
      .then(setData)
      .catch((e) => message.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    fetchProducts({ pageSize: 100 }).then((res) => setProducts(res.list.map((p) => ({ id: p.id, name: p.name })))).catch(() => {});
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  const openForm = (banner?: AdminBanner) => {
    setEditing(banner || null);
    if (banner) {
      form.setFieldsValue({ ...banner, imageUrl: banner.imageUrl ? [banner.imageUrl] : [] });
    } else {
      form.resetFields();
      form.setFieldsValue({ linkType: 'NONE', isActive: true, sort: data.length + 1 });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    const imageUrl = Array.isArray(values.imageUrl) ? values.imageUrl[0] : values.imageUrl;
    await saveBanner({
      id: editing?.id,
      imageUrl,
      linkType: values.linkType,
      linkId: values.linkId,
      linkLabel: values.linkLabel,
      sort: values.sort,
      isActive: values.isActive,
    });
    message.success('保存成功');
    setModalOpen(false);
    loadData();
  };

  const moveBanner = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= data.length) return;
    const orderedIds = [...data];
    [orderedIds[index], orderedIds[newIndex]] = [orderedIds[newIndex], orderedIds[index]];
    await reorderBanners(orderedIds.map((b) => b.id));
    loadData();
  };

  const linkTypeLabels: Record<string, string> = {
    NONE: '无跳转',
    PRODUCT: '商品详情',
    CATEGORY: '分类页',
  };

  return (
    <div>
      <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }} onClick={() => openForm()}>
        新增轮播图
      </Button>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        columns={[
          {
            title: '图片',
            dataIndex: 'imageUrl',
            render: (url: string) => <Image src={url} width={120} height={48} style={{ objectFit: 'cover' }} />,
          },
          { title: '跳转类型', dataIndex: 'linkType', render: (v: string) => linkTypeLabels[v] || v },
          { title: '跳转目标', dataIndex: 'linkLabel', render: (v: string) => v || '-' },
          { title: '排序', dataIndex: 'sort' },
          {
            title: '状态',
            dataIndex: 'isActive',
            render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? '启用' : '停用'}</Tag>,
          },
          {
            title: '操作',
            key: 'action',
            render: (_: unknown, record: AdminBanner, index: number) => (
              <Space>
                <Button type="link" icon={<ArrowUpOutlined />} disabled={index === 0} onClick={() => moveBanner(index, 'up')} />
                <Button type="link" icon={<ArrowDownOutlined />} disabled={index === data.length - 1} onClick={() => moveBanner(index, 'down')} />
                <Button type="link" onClick={() => openForm(record)}>编辑</Button>
                <Button type="link" danger onClick={() => {
                  Modal.confirm({ title: '确认删除', onOk: async () => { await deleteBanner(record.id); loadData(); } });
                }}>删除</Button>
              </Space>
            ),
          },
        ]}
      />
      <Modal title={editing ? '编辑轮播图' : '新增轮播图'} open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)} width={520}>
        <Form form={form} layout="vertical">
          <Form.Item name="imageUrl" label="轮播图片" rules={[{ required: true, message: '请上传图片' }]}>
            <ImageUpload maxCount={1} />
          </Form.Item>
          <Form.Item name="linkType" label="跳转类型" rules={[{ required: true }]}>
            <Select options={[
              { value: 'NONE', label: '无跳转' },
              { value: 'PRODUCT', label: '跳转商品详情' },
              { value: 'CATEGORY', label: '跳转分类' },
            ]} />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.linkType !== cur.linkType}>
            {({ getFieldValue }) => {
              const linkType = getFieldValue('linkType');
              if (linkType === 'PRODUCT') {
                return (
                  <Form.Item name="linkId" label="商品" rules={[{ required: true }]}>
                    <Select options={products.map((p) => ({ value: p.id, label: p.name }))} onChange={(_, opt) => form.setFieldValue('linkLabel', (opt as { label: string }).label)} />
                  </Form.Item>
                );
              }
              if (linkType === 'CATEGORY') {
                return (
                  <Form.Item name="linkId" label="分类" rules={[{ required: true }]}>
                    <Select options={categories.map((c) => ({ value: c.id, label: c.name }))} onChange={(_, opt) => form.setFieldValue('linkLabel', (opt as { label: string }).label)} />
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="isActive" label="启用" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
