import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getSafeReturnPath } from '../../lib/authRedirect';
import { SlidingLoader } from './SlidingLoader';

export default function RequireAuth() {
  const { session, user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [authReturnPath, setAuthReturnPath] = useState<string | null>(null);
  const [dismissedLoader, setDismissedLoader] = useState(false);
  const is2FaVerified =
    sessionStorage.getItem('pf_2fa_verified') === 'true' ||
    localStorage.getItem('pf_trusted_device') === 'true';
  const needsTwoFactor = Boolean(user?.is_2fa_enabled && !is2FaVerified);
  const pendingWebReturn = sessionStorage.getItem('pf_web_auth_return_to');

  useEffect(() => {
    if (
      loading ||
      !session ||
      needsTwoFactor ||
      location.pathname !== '/dashboard' ||
      !pendingWebReturn
    ) {
      return;
    }
    sessionStorage.removeItem('pf_web_auth_return_to');
    const target = getSafeReturnPath(pendingWebReturn);
    if (target !== '/dashboard') setAuthReturnPath(target);
  }, [loading, location.pathname, needsTwoFactor, pendingWebReturn, session]);

  useEffect(() => {
    if (!authReturnPath) return;
    setAuthReturnPath(null);
    navigate(authReturnPath, { replace: true });
  }, [authReturnPath, navigate]);

  if (loading && !dismissedLoader) {
    return (
      <SlidingLoader
        onComplete={() => setDismissedLoader(true)}
        autoDismissMs={3000}
      />
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Enforce 2FA verification gate on existing sessions (unless device is trusted)
  if (needsTwoFactor) {
    return (
      <Navigate
        to="/2fa"
        state={{
          userId: user?.id,
          email: user?.email || '',
          channel: user?.two_factor_channel || 'email',
          maskedTarget: user?.two_factor_target || user?.email || '',
          returnTo: getSafeReturnPath(pendingWebReturn || location),
        }}
        replace
      />
    );
  }

  return <Outlet />;
}