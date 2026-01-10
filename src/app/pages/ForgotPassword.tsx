import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient'; // <--- Real DB Connection

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
        // 1. Send Reset Request to Supabase
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            // This is where users are sent after clicking the link
            // For now, we redirect to home, where they will be logged in automatically
            redirectTo: window.location.origin, 
        });

        if (error) {
            // Supabase security: It often doesn't reveal if an email exists or not
            // to prevent scraping. But if there's a real error (like rate limit), we show it.
            throw error;
        }

        // 2. Show Success Message
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
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 text-center animate-in zoom-in-95 duration-300">
          <div className="h-20 w-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-50/50 dark:ring-emerald-900/10">
            <CheckCircle size={40} className="animate-in zoom-in duration-500 delay-150" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            We sent a password reset link to <br/>
            <span className="font-semibold text-gray-900 dark:text-white">{email}</span>
          </p>
          
          <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>Didn't receive it?</span>
                  <button 
                    onClick={handleResend}
                    disabled={countdown > 0}
                    className={`font-semibold transition-colors ${countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-700 hover:underline'}`}
                  >
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Click to resend'}
                  </button>
              </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
              <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center justify-center gap-2 transition-colors">
                <ArrowLeft size={16} /> Back to Login
              </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 mb-8 transition-colors group">
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Login
        </Link>
        
        <div className="mb-8">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                <Lock size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Forgot Password?</h1>
            <p className="text-gray-500 dark:text-gray-400">Enter your email and we'll send you instructions to reset your password.</p>
        </div>

        {error && (
            <div className="p-4 mb-6 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30 flex items-start gap-3 animate-shake">
                <div className="mt-0.5"><Mail size={16} /></div>
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
                  <Mail size={18} />
              </div>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white placeholder:text-gray-400" 
                placeholder="name@company.com" 
                required 
              />
            </div>
          </div>
          
          <button 
            disabled={status === 'loading'} 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-70"
          >
             {status === 'loading' ? (
                 <>Sending Link <span className="animate-pulse">...</span></>
             ) : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
}