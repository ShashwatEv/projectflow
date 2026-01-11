import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('/pfp.jpg'); // Default

  // Avatars available in your public folder
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
        email,
        password,
        options: {
          // Pass the Name and Avatar to the Trigger via 'data'
          data: {
            full_name: name,
            avatar_url: selectedAvatar,
          },
        },
      });

      if (error) throw error;
      
      alert('Signup successful! Please check your email to verify.');
      navigate('/login');
      
    } catch (error: any) {
      alert(error.message || 'Error signing up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Join the team today</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            
            {/* 1. Avatar Selection Grid */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                Choose your Avatar
              </label>
              <div className="flex justify-center gap-4">
                {avatars.map((av) => (
                  <div 
                    key={av.id}
                    onClick={() => setSelectedAvatar(av.src)}
                    className={`relative cursor-pointer group transition-all duration-200 ${
                      selectedAvatar === av.src ? 'scale-110' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={av.src} 
                      alt={av.label} 
                      className={`w-16 h-16 rounded-full object-cover border-2 ${
                        selectedAvatar === av.src 
                        ? 'border-indigo-600 shadow-lg shadow-indigo-500/20' 
                        : 'border-transparent'
                      }`} 
                    />
                    {selectedAvatar === av.src && (
                      <div className="absolute -top-1 -right-1 bg-indigo-600 text-white rounded-full p-0.5 animate-in zoom-in">
                        <CheckCircle2 size={14} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Standard Fields */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <input 
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input 
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <input 
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center justify-center shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Sign Up'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:underline font-medium">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}