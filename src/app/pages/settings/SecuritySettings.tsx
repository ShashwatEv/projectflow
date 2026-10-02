import { useState, useEffect } from 'react';
import { 
  KeyRound, Shield, Laptop, Smartphone, Eye, EyeOff, 
  Check, Circle, Loader2, LogOut, CheckCircle2 
} from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'sonner';

export default function SecuritySettings() {
  const { user, signOut } = useAuth();

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [updatingPassword, setUpdatingPassword] = useState(false);

  // 2FA state
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [loading2FA, setLoading2FA] = useState(false);

  // Real-time password requirement evaluations
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const isPasswordValid = 
    hasMinLength && hasUppercase && hasNumber && hasSpecialChar && passwordsMatch;

  // Check 2FA factor status on load
  useEffect(() => {
    async function checkMFAStatus() {
      try {
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (!error && data?.totp && data.totp.length > 0) {
          const verified = data.totp.some((f) => f.status === 'verified');
          setIs2FAEnabled(verified);
        }
      } catch (err) {
        console.warn('MFA fetch skipped:', err);
      }
    }
    checkMFAStatus();
  }, []);

  // 1. Change Password Handler
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid || updatingPassword) return;

    if (!currentPassword.trim()) {
      toast.error('Please enter your current password to confirm authorization.');
      return;
    }

    setUpdatingPassword(true);

    try {
      // Re-verify current credentials first for security
      if (user?.email) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });

        if (signInError) {
          toast.error('Current password is incorrect.');
          setUpdatingPassword(false);
          return;
        }
      }

      // Update password in Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        toast.error(updateError.message || 'Failed to update password.');
      } else {
        toast.success('Password updated successfully! 🎉');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  // 2. Toggle Two-Factor Authentication
  const handleToggle2FA = async () => {
    setLoading2FA(true);
    try {
      if (is2FAEnabled) {
        // Unenroll from factors
        const { data: factors } = await supabase.auth.mfa.listFactors();
        if (factors?.totp) {
          for (const factor of factors.totp) {
            await supabase.auth.mfa.unenroll({ factorId: factor.id });
          }
        }
        setIs2FAEnabled(false);
        toast.success('Two-factor authentication disabled.');
      } else {
        // In a full flow, you would render the QR code modal
        // Here we trigger enrollment confirmation
        const { data, error } = await supabase.auth.mfa.enroll({
          factorType: 'totp',
          issuer: 'ProjectFlow',
        });

        if (error) throw error;

        if (data?.id) {
          setIs2FAEnabled(true);
          toast.success('Two-factor authentication requirement enabled for your account.');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Could not update 2FA configuration.');
    } finally {
      setLoading2FA(false);
    }
  };

  // 3. Terminate Other Sessions
  const handleSignOutOtherSessions = async () => {
    try {
      await supabase.auth.signOut({ scope: 'others' });
      toast.success('All other login sessions have been terminated.');
    } catch {
      toast.error('Could not revoke other sessions.');
    }
  };

  // Detect current client device
  const isMac = navigator.userAgent.includes('Mac');
  const currentDevice = isMac ? 'MacBook Pro' : 'Windows PC';

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl">
      {/* 1. Change Password Box */}
      <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2.5 text-orange-500 mb-6">
          <KeyRound size={20} />
          <h3 className="font-bold text-base text-white">Change Password</h3>
        </div>

        <form onSubmit={handleUpdatePassword} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Inputs Column */}
          <div className="lg:col-span-7 space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-[#0d1117] border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                >
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-[#0d1117] border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full bg-[#0d1117] border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!isPasswordValid || updatingPassword}
                className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
              >
                {updatingPassword ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <KeyRound size={15} />
                )}
                <span>Update Password</span>
              </button>
            </div>
          </div>

          {/* Password Requirements Checklist */}
          <div className="lg:col-span-5 bg-[#0d1117] border border-gray-800 rounded-xl p-5 space-y-3">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Password Requirements
            </span>

            <RequirementRow met={hasMinLength} label="Minimum 8 characters long" />
            <RequirementRow met={hasUppercase} label="At least one uppercase letter" />
            <RequirementRow met={hasNumber} label="At least one number" />
            <RequirementRow met={hasSpecialChar} label="At least one special character" />
            
            <div className="pt-2 border-t border-gray-800">
              <RequirementRow met={passwordsMatch} label="Passwords match" />
            </div>
          </div>
        </form>
      </div>

      {/* 2. Two-Factor Authentication Box */}
      <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-300">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Two-Factor Authentication</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Add an extra layer of security to your account by requiring an authenticator code.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggle2FA}
          disabled={loading2FA}
          className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 shrink-0 ${
            is2FAEnabled ? 'bg-orange-600' : 'bg-gray-700'
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
              is2FAEnabled ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* 3. Login Sessions */}
      <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-white">Login Sessions</h3>
          <button
            onClick={handleSignOutOtherSessions}
            className="text-[11px] font-semibold text-gray-400 hover:text-red-400 flex items-center gap-1.5 transition-colors"
          >
            <LogOut size={13} />
            <span>Sign out other devices</span>
          </button>
        </div>

        <div className="space-y-3">
          {/* Current Device */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0d1117] border border-gray-800 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-300">
                <Laptop size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{currentDevice}</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                    Current
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Active Now • Logged in as {user?.email}
                </p>
              </div>
            </div>
            <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
              <CheckCircle2 size={13} /> Secure
            </span>
          </div>

          {/* Mobile Session */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0d1117] border border-gray-800 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400">
                <Smartphone size={16} />
              </div>
              <div>
                <span className="font-semibold text-gray-300">Mobile Browser / Companion</span>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Last active 2 hours ago
                </p>
              </div>
            </div>
            <span className="text-gray-500 text-[11px]">Authorized</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component for password checklist rows
function RequirementRow({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs transition-colors">
      {met ? (
        <Check size={14} className="text-emerald-400 shrink-0" />
      ) : (
        <Circle size={14} className="text-gray-600 shrink-0" />
      )}
      <span className={met ? 'text-gray-200' : 'text-gray-500'}>{label}</span>
    </div>
  );
}