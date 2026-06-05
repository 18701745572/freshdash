import { useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ProLayout } from '@ant-design/pro-components';
import {
  DashboardOutlined,
  ShoppingOutlined,
  TeamOutlined,
  TruckOutlined,
  UserOutlined,
  PayCircleOutlined,
  GiftOutlined,
  PictureOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { Dropdown, Badge } from 'antd';
import { useAuthStore } from '../stores/auth';
import { fetchDashboard } from '../services/api';
import { useEffect, useState } from 'react';

const allMenuRoutes = [
  { path: '/dashboard', name: '经营看板', icon: <DashboardOutlined /> },
  { path: '/products', name: '商品管理', icon: <ShoppingOutlined /> },
  { path: '/orders', name: '订单管理', icon: <TruckOutlined /> },
  { path: '/suppliers', name: '供应商管理', icon: <TeamOutlined /> },
  { path: '/discount-rules', name: '满减活动', icon: <GiftOutlined /> },
  { path: '/promoters', name: '推广员管理', icon: <UserOutlined /> },
  { path: '/withdrawals', name: '提现审核', icon: <PayCircleOutlined />, badge: true },
  { path: '/banners', name: '轮播图管理', icon: <PictureOutlined /> },
  { path: '/farm-plots', name: '认养地块', icon: <EnvironmentOutlined /> },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0);

  useEffect(() => {
    fetchDashboard()
      .then((data) => setPendingWithdrawals(data.pendingWithdrawals))
      .catch(() => {});
  }, [location.pathname]);

  const menuRoutes = useMemo(() => {
    if (user?.role === 'operator') {
      return allMenuRoutes.filter((r) => !['/farm-plots'].includes(r.path));
    }
    return allMenuRoutes;
  }, [user?.role]);

  return (
    <ProLayout
      title="鲜达生鲜"
      logo={false}
      layout="mix"
      fixSiderbar
      location={{ pathname: location.pathname }}
      route={{ path: '/', routes: menuRoutes }}
      menuItemRender={(item, dom) => (
        <div
          onClick={() => item.path && navigate(item.path)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          {dom}
          {item.badge && pendingWithdrawals > 0 && (
            <Badge count={pendingWithdrawals} size="small" style={{ marginRight: 8 }} />
          )}
        </div>
      )}
      avatarProps={{
        title: user?.name || '管理员',
        render: (_, dom) => (
          <Dropdown
            menu={{
              items: [
                { key: 'logout', label: '退出登录', onClick: () => { logout(); navigate('/login'); } },
              ],
            }}
          >
            {dom}
          </Dropdown>
        ),
      }}
      breadcrumbRender={(routers = []) => [
        { path: '/dashboard', breadcrumbName: '首页' },
        ...routers,
      ]}
    >
      <Outlet />
    </ProLayout>
  );
}
