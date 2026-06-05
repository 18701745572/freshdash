import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import AuthGuard from './components/AuthGuard';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductManage from './pages/ProductManage';
import ProductForm from './pages/ProductForm';
import OrderManage from './pages/OrderManage';
import OrderDetail from './pages/OrderDetail';
import SupplierManage from './pages/SupplierManage';
import SupplierForm from './pages/SupplierForm';
import PromoterManage from './pages/PromoterManage';
import PromoterCommissions from './pages/PromoterCommissions';
import WithdrawalManage from './pages/WithdrawalManage';
import DiscountRules from './pages/DiscountRules';
import BannerManage from './pages/BannerManage';
import FarmPlots from './pages/FarmPlots';
import FarmPlotForm from './pages/FarmPlotForm';
import FarmLogs from './pages/FarmLogs';
import FarmOrders from './pages/FarmOrders';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <AuthGuard>
                <AdminLayout />
              </AuthGuard>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<ProductManage />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/:id/edit" element={<ProductForm />} />
            <Route path="/orders" element={<OrderManage />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/suppliers" element={<SupplierManage />} />
            <Route path="/suppliers/new" element={<SupplierForm />} />
            <Route path="/suppliers/:id/edit" element={<SupplierForm />} />
            <Route path="/promoters" element={<PromoterManage />} />
            <Route path="/promoters/:id/commissions" element={<PromoterCommissions />} />
            <Route path="/withdrawals" element={<WithdrawalManage />} />
            <Route path="/discount-rules" element={<DiscountRules />} />
            <Route path="/banners" element={<BannerManage />} />
            <Route path="/farm-plots" element={<FarmPlots />} />
            <Route path="/farm-plots/new" element={<FarmPlotForm />} />
            <Route path="/farm-plots/:id/edit" element={<FarmPlotForm />} />
            <Route path="/farm-plots/:id/logs" element={<FarmLogs />} />
            <Route path="/farm-orders" element={<FarmOrders />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
