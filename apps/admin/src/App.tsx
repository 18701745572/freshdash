import { useState } from 'react'
import { Button, Layout, Menu, theme } from 'antd'
import {
  DashboardOutlined,
  ShoppingOutlined,
  TeamOutlined,
  TruckOutlined,
  UserOutlined,
  PayCircleOutlined
} from '@ant-design/icons'

const { Header, Sider, Content } = Layout

function App() {
  const [collapsed, setCollapsed] = useState(false)
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={[
            { key: '1', icon: <DashboardOutlined />, label: '经营看板' },
            { key: '2', icon: <ShoppingOutlined />, label: '商品管理' },
            { key: '3', icon: <TruckOutlined />, label: '订单管理' },
            { key: '4', icon: <TeamOutlined />, label: '供应商管理' },
            { key: '5', icon: <UserOutlined />, label: '推广员管理' },
            { key: '6', icon: <PayCircleOutlined />, label: '提现审核' },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          >
            {collapsed ? '展开' : '收起'}
          </Button>
          <span style={{ fontSize: 18, fontWeight: 600 }}>鲜达生鲜 - 管理后台</span>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <h2>欢迎使用鲜达生鲜管理后台</h2>
          <p>请先完善各模块功能。</p>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
