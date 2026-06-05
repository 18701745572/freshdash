import { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, message, Modal, Form, Input, Switch, InputNumber, Select } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { fetchDiscountRules, saveDiscountRule, deleteDiscountRule, fetchCategories } from '../../services/api';
import type { DiscountRule, DiscountTier } from '../../types';
import { centsToYuan, yuanToCents } from '../../utils/format';

export default function DiscountRules() {
  const [data, setData] = useState<DiscountRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DiscountRule | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [form] = Form.useForm();

  const loadData = () => {
    setLoading(true);
    fetchDiscountRules()
      .then(setData)
      .catch((e) => message.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  const openForm = (rule?: DiscountRule) => {
    setEditing(rule || null);
    if (rule) {
      form.setFieldsValue({
        ...rule,
        tiers: rule.tiers.map((t) => ({ threshold: centsToYuan(t.threshold), discount: centsToYuan(t.discount) })),
        scopeCategories: Array.isArray(rule.scope) ? rule.scope : [],
        scopeAll: rule.scope === 'ALL',
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ isActive: false, scopeAll: true, tiers: [{ threshold: 100, discount: 10 }] });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    const tiers: DiscountTier[] = (values.tiers || []).map((t: { threshold: number; discount: number }) => ({
      threshold: yuanToCents(t.threshold),
      discount: yuanToCents(t.discount),
    }));
    await saveDiscountRule({
      id: editing?.id,
      name: values.name,
      tiers,
      scope: values.scopeAll ? 'ALL' : values.scopeCategories,
      isActive: values.isActive,
    });
    message.success('保存成功');
    setModalOpen(false);
    loadData();
  };

  const formatTiers = (tiers: DiscountTier[]) =>
    tiers.map((t) => `满${centsToYuan(t.threshold)}减${centsToYuan(t.discount)}`).join('，');

  const formatScope = (scope: DiscountRule['scope']) => {
    if (scope === 'ALL') return '全部商品';
    return (scope as string[]).map((id) => categories.find((c) => c.id === id)?.name || id).join('、');
  };

  return (
    <div>
      <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }} onClick={() => openForm()}>
        新增规则
      </Button>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        columns={[
          { title: '规则名称', dataIndex: 'name' },
          { title: '满减梯度', dataIndex: 'tiers', render: (tiers: DiscountTier[]) => formatTiers(tiers) },
          { title: '适用范围', dataIndex: 'scope', render: (scope: DiscountRule['scope']) => formatScope(scope) },
          {
            title: '状态',
            dataIndex: 'isActive',
            render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? '启用' : '停用'}</Tag>,
          },
          {
            title: '操作',
            key: 'action',
            render: (_: unknown, record: DiscountRule) => (
              <Space>
                <Button type="link" onClick={() => openForm(record)}>编辑</Button>
                <Button type="link" danger onClick={() => {
                  Modal.confirm({
                    title: '确认删除',
                    onOk: async () => { await deleteDiscountRule(record.id); loadData(); },
                  });
                }}>删除</Button>
              </Space>
            ),
          },
        ]}
      />
      <Modal title={editing ? '编辑满减规则' : '新增满减规则'} open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)} width={600}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="规则名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="满减梯度" required>
            <Form.List name="tiers">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <Space key={field.key} align="baseline">
                      <Form.Item name={[field.name, 'threshold']} rules={[{ required: true }]}>
                        <InputNumber placeholder="满（元）" min={0} />
                      </Form.Item>
                      <span>减</span>
                      <Form.Item name={[field.name, 'discount']} rules={[{ required: true }]}>
                        <InputNumber placeholder="减（元）" min={0} />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add()} block>添加梯度</Button>
                </>
              )}
            </Form.List>
          </Form.Item>
          <Form.Item name="scopeAll" label="适用范围" valuePropName="checked">
            <Switch checkedChildren="全部商品" unCheckedChildren="指定分类" />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.scopeAll !== cur.scopeAll}>
            {({ getFieldValue }) =>
              !getFieldValue('scopeAll') && (
                <Form.Item name="scopeCategories" label="选择分类">
                  <Select mode="multiple" options={categories.map((c) => ({ value: c.id, label: c.name }))} />
                </Form.Item>
              )
            }
          </Form.Item>
          <Form.Item name="isActive" label="启用" valuePropName="checked" extra="同一时间仅允许一条规则启用">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
