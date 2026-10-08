import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RequireAuth() {
  const { session, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Enforce 2FA verification gate on existing sessions (unless device is trusted)
  const is2FaVerified = sessionStorage.getItem('pf_2fa_verified') === 'true' || localStorage.getItem('pf_trusted_device') === 'true';
  if (user?.is_2fa_enabled && !is2FaVerified) {
    return (
      <Navigate 
        to="/2fa" 
        state={{ 
          userId: user.id, 
          email: user.email,
          channel: user.two_factor_channel || 'email',
          maskedTarget: user.two_factor_target || user.email 
        }} 
        replace 
      />
    );
  }

  return <Outlet />;
}