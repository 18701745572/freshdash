import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Timeline, Button, Modal, Form, Input, DatePicker, message, Spin, Image, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { fetchFarmLogs, addFarmLog } from '../../services/api';
import type { FarmLog } from '../../types';
import ImageUpload from '../../components/ImageUpload';
import dayjs from 'dayjs';

export default function FarmLogs() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<FarmLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const loadData = () => {
    if (!id) return;
    fetchFarmLogs(id).then(setLogs).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAdd = async () => {
    const values = await form.validateFields();
    await addFarmLog(id!, {
      date: values.date.format('YYYY-MM-DD'),
      content: values.content,
      images: values.images || [],
    });
    message.success('添加成功');
    setModalOpen(false);
    form.resetFields();
    loadData();
  };

  if (loading) return <Spin style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={() => navigate('/farm-plots')}>返回列表</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>追加记录</Button>
      </Space>
      <Timeline
        items={logs.map((log) => ({
          children: (
            <div>
              <div style={{ fontWeight: 600 }}>{log.date}</div>
              <div>{log.content}</div>
              {log.images.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <Image.PreviewGroup>
                    {log.images.map((img, i) => (
                      <Image key={i} src={img} width={80} height={60} style={{ marginRight: 8, objectFit: 'cover' }} />
                    ))}
                  </Image.PreviewGroup>
                </div>
              )}
            </div>
          ),
        }))}
      />
      <Modal title="追加农事记录" open={modalOpen} onOk={handleAdd} onCancel={() => setModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="date" label="日期" rules={[{ required: true }]} initialValue={dayjs()}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="images" label="图片">
            <ImageUpload maxCount={5} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
