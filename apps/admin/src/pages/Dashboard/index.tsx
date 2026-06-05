import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Badge, Spin } from 'antd';
import { Column, Pie, Line } from '@ant-design/plots';
import { fetchDashboard } from '../../services/api';
import type { DashboardData } from '../../types';

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <Spin style={{ display: 'block', margin: '100px auto' }} />;
  }

  return (
    <div>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="今日订单" value={data.todayOrders} suffix="单" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="今日 GMV" value={data.todayGmv / 100} prefix="¥" precision={2} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="新增推广员" value={data.newPromoters} suffix="人" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="佣金支出" value={data.commissionPaid / 100} prefix="¥" precision={2} />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="待处理提现"
              value={data.pendingWithdrawals}
              suffix="笔"
              valueStyle={{ color: '#cf1322' }}
              prefix={<Badge status="error" />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="待派单订单" value={data.pendingDispatchOrders} suffix="单" valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="近7日订单趋势">
            <Line
              data={data.orderTrend}
              xField="date"
              yField="count"
              height={280}
              smooth
              point={{ size: 4 }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="商品销量 TOP5">
            <Column
              data={data.topProducts}
              xField="name"
              yField="sales"
              height={280}
              label={{ position: 'top' }}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="订单状态分布">
            <Pie
              data={data.statusDistribution}
              angleField="count"
              colorField="status"
              height={280}
              radius={0.8}
              innerRadius={0.5}
              label={{ text: 'status', style: { fontSize: 12 } }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
