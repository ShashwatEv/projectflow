import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Loader2, RefreshCw, KeyRound, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export default function TwoFactorVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const targetEmail =
    location.state?.email ||
    user?.email ||
    sessionStorage.getItem('pf_pending_2fa_email') ||
    '';

  // Guard against React 18/19 StrictMode mounting twice in dev
  const hasSentInitialOtp = useRef(false);

  // Store target email in session storage so refresh does not lose state
  useEffect(() => {
    if (targetEmail) {
      sessionStorage.setItem('pf_pending_2fa_email', targetEmail);
    }
  }, [targetEmail]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Initial OTP Dispatch (fires only once per session)
  useEffect(() => {
    if (!targetEmail) return;

    // Check if an OTP was sent in the last 60 seconds
    const lastSentTime = Number(sessionStorage.getItem('pf_last_otp_sent') || 0);
    const timeSinceLastSent = Date.now() - lastSentTime;

    if (timeSinceLastSent < 60000) {
      // Still in valid window, don't re-trigger
      const remainingSeconds = Math.ceil((60000 - timeSinceLastSent) / 1000);
      setCooldown(remainingSeconds);
      return;
    }

    if (!hasSentInitialOtp.current && !location.state?.otpAlreadyDispatched) {
      hasSentInitialOtp.current = true;
      sendOtp();
    }
  }, [targetEmail]);

  const sendOtp = async () => {
    if (!targetEmail) {
      toast.error('No email address provided for 2FA challenge');
      return;
    }

    setResending(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: targetEmail,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        if (error.status === 429 || error.message.toLowerCase().includes('rate limit')) {
          setErrorMessage('Supabase hourly email rate limit reached. Please wait before requesting another code.');
          toast.error('Email rate limit reached (429)', {
            description: 'Supabase enforces an hourly cooldown on email dispatches.',
          });
        } else {
          setErrorMessage(error.message);
          toast.error(error.message || 'Failed to dispatch code');
        }
      } else {
        sessionStorage.setItem('pf_last_otp_sent', String(Date.now()));
        setCooldown(60);
        toast.success(`Authentication code sent to ${targetEmail}`);
      }
    } catch {
      toast.error('Network error requesting OTP');
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanToken = otpCode.trim();

    if (!cleanToken || cleanToken.length < 6) {
      toast.error('Please enter the full 6-digit code');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // Real Supabase OTP verification
      const { data, error } = await supabase.auth.verifyOtp({
        email: targetEmail,
        token: cleanToken,
        type: 'email',
      });

      if (error) {
        if (error.status === 400 || error.message.toLowerCase().includes('token has expired')) {
          toast.error('Invalid or expired code. Please enter the latest code or click Resend.');
          setErrorMessage('The code entered is invalid or has expired.');
        } else {
          toast.error(error.message || 'Verification failed');
          setErrorMessage(error.message);
        }
      } else if (data?.session || data?.user) {
        // Mark 2FA verified in active browser session
        sessionStorage.setItem('pf_2fa_verified', 'true');
        sessionStorage.removeItem('pf_pending_2fa_email');
        sessionStorage.removeItem('pf_last_otp_sent');
        
        toast.success('Identity verified! Entering workspace...');
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      toast.error('Error during verification. Check network connection.');
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

        {/* Error notification if rate-limited or token invalid */}
        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
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
                placeholder="••••••"
                className="w-full bg-[#0b0e14] border border-gray-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-3 text-white font-mono text-center tracking-[0.5em] text-lg font-bold outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otpCode.length < 6}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
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
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Back to Login</span>
          </button>

          <button
            type="button"
            disabled={resending || cooldown > 0}
            onClick={sendOtp}
            className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 disabled:opacity-40 transition-colors font-medium cursor-pointer"
          >
            <RefreshCw size={12} className={resending ? 'animate-spin' : ''} />
            <span>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}