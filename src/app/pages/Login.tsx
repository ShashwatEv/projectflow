import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseclient'; // Real DB

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;
      
      navigate('/'); // Go to home on success
      
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="text-gray-500">Log in to your account</p>
        </div>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30 flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none"><Mail size={18} /></div>
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm dark:text-white"
                />
            </div>
            
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
                {isLoading ? <Loader2 className="animate-spin" /> : <>Log In <ArrowRight size={18} /></>}
            </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">Don't have an account? <Link to="/signup" className="text-indigo-600 font-bold hover:underline">Sign up</Link></p>
      </div>
    </div>
  );
}