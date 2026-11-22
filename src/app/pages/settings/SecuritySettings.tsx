import { useState, useEffect } from 'react';
import {
  Key,
  Shield,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Circle,
  Mail,
  Smartphone,
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
  const [_loadingConfig, setLoadingConfig] = useState(true);

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
      if (user?.email) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });
        if (authError) {
          throw new Error('Current password is incorrect.');
        }
      }

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

  const handleSave2FaConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (is2FaEnabled && !twoFactorTarget.trim()) {
      toast.error(
        `Please provide an alternate ${
          twoFactorChannel === 'email' ? 'email' : 'phone number'
        } to receive OTPs`
      );
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
        is2FaEnabled
          ? 'Enabled Two-Factor Authentication'
          : 'Disabled Two-Factor Authentication',
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

  const passwordRules = [
    { met: checks.length, label: 'Minimum 8 characters long' },
    { met: checks.uppercase, label: 'At least one uppercase letter' },
    { met: checks.number, label: 'At least one number' },
    { met: checks.special, label: 'At least one special character' },
  ];

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-200">
      {/* 1. Change Password Card */}
      <section className="space-y-6 rounded-3xl border border-gray-200/90 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#161b22] dark:shadow-xl md:p-8">
        <div className="flex items-start gap-3.5 border-b border-gray-100 pb-5 dark:border-gray-800/80">
          <div
            className={`mt-0.5 rounded-2xl border p-2.5 ${theme.bgSubtle} ${theme.textAccent} ${theme.borderAccent}/30`}
          >
            <Key size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
              Change Password
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Ensure your workspace credentials remain protected.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <form onSubmit={handleUpdatePassword} className="space-y-4 lg:col-span-7">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-2.5 pr-11 font-mono text-xs text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:bg-white dark:border-gray-800 dark:bg-[#0d1117] dark:text-white dark:placeholder:text-gray-500 dark:focus:bg-[#0d1117] ${theme.ringAccent}`}
                />
                <button
                  type="button"
                  aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-2.5 pr-11 font-mono text-xs text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:bg-white dark:border-gray-800 dark:bg-[#0d1117] dark:text-white dark:placeholder:text-gray-500 dark:focus:bg-[#0d1117] ${theme.ringAccent}`}
                />
                <button
                  type="button"
                  aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-2.5 font-mono text-xs text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:bg-white dark:border-gray-800 dark:bg-[#0d1117] dark:text-white dark:placeholder:text-gray-500 dark:focus:bg-[#0d1117] ${theme.ringAccent}`}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPassword || !isFormValid || !currentPassword}
                className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-50 ${theme.btnPrimary}`}
              >
                {savingPassword ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Key size={14} />
                )}
                <span>Update Password</span>
              </button>
            </div>
          </form>

          {/* Checklist */}
          <div className="space-y-3 rounded-2xl border border-gray-200/80 bg-gray-50/80 p-5 dark:border-gray-800/80 dark:bg-[#0d1117] lg:col-span-5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Password Requirements
            </h4>

            <div className="space-y-2 text-xs">
              {passwordRules.map((rule) => (
                <div key={rule.label} className="flex items-center gap-2">
                  {rule.met ? (
                    <CheckCircle2 size={14} className={theme.textAccent} />
                  ) : (
                    <Circle size={14} className="text-gray-300 dark:text-gray-600" />
                  )}
                  <span
                    className={
                      rule.met
                        ? 'font-medium text-gray-800 dark:text-gray-200'
                        : 'text-gray-500 dark:text-gray-500'
                    }
                  >
                    {rule.label}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-2 border-t border-gray-200 pt-2 dark:border-gray-800">
                {checks.matches ? (
                  <CheckCircle2 size={14} className={theme.textAccent} />
                ) : (
                  <Circle size={14} className="text-gray-300 dark:text-gray-600" />
                )}
                <span
                  className={
                    checks.matches
                      ? 'font-medium text-gray-800 dark:text-gray-200'
                      : 'text-gray-500 dark:text-gray-500'
                  }
                >
                  Passwords match
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Real Two-Factor Authentication Card with Destination Channel */}
      <section className="space-y-6 rounded-3xl border border-gray-200/90 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#161b22] dark:shadow-xl md:p-8">
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-5 dark:border-gray-800/80">
          <div className="flex items-start gap-3.5">
            <div
              className={`mt-0.5 rounded-2xl border p-2.5 ${theme.bgSubtle} ${theme.textAccent} ${theme.borderAccent}/30`}
            >
              <Shield size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
                Two-Factor Authentication (2FA)
              </h3>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Enforce a mandatory one-time verification challenge upon signing in.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={is2FaEnabled}
            aria-label="Enable Two-Factor Authentication"
            onClick={() => setIs2FaEnabled(!is2FaEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#161b22] ${
              is2FaEnabled
                ? theme.toggleActive
                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700/70 dark:hover:bg-gray-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                is2FaEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 2FA Destination Channel Setup Form */}
        <form onSubmit={handleSave2FaConfig} className="space-y-5">
          <div
            className={`space-y-4 transition-opacity ${
              is2FaEnabled ? 'opacity-100' : 'pointer-events-none opacity-45'
            }`}
          >
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Select OTP Delivery Channel
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition-all ${
                  twoFactorChannel === 'email'
                    ? `${theme.bgSubtle} ${theme.textAccent} ${theme.borderAccent}/50 shadow-xs`
                    : 'border-gray-200 bg-gray-50/70 text-gray-600 hover:border-gray-300 dark:border-gray-800 dark:bg-[#0d1117] dark:text-gray-400 dark:hover:border-gray-700'
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
                <Mail size={18} className="shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    Alternate Email Address
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    Receive 6-digit codes in inbox
                  </p>
                </div>
              </label>

              <label
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition-all ${
                  twoFactorChannel === 'phone'
                    ? `${theme.bgSubtle} ${theme.textAccent} ${theme.borderAccent}/50 shadow-xs`
                    : 'border-gray-200 bg-gray-50/70 text-gray-600 hover:border-gray-300 dark:border-gray-800 dark:bg-[#0d1117] dark:text-gray-400 dark:hover:border-gray-700'
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
                <Smartphone size={18} className="shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    Phone / SMS
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    Receive verification code on mobile
                  </p>
                </div>
              </label>
            </div>

            {/* Target Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {twoFactorChannel === 'email'
                  ? 'Alternate Email Address'
                  : 'Phone Number (with Country Code)'}{' '}
                *
              </label>
              <input
                type={twoFactorChannel === 'email' ? 'email' : 'tel'}
                required={is2FaEnabled}
                placeholder={
                  twoFactorChannel === 'email'
                    ? 'backup.security@company.com'
                    : '+1 555 123 4567'
                }
                value={twoFactorTarget}
                onChange={(e) => setTwoFactorTarget(e.target.value)}
                className={`w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-2.5 font-mono text-xs text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:bg-white dark:border-gray-800 dark:bg-[#0d1117] dark:text-white dark:placeholder:text-gray-500 dark:focus:bg-[#0d1117] ${theme.ringAccent}`}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving2Fa || (is2FaEnabled && !twoFactorTarget.trim())}
              className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-50 ${theme.btnPrimary}`}
            >
              {saving2Fa ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Shield size={14} />
              )}
              <span>Save 2FA Preferences</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}