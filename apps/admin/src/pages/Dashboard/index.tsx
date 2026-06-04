import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import { ArrowUpOutlined } from '@ant-design/icons';

const Dashboard: React.FC = () => {
  return (
    <div>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="今日订单" value={128} suffix="单" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="今日销售额" value={5680} prefix="¥" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="待发货订单" value={12} suffix="单" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="新注册推广员" value={5} suffix="人" />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="订单趋势">
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
              图表区域（接入图表库后展示）
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="商品销量 TOP5">
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
              图表区域（接入图表库后展示）
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
