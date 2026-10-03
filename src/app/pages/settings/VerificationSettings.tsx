import { useState, useEffect } from 'react';
import { 
  BadgeCheck, Mail, Phone, ShieldCheck, KeyRound, 
  Loader2, CheckCircle2, RefreshCw 
} from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import { useAccentTheme } from '../../../lib/useAccentTheme';
import { toast } from 'sonner';

export default function VerificationSettings() {
  const { user } = useAuth();
  const theme = useAccentTheme();

  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [isFullyVerified, setIsFullyVerified] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  // OTP Step States
  const [activeChannel, setActiveChannel] = useState<'email' | 'phone' | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    async function loadVerificationStatus() {
      if (!user?.id) return;
      try {
        const { data: authData } = await supabase.auth.getUser();
        const authUser = authData?.user;

        const { data, error } = await supabase
          .from('users')
          .select('email_verified, phone_verified, is_verified, phone')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          // If Supabase auth already confirmed the email, reflect it immediately
          const isEmailConfirmed = Boolean(authUser?.email_confirmed_at || data.email_verified);
          setEmailVerified(isEmailConfirmed);
          setPhoneVerified(Boolean(data.phone_verified));
          setIsFullyVerified(Boolean(data.is_verified || isEmailConfirmed));
          setPhoneNumber(data.phone || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadVerificationStatus();
  }, [user?.id]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Dispatch real email OTP via Supabase Auth
  const handleSendOtp = async (channel: 'email' | 'phone') => {
    if (channel === 'phone') {
      if (!phoneNumber.trim()) {
        toast.error('Please configure your phone number in Profile settings first');
        return;
      }
      toast.info('SMS gateway integration requires Twilio credentials in Supabase. Please verify via Email.');
      return;
    }

    if (!user?.email) {
      toast.error('No email address associated with this account');
      return;
    }

    setSendingOtp(true);
    try {
      // Sends a real one-time token directly to user's inbox
      const { error } = await supabase.auth.signInWithOtp({
        email: user.email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) throw error;

      setActiveChannel('email');
      setOtpSent(true);
      setCountdown(60);
      toast.success(`Verification email dispatched to ${user.email}! Please check your inbox or spam folder.`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to dispatch verification email');
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify the genuine Supabase OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email || otpCode.trim().length < 6) return;

    setVerifying(true);
    try {
      // Cryptographically verify code against Supabase Auth service
      const { data, error } = await supabase.auth.verifyOtp({
        email: user.email,
        token: otpCode.trim(),
        type: 'email',
      });

      if (error) throw error;

      // Update public.users database flags
      const { error: dbError } = await supabase
        .from('users')
        .update({
          email_verified: true,
          is_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (dbError) throw dbError;

      setEmailVerified(true);
      setIsFullyVerified(true);
      setOtpSent(false);
      setOtpCode('');
      setActiveChannel(null);

      toast.success('Your email is officially verified! Verified badge awarded.');
    } catch (err: any) {
      toast.error(err.message || 'Invalid or expired code. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-gray-400 space-y-3">
        <Loader2 size={26} className={`animate-spin ${theme.textAccent}`} />
        <p className="text-xs">Checking verification registry...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner Status */}
      <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className={`p-3.5 rounded-2xl ${isFullyVerified ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-500 border border-blue-200 dark:border-blue-800/40' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
            <BadgeCheck size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Workspace Identity Verification</h2>
              {isFullyVerified && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-500 border border-blue-200 dark:border-blue-800/60">
                  Verified Member
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md leading-relaxed">
              Verify your email address to receive an official security checkmark across your workspace profile, comments, and project boards.
            </p>
          </div>
        </div>
      </div>

      {/* Verification Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Email Verification Box */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 border border-blue-200 dark:border-blue-800/40">
                <Mail size={20} />
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                emailVerified 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60' 
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
              }`}>
                {emailVerified ? 'Verified' : 'Unverified'}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Email Address</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user?.email}</p>
            </div>
          </div>

          <button
            type="button"
            disabled={emailVerified || sendingOtp}
            onClick={() => handleSendOtp('email')}
            className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
              emailVerified 
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-default' 
                : `${theme.btnPrimary} shadow-md disabled:opacity-50`
            }`}
          >
            {sendingOtp ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Sending Code...</span>
              </>
            ) : emailVerified ? (
              <>
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>Email Confirmed</span>
              </>
            ) : (
              <>
                <ShieldCheck size={14} />
                <span>Send Code to Inbox</span>
              </>
            )}
          </button>
        </div>

        {/* Phone Verification Box */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-500 border border-purple-200 dark:border-purple-800/40">
                <Phone size={20} />
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                phoneVerified 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700'
              }`}>
                {phoneVerified ? 'Verified' : 'Optional'}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Phone Channel</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {phoneNumber || 'No mobile number configured'}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={true}
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <ShieldCheck size={14} />
            <span>SMS Gateway (Requires Twilio)</span>
          </button>
        </div>

      </div>

      {/* OTP Code Entry Modal */}
      {otpSent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-sm p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-500 mx-auto flex items-center justify-center">
                <KeyRound size={22} />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Check Your Inbox</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                We sent a 6-digit verification code to <span className="font-semibold text-gray-700 dark:text-gray-300">{user?.email}</span>.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                maxLength={8}
                autoFocus
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full text-center tracking-[0.3em] font-mono text-xl py-3 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-2xl outline-none focus:border-blue-500 text-gray-900 dark:text-white"
              />

              <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                <span>Didn't receive it?</span>
                <button
                  type="button"
                  disabled={countdown > 0 || sendingOtp}
                  onClick={() => handleSendOtp('email')}
                  className={`font-semibold ${countdown > 0 ? 'text-gray-500 cursor-not-allowed' : `${theme.textAccent} hover:underline`}`}
                >
                  {countdown > 0 ? `Resend (${countdown}s)` : 'Resend Code'}
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtpCode('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={otpCode.trim().length < 6 || verifying}
                  className={`px-5 py-2 rounded-xl ${theme.btnPrimary} font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50`}
                >
                  {verifying && <Loader2 size={13} className="animate-spin" />}
                  <span>Verify Email</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}