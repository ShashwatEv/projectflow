import { useState, useEffect } from 'react';
import { 
  Key, Shield, Eye, EyeOff, Loader2, CheckCircle2, Circle, 
  Mail, Phone, Smartphone, AlertCircle 
} from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import { recordAuditLog } from '../../../lib/auditLogger';
import { useAccentTheme } from '../../../lib/useAccentTheme';
import { toast } from 'sonner';

export default function SecuritySettings() {
  const theme = useAccentTheme();
  const { user } = useAuth();

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // 2FA Configuration state
  const [is2FaEnabled, setIs2FaEnabled] = useState(false);
  const [twoFactorChannel, setTwoFactorChannel] = useState<'email' | 'phone'>('email');
  const [twoFactorTarget, setTwoFactorTarget] = useState('');
  const [saving2Fa, setSaving2Fa] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Load existing 2FA configuration from users table
  useEffect(() => {
    async function loadSecurityConfig() {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('users')
          .select('is_2fa_enabled, two_factor_channel, two_factor_target')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setIs2FaEnabled(Boolean(data.is_2fa_enabled));
          setTwoFactorChannel(data.two_factor_channel === 'phone' ? 'phone' : 'email');
          setTwoFactorTarget(data.two_factor_target || '');
        }
      } catch (err) {
        console.error('Failed to load security preferences:', err);
      } finally {
        setLoadingConfig(false);
      }
    }

    loadSecurityConfig();
  }, [user?.id]);

  // Password requirement evaluations
  const checks = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
    matches: newPassword.length > 0 && newPassword === confirmPassword,
  };

  const isFormValid = 
    checks.length && 
    checks.uppercase && 
    checks.number && 
    checks.special && 
    checks.matches;

  // Real Password Change Handler
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error('Please enter your current password to confirm authorization');
      return;
    }

    if (!isFormValid) {
      toast.error('Please ensure all password requirements are satisfied');
      return;
    }

    setSavingPassword(true);
    try {
      // 1. Re-authenticate with current password to prevent unauthorized takeover
      if (user?.email) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });
        if (authError) {
          throw new Error('Current password is incorrect.');
        }
      }

      // 2. Apply updated password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      await recordAuditLog('Password changed successfully', 'security');

      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  // Real 2FA Toggle & Destination Channel Handler
  const handleSave2FaConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (is2FaEnabled && !twoFactorTarget.trim()) {
      toast.error(`Please provide an alternate ${twoFactorChannel === 'email' ? 'email' : 'phone number'} to receive OTPs`);
      return;
    }

    setSaving2Fa(true);
    try {
      const payload = {
        is_2fa_enabled: is2FaEnabled,
        two_factor_channel: twoFactorChannel,
        two_factor_target: twoFactorTarget.trim(),
      };

      const { error } = await supabase
        .from('users')
        .update(payload)
        .eq('id', user.id);

      if (error) throw error;

      await recordAuditLog(
        is2FaEnabled ? 'Enabled Two-Factor Authentication' : 'Disabled Two-Factor Authentication',
        'security',
        { channel: twoFactorChannel, target: twoFactorTarget }
      );

      toast.success(
        is2FaEnabled
          ? `2FA enabled! Future logins will require OTP sent to ${twoFactorTarget}`
          : 'Two-Factor Authentication disabled'
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to update 2FA configuration');
    } finally {
      setSaving2Fa(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-200">
      
      {/* 1. Change Password Card */}
      <div className="bg-[#161b22] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex items-start gap-3 border-b border-gray-800/80 pb-5">
          <div className={`p-2.5 rounded-2xl ${theme.bgSubtle} ${theme.textAccent} border ${theme.borderAccent}/30 mt-0.5`}>
            <Key size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Change Password</h2>
            <p className="text-xs text-gray-400">Ensure your workspace credentials remain protected.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form onSubmit={handleUpdatePassword} className="lg:col-span-7 space-y-4">
            
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`w-full bg-[#0d1117] border border-gray-800 rounded-xl px-4 py-2.5 pr-11 text-xs text-white outline-none ${theme.ringAccent} transition-colors font-mono`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full bg-[#0d1117] border border-gray-800 rounded-xl px-4 py-2.5 pr-11 text-xs text-white outline-none ${theme.ringAccent} transition-colors font-mono`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Confirm New Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full bg-[#0d1117] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none ${theme.ringAccent} transition-colors font-mono`}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPassword || !isFormValid || !currentPassword}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl ${theme.btnPrimary} font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50`}
              >
                {savingPassword ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}
                <span>Update Password</span>
              </button>
            </div>
          </form>

          {/* Checklist */}
          <div className="lg:col-span-5 bg-[#0d1117] border border-gray-800/80 rounded-2xl p-5 space-y-3">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Password Requirements
            </h4>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                {checks.length ? <CheckCircle2 size={14} className={theme.textAccent} /> : <Circle size={14} className="text-gray-600" />}
                <span className={checks.length ? 'text-gray-200' : 'text-gray-500'}>Minimum 8 characters long</span>
              </div>
              <div className="flex items-center gap-2">
                {checks.uppercase ? <CheckCircle2 size={14} className={theme.textAccent} /> : <Circle size={14} className="text-gray-600" />}
                <span className={checks.uppercase ? 'text-gray-200' : 'text-gray-500'}>At least one uppercase letter</span>
              </div>
              <div className="flex items-center gap-2">
                {checks.number ? <CheckCircle2 size={14} className={theme.textAccent} /> : <Circle size={14} className="text-gray-600" />}
                <span className={checks.number ? 'text-gray-200' : 'text-gray-500'}>At least one number</span>
              </div>
              <div className="flex items-center gap-2">
                {checks.special ? <CheckCircle2 size={14} className={theme.textAccent} /> : <Circle size={14} className="text-gray-600" />}
                <span className={checks.special ? 'text-gray-200' : 'text-gray-500'}>At least one special character</span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-gray-800">
                {checks.matches ? <CheckCircle2 size={14} className={theme.textAccent} /> : <Circle size={14} className="text-gray-600" />}
                <span className={checks.matches ? 'text-gray-200' : 'text-gray-500'}>Passwords match</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Real Two-Factor Authentication Card with Destination Channel */}
      <div className="bg-[#161b22] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-gray-800/80 pb-5">
          <div className="flex items-start gap-3.5">
            <div className={`p-2.5 rounded-2xl ${theme.bgSubtle} ${theme.textAccent} border ${theme.borderAccent}/30 mt-0.5`}>
              <Shield size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Two-Factor Authentication (2FA)</h3>
              <p className="text-xs text-gray-400">
                Enforce a mandatory one-time verification challenge upon signing in.
              </p>
            </div>
          </div>

          {/* Toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={is2FaEnabled}
            onClick={() => setIs2FaEnabled(!is2FaEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              is2FaEnabled ? theme.toggleActive : 'bg-gray-700/60'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                is2FaEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 2FA Destination Channel Setup Form */}
        <form onSubmit={handleSave2FaConfig} className="space-y-5">
          <div className={`space-y-4 transition-opacity ${is2FaEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <label className="block text-xs font-semibold text-gray-300">
              Select OTP Delivery Channel
            </label>

            {/* Radio options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                  twoFactorChannel === 'email'
                    ? `${theme.bgSubtle}${theme.textAccent} border-indigo-500/50 shadow-sm`
                    : 'bg-[#0d1117] border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="2fa-channel"
                  value="email"
                  checked={twoFactorChannel === 'email'}
                  onChange={() => setTwoFactorChannel('email')}
                  className="hidden"
                />
                <Mail size={18} />
                <div>
                  <p className="font-bold text-xs text-white">Alternate Email Address</p>
                  <p className="text-[10px] text-gray-400">Receive 6-digit codes in inbox</p>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                  twoFactorChannel === 'phone'
                    ? `${theme.bgSubtle}${theme.textAccent} border-indigo-500/50 shadow-sm`
                    : 'bg-[#0d1117] border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="2fa-channel"
                  value="phone"
                  checked={twoFactorChannel === 'phone'}
                  onChange={() => setTwoFactorChannel('phone')}
                  className="hidden"
                />
                <Smartphone size={18} />
                <div>
                  <p className="font-bold text-xs text-white">Phone / SMS</p>
                  <p className="text-[10px] text-gray-400">Receive verification code on mobile</p>
                </div>
              </label>
            </div>

            {/* Target Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">
                {twoFactorChannel === 'email' ? 'Alternate Email Address' : 'Phone Number (with Country Code)'} *
              </label>
              <input
                type={twoFactorChannel === 'email' ? 'email' : 'tel'}
                required={is2FaEnabled}
                placeholder={twoFactorChannel === 'email' ? 'backup.security@company.com' : '+1 555 123 4567'}
                value={twoFactorTarget}
                onChange={(e) => setTwoFactorTarget(e.target.value)}
                className={`w-full bg-[#0d1117] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none ${theme.ringAccent} transition-colors font-mono`}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving2Fa || (is2FaEnabled && !twoFactorTarget.trim())}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl ${theme.btnPrimary} font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50`}
            >
              {saving2Fa ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
              <span>Save 2FA Preferences</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}