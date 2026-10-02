import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function ForgotPassword() {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#0d1117] p-4 transition-colors">
        <div className="w-full max-w-md bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="h-16 w-16 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle size={32} />
          </div>
          
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Check your email</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              We sent a password reset link to <br/>
              <span className="font-semibold text-gray-900 dark:text-white">{email}</span>
            </p>
          </div>
          
          <div className="pt-2">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Didn't receive it?</span>
              <button 
                onClick={handleResend}
                disabled={countdown > 0}
                className={`font-semibold transition-colors ${countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-orange-600 hover:text-orange-700 dark:text-orange-500 hover:underline'}`}
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Click to resend'}
              </button>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800/80">
            <Link 
              to="/login" 
              className="text-xs font-semibold text-gray-600 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-500 flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft size={15} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#0d1117] p-4 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-xl space-y-6 animate-in fade-in duration-200">
        
        {/* Top Back Nav */}
        <Link 
          to="/login" 
          className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-500 transition-colors group"
        >
          <ArrowLeft size={14} className="mr-1.5 group-hover:-translate-x-1 transition-transform" /> Back to Sign In
        </Link>
        
        {/* Header Logo & Title */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-white p-2 shadow-lg shadow-black/10 border border-gray-200 dark:border-gray-700/60 flex items-center justify-center mb-1 overflow-hidden">
            <img 
              src="../../../favicon.ico" 
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
          <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/30 flex items-start gap-2.5">
            <Mail size={15} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                <Mail size={16} />
              </div>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full pl-10 pr-4 py-3 bg-gray-50/70 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-orange-500 transition-colors" 
                placeholder="name@company.com" 
                required 
              />
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={status === 'loading'} 
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
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
              className="font-bold text-orange-600 hover:text-orange-700 dark:text-orange-500 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}