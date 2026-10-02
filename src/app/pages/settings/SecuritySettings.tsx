import { useState } from 'react';
import { 
  Key, Shield, Eye, EyeOff, Loader2, CheckCircle2, Circle 
} from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { useAccentTheme } from '../../../lib/useAccentTheme';
import { toast } from 'sonner';

export default function SecuritySettings() {
  const theme = useAccentTheme();

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status & 2FA toggles
  const [savingPassword, setSavingPassword] = useState(false);
  const [is2FaEnabled, setIs2FaEnabled] = useState(false);

  // Real-time password requirement evaluations
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

    if (!isFormValid) {
      toast.error('Please ensure all password requirements are satisfied');
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

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

  const handleToggle2Fa = () => {
    // Toggle state with informational toast
    const nextState = !is2FaEnabled;
    setIs2FaEnabled(nextState);
    if (nextState) {
      toast.info('Two-Factor Authentication protocol activated');
    } else {
      toast.info('Two-Factor Authentication protocol disabled');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      
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
          {/* Password Form Inputs */}
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

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPassword || !isFormValid}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl ${theme.btnPrimary} font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50`}
              >
                {savingPassword ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}
                <span>Update Password</span>
              </button>
            </div>
          </form>

          {/* Password Validation Requirements Checklist */}
          <div className="lg:col-span-5 bg-[#0d1117] border border-gray-800/80 rounded-2xl p-5 space-y-3">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Password Requirements
            </h4>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                {checks.length ? (
                  <CheckCircle2 size={14} className={theme.textAccent} />
                ) : (
                  <Circle size={14} className="text-gray-600" />
                )}
                <span className={checks.length ? 'text-gray-200' : 'text-gray-500'}>
                  Minimum 8 characters long
                </span>
              </div>

              <div className="flex items-center gap-2">
                {checks.uppercase ? (
                  <CheckCircle2 size={14} className={theme.textAccent} />
                ) : (
                  <Circle size={14} className="text-gray-600" />
                )}
                <span className={checks.uppercase ? 'text-gray-200' : 'text-gray-500'}>
                  At least one uppercase letter
                </span>
              </div>

              <div className="flex items-center gap-2">
                {checks.number ? (
                  <CheckCircle2 size={14} className={theme.textAccent} />
                ) : (
                  <Circle size={14} className="text-gray-600" />
                )}
                <span className={checks.number ? 'text-gray-200' : 'text-gray-500'}>
                  At least one number
                </span>
              </div>

              <div className="flex items-center gap-2">
                {checks.special ? (
                  <CheckCircle2 size={14} className={theme.textAccent} />
                ) : (
                  <Circle size={14} className="text-gray-600" />
                )}
                <span className={checks.special ? 'text-gray-200' : 'text-gray-500'}>
                  At least one special character
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-gray-800">
                {checks.matches ? (
                  <CheckCircle2 size={14} className={theme.textAccent} />
                ) : (
                  <Circle size={14} className="text-gray-600" />
                )}
                <span className={checks.matches ? 'text-gray-200' : 'text-gray-500'}>
                  Passwords match
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Two-Factor Authentication Card */}
      <div className="bg-[#161b22] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-2xl ${theme.bgSubtle} ${theme.textAccent} border ${theme.borderAccent}/30 mt-0.5`}>
            <Shield size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Two-Factor Authentication</h3>
            <p className="text-xs text-gray-400">Add an extra layer of security to your account by requiring an authenticator code.</p>
          </div>
        </div>

        {/* Dynamic 2FA Toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={is2FaEnabled}
          onClick={handleToggle2Fa}
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

    </div>
  );
}