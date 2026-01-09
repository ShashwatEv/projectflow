import { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  KeyRound, 
  Smartphone, 
  Laptop, 
  Eye, 
  EyeOff, 
  Loader2, 
  Check, 
  AlertCircle 
} from 'lucide-react';

export default function SecuritySettings() {
  // --- PASSWORD STATE ---
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPass, setShowPass] = useState({ current: false, new: false });
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error' | '', text: string }>({ type: '', text: '' });

  // --- 2FA STATE ---
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [twoFALoading, setTwoFALoading] = useState(false);

  // --- VALIDATION HELPERS ---
  const validations = {
    length: passwords.new.length >= 8,
    upper: /[A-Z]/.test(passwords.new),
    number: /[0-9]/.test(passwords.new),
    special: /[^A-Za-z0-9]/.test(passwords.new),
    match: passwords.new.length > 0 && passwords.new === passwords.confirm
  };

  const isFormValid = Object.values(validations).every(Boolean) && passwords.current.length > 0;

  // --- HANDLERS ---
  const handleUpdatePassword = () => {
    if (!isFormValid) return;
    setPassLoading(true);
    setPassMessage({ type: '', text: '' });

    // Simulate API Call
    setTimeout(() => {
      setPassLoading(false);
      setPassMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswords({ current: '', new: '', confirm: '' }); // Reset form
      
      // Clear message after 3 seconds
      setTimeout(() => setPassMessage({ type: '', text: '' }), 3000);
    }, 1500);
  };

  const toggle2FA = () => {
    setTwoFALoading(true);
    setTimeout(() => {
      setIs2FAEnabled(!is2FAEnabled);
      setTwoFALoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. CHANGE PASSWORD SECTION */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
            <KeyRound size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Change Password</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Inputs */}
          <div className="space-y-4">
             <PasswordInput 
                label="Current Password" 
                value={passwords.current}
                onChange={(e: any) => setPasswords({...passwords, current: e.target.value})}
                show={showPass.current}
                onToggle={() => setShowPass({...showPass, current: !showPass.current})}
                placeholder="Enter current password"
             />
             <div className="h-px bg-gray-100 dark:bg-gray-700 my-2"></div>
             <PasswordInput 
                label="New Password" 
                value={passwords.new}
                onChange={(e: any) => setPasswords({...passwords, new: e.target.value})}
                show={showPass.new}
                onToggle={() => setShowPass({...showPass, new: !showPass.new})}
                placeholder="Enter new password"
             />
             <PasswordInput 
                label="Confirm New Password" 
                value={passwords.confirm}
                onChange={(e: any) => setPasswords({...passwords, confirm: e.target.value})}
                show={false} // Always hidden for confirm
                noToggle
                placeholder="Confirm new password"
             />

             {/* Action Button & Message */}
             <div className="pt-2">
                <button 
                  onClick={handleUpdatePassword}
                  disabled={passLoading || !isFormValid}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  {passLoading ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
                  Update Password
                </button>
                
                {passMessage.text && (
                  <p className={`mt-3 text-sm flex items-center gap-2 ${passMessage.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {passMessage.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                    {passMessage.text}
                  </p>
                )}
             </div>
          </div>
          
          {/* Requirements Checklist */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-xl border border-gray-100 dark:border-gray-700 h-fit">
            <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wide">Password Requirements</h4>
            <div className="space-y-3">
              <RequirementItem met={validations.length} label="Minimum 8 characters long" />
              <RequirementItem met={validations.upper} label="At least one uppercase letter" />
              <RequirementItem met={validations.number} label="At least one number" />
              <RequirementItem met={validations.special} label="At least one special character" />
              <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>
              <RequirementItem met={validations.match && passwords.confirm.length > 0} label="Passwords match" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. TWO-FACTOR AUTHENTICATION */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex gap-4">
                <div className={`p-3 rounded-full h-fit ${is2FAEnabled ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20' : 'bg-gray-100 text-gray-500 dark:bg-gray-700'}`}>
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-lg">
                        Add an extra layer of security to your account by requiring a code from your mobile device.
                    </p>
                </div>
            </div>
            
            <button 
                onClick={toggle2FA}
                disabled={twoFALoading}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    is2FAEnabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
            >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${is2FAEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
        
        {is2FAEnabled && (
            <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-lg flex items-start gap-3">
                <Smartphone className="text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" size={18} />
                <div>
                    <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">2FA is active</p>
                    <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-0.5">Your account is currently protected. You will be asked for a code when signing in from a new device.</p>
                </div>
            </div>
        )}
      </div>

      {/* 3. LOGIN SESSIONS (New Logical Addition) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Login Sessions</h3>
         <div className="space-y-1">
             <SessionItem 
                device="MacBook Pro" 
                location="Jabalpur, India" 
                time="Active Now" 
                icon={<Laptop size={18} />} 
                isCurrent 
             />
             <SessionItem 
                device="iPhone 14 Pro" 
                location="Jabalpur, India" 
                time="2 hours ago" 
                icon={<Smartphone size={18} />} 
             />
         </div>
      </div>

    </div>
  );
}

// --- SUB COMPONENTS ---

function PasswordInput({ label, value, onChange, show, onToggle, noToggle, placeholder }: any) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            <div className="relative">
                <input 
                    type={show ? "text" : "password"} 
                    value={value}
                    onChange={onChange}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-gray-900 dark:text-white transition-all text-sm"
                    placeholder={placeholder}
                />
                {!noToggle && (
                    <button 
                        onClick={onToggle}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                )}
            </div>
        </div>
    );
}

function RequirementItem({ met, label }: { met: boolean, label: string }) {
    return (
        <div className={`flex items-center gap-2 text-xs transition-colors duration-200 ${met ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
            <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${met ? 'bg-emerald-100 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800' : 'border-gray-300 dark:border-gray-600'}`}>
                {met && <Check size={10} />}
            </div>
            {label}
        </div>
    );
}

function SessionItem({ device, location, time, icon, isCurrent }: any) {
    return (
        <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors group">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg">
                    {icon}
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        {device}
                        {isCurrent && <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded font-bold uppercase">Current</span>}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{location} • {time}</p>
                </div>
            </div>
            <button className="text-xs font-medium text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all">
                Revoke
            </button>
        </div>
    );
}