import { useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Button, Layout, Menu, theme } from 'antd'
import {
  DashboardOutlined,
  ShoppingOutlined,
  TeamOutlined,
  TruckOutlined,
  UserOutlined,
  PayCircleOutlined
} from '@ant-design/icons'
import Dashboard from './pages/Dashboard'
import ProductManage from './pages/ProductManage'
import OrderManage from './pages/OrderManage'

const { Header, Sider, Content } = Layout

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '经营看板' },
  { key: '/products', icon: <ShoppingOutlined />, label: '商品管理' },
  { key: '/orders', icon: <TruckOutlined />, label: '订单管理' },
  { key: '/suppliers', icon: <TeamOutlined />, label: '供应商管理' },
  { key: '/promoters', icon: <UserOutlined />, label: '推广员管理' },
  { key: '/withdrawals', icon: <PayCircleOutlined />, label: '提现审核' },
]

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
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
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
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
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<ProductManage />} />
            <Route path="/orders" element={<OrderManage />} />
            <Route path="/suppliers" element={<div>供应商管理（待开发）</div>} />
            <Route path="/promoters" element={<div>推广员管理（待开发）</div>} />
            <Route path="/withdrawals" element={<div>提现审核（待开发）</div>} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App
