import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Mail, Lock, User, Briefcase, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient'; // <--- THIS IS THE KEY CHANGE

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. THIS CALLS SUPABASE (The Real Database)
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.role,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`
          },
          // Redirect back to your deployed site after verification
          emailRedirectTo: `${window.location.origin}/` 
        }
      });

      if (authError) throw authError;

      // 2. Show Success Screen
      setSuccess(true);

    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  // SUCCESS STATE (Check Email Screen)
  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h2>
            <p className="text-gray-500 mb-6">We sent a verification link to <b>{formData.email}</b>.</p>
            <p className="text-sm text-gray-400">Can't find it? Check your spam folder.</p>
            <Link to="/" className="mt-6 inline-block text-indigo-600 font-bold hover:underline">Back to Login</Link>
        </div>
      </div>
    );
  }

  // SIGNUP FORM
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h1>
          <p className="text-gray-500">Join the team today</p>
        </div>

        {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center gap-2"><AlertCircle size={16}/> {error}</div>}

        <form onSubmit={handleSignup} className="space-y-4">
            <InputGroup icon={<User size={18} />} placeholder="Full Name" value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} />
            <InputGroup icon={<Mail size={18} />} placeholder="Email" type="email" value={formData.email} onChange={(e:any) => setFormData({...formData, email: e.target.value})} />
            <InputGroup icon={<Briefcase size={18} />} placeholder="Role (e.g. Designer)" value={formData.role} onChange={(e:any) => setFormData({...formData, role: e.target.value})} />
            
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none"><Lock size={18} /></div>
                <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm dark:text-white"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            <button disabled={isLoading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all flex justify-center items-center gap-2">
                {isLoading ? <Loader2 className="animate-spin" /> : <>Sign Up <ArrowRight size={18} /></>}
            </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">Already have an account? <Link to="/" className="text-indigo-600 font-bold hover:underline">Log in</Link></p>
      </div>
    </div>
  );
}

function InputGroup({ icon, ...props }: any) {
    return (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">{icon}</div>
            <input {...props} className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm dark:text-white" />
        </div>
    )
}