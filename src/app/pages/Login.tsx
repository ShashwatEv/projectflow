import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { recordAuditLog } from '../../lib/auditLogger';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { toast } from 'sonner';
import { getSafeReturnPath } from '../../lib/authRedirect';
import AuthPageFrame from '../components/AuthPageFrame';
import GoogleSignInButton from '../components/GoogleSignInButton';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useAccentTheme();
  const returnTo = getSafeReturnPath(location.state?.from);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.removeItem('pf_web_auth_return_to');
    sessionStorage.removeItem('pf_desktop_auth_return_to');
    setLoading(true);

    try {
      const cleanEmail = email.trim();

      // 1. Authenticate credentials via Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // 2. Query 2FA status for this account
        const { data: userProfile } = await supabase
          .from('users')
          .select('id, is_2fa_enabled, two_factor_channel, two_factor_target')
          .eq('id', data.user.id)
          .maybeSingle();

        // If 2FA is active, challenge user with 6-digit OTP
        if (userProfile?.is_2fa_enabled) {
          const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
          const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

          // Store temporary verification challenge in users row
          await supabase
            .from('users')
            .update({
              two_factor_otp: generatedOtp,
              two_factor_otp_expires_at: expiresAt,
            })
            .eq('id', data.user.id);

          // Dispatch authentication token
          await supabase.auth.signInWithOtp({
            email: cleanEmail,
          });

          await recordAuditLog('2FA challenge initiated on sign-in', 'security', {
            target: userProfile.two_factor_target || cleanEmail,
          });

          const channel = userProfile.two_factor_channel || 'email';
          const target = userProfile.two_factor_target || cleanEmail;
          const masked =
            channel === 'phone'
              ? target.slice(0, 3) + '••••' + target.slice(-3)
              : target.replace(/(.{2})(.*)(?=@)/, (_: string, a: string, b: string) => a + '•'.repeat(b.length));

          toast.info(`Two-Factor Authentication required. Code sent to your ${channel}.`);

          // Redirect to 2FA challenge page
          navigate('/2fa', {
            state: {
              userId: data.user.id,
              email: cleanEmail,
              channel,
              maskedTarget: masked,
              otpDispatched: true,
              returnTo,
            },
            replace: true,
          });
          return;
        }

        // Standard login without 2FA
        await recordAuditLog('User signed in', 'security');
        toast.success('Welcome back!');
        navigate(returnTo, { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageFrame>
        
        {/* Header Logo & Title */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-white p-2 shadow-lg shadow-black/10 border border-gray-200 dark:border-gray-700/60 flex items-center justify-center mb-1 overflow-hidden">
            <img 
              src="/favicon.ico" 
              alt="ProjectFlow Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Sign in to continue to ProjectFlow
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="name@company.com"
              className={`w-full px-4 py-3 bg-gray-50/70 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white outline-none ${theme.ringAccent} transition-colors`}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="login-password" className="font-semibold text-gray-700 dark:text-gray-300">
                Password
              </label>
              <Link
                to="/forgot-password"
                className={`${theme.textAccent} ${theme.textHover} font-medium transition-colors`}
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                className={`w-full px-4 py-3 pr-11 bg-gray-50/70 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white outline-none ${theme.ringAccent} transition-colors font-mono`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-motion absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:text-gray-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`auth-motion flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#161b22] ${theme.btnPrimary}`}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200 dark:border-gray-800" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-gray-500 dark:bg-[#161b22] dark:text-gray-400">
              or
            </span>
          </div>
        </div>
        <GoogleSignInButton />

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-800/80">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/signup"
              state={{ returnTo }}
              className={`font-bold ${theme.textAccent} ${theme.textHover} transition-colors`}
            >
              Create one
            </Link>
          </p>
        </div>

    </AuthPageFrame>
  );
}