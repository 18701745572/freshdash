import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  if (!token && !localStorage.getItem('admin_token')) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
