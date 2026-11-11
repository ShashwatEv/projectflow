import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAccentTheme } from '../../lib/useAccentTheme';
import AuthPageFrame from '../components/AuthPageFrame';

export default function ForgotPassword() {
  const theme = useAccentTheme();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState('');
  
  // Timer for Resend
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('loading');
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setStatus('success');
      setCountdown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
      setStatus('idle');
    }
  };

  const handleResend = () => {
    if (countdown === 0) {
      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    }
  };

  if (status === 'success') {
    return (
      <AuthPageFrame className="text-center">
          <div className="h-16 w-16 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle size={32} />
          </div>
          
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Check your email</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              We sent a password reset link to{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{email}</span>
            </p>
          </div>
          
          <div className="pt-2">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Didn't receive it?</span>
              <button 
                type="button"
                onClick={handleResend}
                disabled={countdown > 0}
                className={`auth-motion rounded-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  countdown > 0 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : `${theme.textAccent}${theme.textHover} hover:underline`
                }`}
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Click to resend'}
              </button>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800/80">
            <Link 
              to="/login" 
              className={`auth-motion inline-flex items-center justify-center gap-2 rounded-sm text-xs font-semibold text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-gray-400 ${theme.textHover}`}
            >
              <ArrowLeft size={15} /> Back to Sign In
            </Link>
          </div>
      </AuthPageFrame>
    );
  }

  return (
    <AuthPageFrame>
        
        {/* Top Back Nav */}
        <Link 
          to="/login" 
          className={`auth-motion inline-flex items-center rounded-sm text-xs font-semibold text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-gray-400 ${theme.textHover} group`}
        >
          <ArrowLeft size={14} className="mr-1.5" /> Back to Sign In
        </Link>
        
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
            Forgot Password?
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Enter your email and we'll send you a recovery link
          </p>
        </div>

        {error && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-900/30 dark:bg-red-950/30">
            <Mail size={15} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="recovery-email" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                <Mail size={16} />
              </div>
              <input 
                id="recovery-email"
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                autoComplete="email"
                className={`w-full pl-10 pr-4 py-3 bg-gray-50/70 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white outline-none ${theme.ringAccent} transition-colors`} 
                placeholder="name@company.com" 
                required 
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={status === 'loading'} 
            className={`auth-motion flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#161b22] ${theme.btnPrimary}`}
          >
            {status === 'loading' ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Sending Link...</span>
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-800/80">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Remembered your password?{' '}
            <Link
              to="/login"
              className={`font-bold ${theme.textAccent} ${theme.textHover} transition-colors`}
            >
              Sign In
            </Link>
          </p>
        </div>

    </AuthPageFrame>
  );
}