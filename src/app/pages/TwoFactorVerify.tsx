import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Loader2, ArrowLeft, RefreshCw, KeyRound } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { recordAuditLog } from '../../lib/auditLogger';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { toast } from 'sonner';

export default function TwoFactorVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useAccentTheme();

  // Retrieve user metadata passed from Login redirect
  const userId = location.state?.userId;
  const userEmail = location.state?.email;
  const deliveryChannel = location.state?.channel || 'email';
  const maskedTarget = location.state?.maskedTarget || userEmail;

  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    // If entered directly without session intent, bounce back to login
    if (!userId || !userEmail) {
      navigate('/login', { replace: true });
    }
  }, [userId, userEmail, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length !== 6) {
      toast.error('Please enter a valid 6-digit verification code');
      return;
    }

    setVerifying(true);
    try {
      // 1. Verify against Supabase record
      const { data: userData, error } = await supabase
        .from('users')
        .select('two_factor_otp, two_factor_otp_expires_at')
        .eq('id', userId)
        .single();

      if (error || !userData) {
        throw new Error('Verification session expired. Please sign in again.');
      }

      // 2. Check expiration
      if (
        !userData.two_factor_otp_expires_at ||
        new Date(userData.two_factor_otp_expires_at).getTime() < Date.now()
      ) {
        throw new Error('This verification code has expired. Please request a new one.');
      }

      // 3. Match code
      if (userData.two_factor_otp !== otp.trim()) {
        throw new Error('Invalid verification code. Please check your inbox or phone.');
      }

      // 4. Invalidate used OTP
      await supabase
        .from('users')
        .update({
          two_factor_otp: null,
          two_factor_otp_expires_at: null,
        })
        .eq('id', userId);

      await recordAuditLog('Two-Factor Authentication challenge passed', 'security', {
        channel: deliveryChannel,
      });

      // Mark session verified in storage
      sessionStorage.setItem('pf_2fa_verified', 'true');
      toast.success('Two-Factor Verification successful! Welcome back.');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      await supabase
        .from('users')
        .update({
          two_factor_otp: generatedOtp,
          two_factor_otp_expires_at: expiresAt,
        })
        .eq('id', userId);

      // Trigger OTP dispatch via Supabase Auth
      await supabase.auth.signInWithOtp({
        email: userEmail,
      });

      toast.success(`New code dispatched to ${maskedTarget}`);
    } catch (err: any) {
      toast.error('Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#0d1117] p-4 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-2xl space-y-6 animate-in fade-in duration-200">
        
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-1">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Two-Factor Challenge
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
            Enter the 6-digit authentication token dispatched to your designated {deliveryChannel}:
          </p>
          <span className="font-mono font-bold text-xs text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-[#0d1117] px-3 py-1 rounded-xl border border-gray-200 dark:border-gray-800">
            {maskedTarget}
          </span>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              6-Digit Authentication Code
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                autoFocus
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className={`w-full text-center tracking-[0.6em] text-lg font-mono font-bold px-4 py-3 bg-gray-50/70 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white outline-none ${theme.ringAccent} transition-colors`}
              />
              <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={verifying || otp.length !== 6}
            className={`w-full py-3.5 ${theme.btnPrimary} font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            {verifying ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            <span>Verify & Enter Workspace</span>
          </button>
        </form>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800/80 text-xs">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Back to Login</span>
          </button>

          <button
            type="button"
            disabled={resending}
            onClick={handleResend}
            className={`flex items-center gap-1.5 font-bold ${theme.textAccent} hover:underline disabled:opacity-50`}
          >
            <RefreshCw size={12} className={resending ? 'animate-spin' : ''} />
            <span>Resend Code</span>
          </button>
        </div>

      </div>
    </div>
  );
}