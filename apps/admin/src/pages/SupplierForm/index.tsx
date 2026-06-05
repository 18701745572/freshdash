import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, Select, Button, Space, message, Spin, Modal } from 'antd';
import { fetchSupplier, saveSupplier, resetSupplierPassword } from '../../services/api';

export default function SupplierForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    if (!id) return;
    fetchSupplier(id)
      .then((supplier) => form.setFieldsValue(supplier))
      .catch((e) => message.error(e.message))
      .finally(() => setLoading(false));
  }, [id, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      await saveSupplier({ id, ...values });
      message.success(isEdit ? '保存成功' : '创建成功');
      navigate('/suppliers');
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = () => {
    let newPassword = '';
    Modal.confirm({
      title: '重置密码',
      content: (
        <Input.Password
          placeholder="请输入新密码"
          onChange={(e) => { newPassword = e.target.value; }}
        />
      ),
      onOk: async () => {
        if (!newPassword || newPassword.length < 6) {
          message.error('密码至少6位');
          return Promise.reject();
        }
        await resetSupplierPassword(id!, newPassword);
        message.success('密码已重置');
      },
    });
  };

  if (loading) return <Spin style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <Card title={isEdit ? '编辑供应商' : '新增供应商'}>
      <Form form={form} layout="vertical" initialValues={{ status: 'ACTIVE' }}>
        <Form.Item name="name" label="供应商名称" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="contactName" label="联系人" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="phone" label="手机号" rules={[{ required: true, pattern: /^1\d{10}$/, message: '请输入正确手机号' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="loginName" label="登录账号" rules={[{ required: true }]}>
          <Input disabled={isEdit} />
        </Form.Item>
        {!isEdit && (
          <Form.Item name="password" label="初始密码" rules={[{ required: true, min: 6, message: '密码至少6位' }]}>
            <Input.Password />
          </Form.Item>
        )}
        <Form.Item name="status" label="账号状态">
          <Select options={[
            { value: 'ACTIVE', label: '正常' },
            { value: 'DISABLED', label: '已禁用' },
          ]} />
        </Form.Item>
        <Space>
          <Button type="primary" loading={saving} onClick={handleSubmit}>保存</Button>
          {isEdit && <Button onClick={handleResetPassword}>重置密码</Button>}
          <Button onClick={() => navigate('/suppliers')}>取消</Button>
        </Space>
      </Form>
    </Card>
  );
}
