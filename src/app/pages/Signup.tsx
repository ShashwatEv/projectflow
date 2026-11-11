import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import AuthPageFrame from '../components/AuthPageFrame';
import GoogleSignInButton from '../components/GoogleSignInButton';

export default function Signup() {
  const navigate = useNavigate();
  const theme = useAccentTheme();

  const [loading, setLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('/pfp.jpg');

  // Avatars available in public folder
  const avatars = [
    { id: 'male', src: '/male.jpg', label: 'Male' },
    { id: 'female', src: '/female.jpg', label: 'Female' },
    { id: 'default', src: '/pfp.jpg', label: 'Default' },
  ];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            full_name: name.trim(),
            avatar_url: selectedAvatar,
          },
        },
      });

      if (error) throw error;
      
      toast.success('Account created! Please check your email to verify.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Error signing up. Please try again.');
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
            Create Account
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Join the workspace and start collaborating
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          
          {/* Avatar Selection */}
          <div className="space-y-2">
            <p className="text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
              Choose your Avatar
            </p>
            <div role="group" aria-label="Choose your avatar" className="flex justify-center gap-4">
              {avatars.map((av) => {
                const isSelected = selectedAvatar === av.src;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.src)}
                    aria-label={`Choose ${av.label} avatar`}
                    aria-pressed={isSelected}
                    className={`auth-motion relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#161b22] ${
                      isSelected ? 'scale-105' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={av.src} 
                      alt={av.label} 
                      className={`w-14 h-14 rounded-full object-cover border-2 transition-all ${
                        isSelected 
                          ? `${theme.borderAccent} shadow-md` 
                          : 'border-transparent'
                      }`} 
                    />
                    {isSelected && (
                      <span className={`absolute -right-1 -top-1 rounded-full p-0.5 text-white ${theme.toggleActive}`}>
                        <CheckCircle2 size={14} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="signup-name" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <input 
              id="signup-name"
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="John Doe"
              className={`w-full px-4 py-3 bg-gray-50/70 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white outline-none ${theme.ringAccent} transition-colors`}
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="signup-email" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <input 
              id="signup-email"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="name@company.com"
              className={`w-full px-4 py-3 bg-gray-50/70 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white outline-none ${theme.ringAccent} transition-colors`}
            />
          </div>

          {/* Password with Eye Toggle */}
          <div className="space-y-1.5">
            <label htmlFor="signup-password" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="relative">
              <input 
                id="signup-password"
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
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

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className={`auth-motion flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#161b22] ${theme.btnPrimary}`}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Create Account'}
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
            Already have an account?{' '}
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