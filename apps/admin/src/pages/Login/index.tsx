import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormCheckbox, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
import { adminLogin } from '../../services/api';
import { useAuthStore } from '../../stores/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (values: { username: string; password: string; remember?: boolean }) => {
    setLoading(true);
    try {
      const res = await adminLogin(values.username, values.password);
      setAuth(res.token, res.user, values.remember);
      message.success('登录成功');
      navigate(from, { replace: true });
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', background: 'linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)' }}>
      <LoginForm
        title="鲜达生鲜"
        subTitle="管理后台登录"
        onFinish={handleSubmit}
        loading={loading}
        style={{ maxWidth: 400, margin: '0 auto', paddingTop: 120 }}
      >
        <ProFormText
          name="username"
          fieldProps={{ size: 'large', prefix: <UserOutlined /> }}
          placeholder="用户名：admin"
          rules={[{ required: true, message: '请输入用户名' }]}
        />
        <ProFormText.Password
          name="password"
          fieldProps={{ size: 'large', prefix: <LockOutlined /> }}
          placeholder="密码：admin123"
          rules={[{ required: true, message: '请输入密码' }]}
        />
        <ProFormCheckbox name="remember">记住密码</ProFormCheckbox>
      </LoginForm>
      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.8)', marginTop: 16, fontSize: 12 }}>
        演示账号：admin / admin123 &nbsp;|&nbsp; operator / operator123
      </div>
    </div>
  );
}
