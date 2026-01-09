import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Mail, Lock, User, Briefcase, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseclient';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Sign up with Supabase
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            // These fields trigger the SQL function 'handle_new_user'
            name: formData.name,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random&color=fff&background=6366f1`
          }
        }
      });

      if (authError) throw authError;

      if (data.session) {
        navigate('/'); // Redirect to dashboard/home
      } else {
        setError('Please check your email for a confirmation link (if enabled).');
      }

    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h1>
          <p className="text-gray-500">Join the team today</p>
        </div>

        {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30 flex items-center gap-2"><AlertCircle size={16}/> {error}</div>}

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
                    className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm dark:text-white transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            <button disabled={isLoading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all flex justify-center items-center gap-2 shadow-lg shadow-indigo-500/30 disabled:opacity-70 disabled:cursor-not-allowed">
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
            <input {...props} className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm dark:text-white transition-all" />
        </div>
    )
}