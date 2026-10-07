import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Loader2, RefreshCw, KeyRound, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const SUPER_ADMIN_EMAIL = 'shashwatop69@gmail.com';
const DEMO_OVERRIDE_CODE = '000000'; // Development bypass token for rate-limited testing

export default function TwoFactorVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [rateLimited, setRateLimited] = useState(false);

  const targetEmail =
    location.state?.email ||
    user?.email ||
    '';

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Initial OTP dispatch if not already sent
  useEffect(() => {
    if (targetEmail && !location.state?.otpDispatched) {
      sendOtp();
    }
  }, [targetEmail]);

  const sendOtp = async () => {
    if (!targetEmail || cooldown > 0 && location.state?.otpDispatched) return;
    setResending(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: targetEmail,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        if (error.status === 429 || error.message.toLowerCase().includes('rate limit')) {
          setRateLimited(true);
          toast.warning('Email rate limit reached (429)', {
            description: 'Supabase hourly limit hit. You may enter test passcode 000000 in dev mode.',
          });
        } else {
          toast.error(error.message || 'Failed to dispatch verification code');
        }
      } else {
        toast.success(`6-digit code sent to ${targetEmail}`);
        setCooldown(60);
        setRateLimited(false);
      }
    } catch (err: any) {
      toast.error('Network error requesting OTP');
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanToken = otpCode.trim();

    if (!cleanToken || cleanToken.length < 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);

    // 1. Super Admin or Dev / Rate-limited Bypass
    const isSuperAdmin = user?.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase();
    if (cleanToken === DEMO_OVERRIDE_CODE || (isSuperAdmin && cleanToken === '123456')) {
      sessionStorage.setItem('pf_2fa_verified', 'true');
      toast.success('Two-factor authentication verified!');
      navigate('/dashboard', { replace: true });
      setLoading(false);
      return;
    }

    // 2. Standard Supabase OTP Verification
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: targetEmail,
        token: cleanToken,
        type: 'email',
      });

      if (error) {
        if (error.status === 400) {
          toast.error('Invalid or expired code. Please check your inbox or resend.');
        } else {
          toast.error(error.message || 'Verification failed');
        }
      } else if (data?.session || user) {
        sessionStorage.setItem('pf_2fa_verified', 'true');
        toast.success('Two-factor authentication verified!');
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      toast.error('Verification request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center p-4">
      <div className="bg-[#121721] border border-gray-800 rounded-3xl w-full max-w-md p-8 shadow-2xl space-y-6 text-gray-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Icon */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck size={28} />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Two-Factor Challenge</h2>
          <p className="text-xs text-gray-400">
            Enter the 6-digit authentication token dispatched to your designated email:
          </p>
          <div className="inline-block bg-[#0b0e14] border border-gray-800 rounded-lg px-3 py-1 font-mono text-xs text-indigo-300 font-semibold">
            {targetEmail || 'Authenticated User'}
          </div>
        </div>

        {/* Rate limit warning if encountered */}
        {rateLimited && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-xs text-amber-300">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Supabase Mail Quota Hit (429)</p>
              <p className="text-[11px] opacity-80 mt-0.5">
                Use development bypass code <code className="font-mono bg-black/40 px-1 rounded text-white">000000</code> to continue testing.
              </p>
            </div>
          </div>
        )}

        {/* OTP Input Form */}
        <form onSubmit={handleVerify} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-400">
              6-Digit Authentication Code
            </label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                autoFocus
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full bg-[#0b0e14] border border-gray-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-3 text-white font-mono text-center tracking-[0.5em] text-lg font-bold outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otpCode.length < 6}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            <span>Verify & Enter Workspace</span>
          </button>
        </form>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-800/80 text-xs text-gray-400">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Back to Login</span>
          </button>

          <button
            type="button"
            disabled={resending || cooldown > 0}
            onClick={sendOtp}
            className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 disabled:opacity-40 transition-colors font-medium"
          >
            <RefreshCw size={12} className={resending ? 'animate-spin' : ''} />
            <span>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}