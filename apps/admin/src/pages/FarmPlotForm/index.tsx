import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Button, Space, message, Spin } from 'antd';
import { fetchFarmPlots, saveFarmPlot } from '../../services/api';
import { centsToYuan, yuanToCents } from '../../utils/format';

export default function FarmPlotForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchFarmPlots()
      .then((plots) => {
        const plot = plots.find((p) => p.id === id);
        if (plot) {
          form.setFieldsValue({
            ...plot,
            quarterPrice: centsToYuan(plot.quarterPrice),
            yearPrice: centsToYuan(plot.yearPrice),
          });
        }
      })
      .finally(() => setLoading(false));
  }, [id, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      await saveFarmPlot({
        id,
        name: values.name,
        area: values.area,
        quarterPrice: yuanToCents(values.quarterPrice),
        yearPrice: yuanToCents(values.yearPrice),
        stock: values.stock,
        rtmpUrl: values.rtmpUrl,
      });
      message.success('保存成功');
      navigate('/farm-plots');
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spin style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <Card title={id ? '编辑地块' : '新增地块'}>
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="地块名称" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="area" label="面积（平方米）" rules={[{ required: true }]}>
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="quarterPrice" label="季度价格（元）" rules={[{ required: true }]}>
          <InputNumber min={0} precision={2} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="yearPrice" label="年价格（元）" rules={[{ required: true }]}>
          <InputNumber min={0} precision={2} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="stock" label="可认养数量" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="rtmpUrl" label="RTMP 直播地址">
          <Input placeholder="rtmp://..." />
        </Form.Item>
        <Space>
          <Button type="primary" loading={saving} onClick={handleSubmit}>保存</Button>
          <Button onClick={() => navigate('/farm-plots')}>取消</Button>
        </Space>
      </Form>
    </Card>
  );
}
