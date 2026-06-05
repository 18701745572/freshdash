import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Button, Spin, message } from 'antd';
import { fetchOrder } from '../../services/api';
import type { AdminOrder } from '../../types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../constants/order';
import { formatMoney } from '../../utils/format';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchOrder(id)
      .then(setOrder)
      .catch((e) => message.error(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !order) return <Spin style={{ display: 'block', margin: '100px auto' }} />;

  const { address } = order;

  return (
    <div>
      <Button style={{ marginBottom: 16 }} onClick={() => navigate('/orders')}>返回列表</Button>
      <Card title={`订单 ${order.orderNo}`} style={{ marginBottom: 16 }}>
        <Descriptions column={3}>
          <Descriptions.Item label="状态">
            <Tag color={ORDER_STATUS_COLORS[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="用户">{order.userNickName}</Descriptions.Item>
          <Descriptions.Item label="下单时间">{order.createdAt}</Descriptions.Item>
          <Descriptions.Item label="派单供应商">{order.supplierName || '未派单'}</Descriptions.Item>
          <Descriptions.Item label="发货时间">{order.shippedAt || '-'}</Descriptions.Item>
          <Descriptions.Item label="支付流水">{order.wxTransactionId || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>
      <Card title="收货信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="收货人">{address.name}</Descriptions.Item>
          <Descriptions.Item label="手机号">{address.phone}</Descriptions.Item>
          <Descriptions.Item label="地址" span={2}>
            {address.province}{address.city}{address.district}{address.detail}
          </Descriptions.Item>
          <Descriptions.Item label="备注">{order.remark || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>
      <Card title="商品清单" style={{ marginBottom: 16 }}>
        <Table
          rowKey="id"
          pagination={false}
          dataSource={order.items}
          columns={[
            {
              title: '商品',
              render: (_, item) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img src={item.productImage} alt="" style={{ width: 40, height: 40, objectFit: 'cover' }} />
                  {item.productName}
                </div>
              ),
            },
            { title: '单价', dataIndex: 'price', render: (v: number) => formatMoney(v) },
            { title: '数量', dataIndex: 'quantity' },
            { title: '小计', dataIndex: 'subtotal', render: (v: number) => formatMoney(v) },
          ]}
        />
      </Card>
      <Card title="价格明细">
        <Descriptions column={1}>
          <Descriptions.Item label="商品总价">{formatMoney(order.totalAmount)}</Descriptions.Item>
          <Descriptions.Item label="满减优惠">-{formatMoney(order.discountAmount)}</Descriptions.Item>
          <Descriptions.Item label="实付金额"><strong>{formatMoney(order.actualAmount)}</strong></Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
