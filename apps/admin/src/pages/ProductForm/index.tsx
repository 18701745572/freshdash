import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Select, Switch, Button, Space, message, Spin } from 'antd';
import { fetchProduct, saveProduct, fetchCategories, fetchSuppliers } from '../../services/api';
import ImageUpload from '../../components/ImageUpload';
import { yuanToCents, centsToYuan } from '../../utils/format';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);
  const isEdit = !!id;

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
    fetchSuppliers({ pageSize: 100 }).then((res) => setSuppliers(res.list)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    fetchProduct(id)
      .then((product) => {
        form.setFieldsValue({
          ...product,
          price: centsToYuan(product.price),
          costPrice: centsToYuan(product.costPrice),
        });
      })
      .catch((e) => message.error(e.message))
      .finally(() => setLoading(false));
  }, [id, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      await saveProduct({
        id,
        name: values.name,
        categoryId: values.categoryId,
        supplierId: values.supplierId,
        price: yuanToCents(values.price),
        costPrice: yuanToCents(values.costPrice),
        stock: values.stock,
        mainImages: values.mainImages || [],
        detailImages: values.detailImages || [],
        isOnSale: values.isOnSale,
      });
      message.success(isEdit ? '保存成功' : '创建成功');
      navigate('/products');
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spin style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <Card title={isEdit ? '编辑商品' : '新增商品'}>
      <Form form={form} layout="vertical" initialValues={{ isOnSale: true, stock: 0 }}>
        <Form.Item name="name" label="商品名称" rules={[{ required: true, message: '请输入商品名称' }]}>
          <Input placeholder="请输入商品名称" />
        </Form.Item>
        <Form.Item name="categoryId" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
          <Select options={categories.map((c) => ({ value: c.id, label: c.name }))} placeholder="请选择分类" />
        </Form.Item>
        <Space size="large">
          <Form.Item name="price" label="售价（元）" rules={[{ required: true, message: '请输入售价' }]}>
            <InputNumber min={0} precision={2} style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="costPrice" label="成本价（元）" rules={[{ required: true, message: '请输入成本价' }]}>
            <InputNumber min={0} precision={2} style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="stock" label="库存" rules={[{ required: true, message: '请输入库存' }]}>
            <InputNumber min={0} style={{ width: 120 }} />
          </Form.Item>
        </Space>
        <Form.Item name="supplierId" label="默认供应商">
          <Select allowClear options={suppliers.map((s) => ({ value: s.id, label: s.name }))} placeholder="请选择默认供应商" />
        </Form.Item>
        <Form.Item name="mainImages" label="主图（最多5张）">
          <ImageUpload maxCount={5} />
        </Form.Item>
        <Form.Item name="detailImages" label="详情图（最多10张）">
          <ImageUpload maxCount={10} />
        </Form.Item>
        <Form.Item name="isOnSale" label="是否上架" valuePropName="checked">
          <Switch checkedChildren="上架" unCheckedChildren="下架" />
        </Form.Item>
        <Space>
          <Button type="primary" loading={saving} onClick={handleSubmit}>保存</Button>
          <Button onClick={() => navigate('/products')}>取消</Button>
        </Space>
      </Form>
    </Card>
  );
}
