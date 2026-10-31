import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { SUPER_ADMIN_EMAIL } from '../lib/constants';
export { SUPER_ADMIN_EMAIL, isSuperAdmin } from '../lib/constants';

export function useVerificationGate() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isSuperAdmin = user?.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL;
  const isVerified = Boolean(user?.is_verified || isSuperAdmin);

  const requireVerification = (
    actionDescription: string,
    onAllowed: () => void | Promise<void>
  ) => {
    if (isVerified) {
      onAllowed();
      return;
    }

    toast.error('Identity Verification Required', {
      description: `Please verify your email address to ${actionDescription}.`,
      action: {
        label: 'Verify Now',
        onClick: () => navigate('/settings'),
      },
    });
  };

  return {
    isVerified,
    isSuperAdmin,
    requireVerification,
  };
}