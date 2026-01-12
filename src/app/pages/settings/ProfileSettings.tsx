import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabaseClient'; 
import { Save, Loader2, CheckCircle2, User, MapPin, Phone, Briefcase, Mail, Camera } from 'lucide-react';

export default function ProfileSettings() {
  const { user } = useAuth(); 
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    role: user?.role || '', 
    location: user?.location || '', 
    email: user?.email || '',
    phone: user?.phone || '', 
    avatar: user?.avatar || ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);

    try {
      if (!user?.id) return;
      
      const { error } = await supabase
        .from('users')
        .update({
            name: formData.name,
            avatar: formData.avatar,
            role: formData.role,
            location: formData.location, 
            phone: formData.phone
        })
        .eq('id', user.id);

      if (error) throw error;

      setIsLoading(false);
      setSuccess(true);
      
      setTimeout(() => {
          window.location.reload(); 
      }, 1500);

    } catch (error) {
      console.error("Error updating profile:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Public Profile</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your public information and how you appear to the team.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* 1. Avatar Card with Gradient */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-all hover:shadow-md">
            {/* Decorative Background */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-900/20 dark:to-purple-900/20"></div>
            
            <div className="relative px-8 pt-12 pb-8 flex flex-col sm:flex-row items-start sm:items-end gap-6">
                <div className="relative group">
                    <img 
                        src={formData.avatar || "https://github.com/shadcn.png"} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-gray-800 shadow-lg" 
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-not-allowed">
                        <Camera className="text-white opacity-80" size={24} />
                    </div>
                </div>
                
                <div className="flex-1 w-full space-y-2">
                    <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        Profile Image URL
                    </label>
                    <div className="relative group">
                         <input 
                            type="text" 
                            value={formData.avatar}
                            onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                            placeholder="https://..."
                            className="w-full pl-4 pr-10 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all group-hover:bg-white dark:group-hover:bg-gray-900"
                        />
                        <div className="absolute right-3 top-2.5 text-gray-400">
                            <Camera size={16} />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">Supports JPG, PNG or GIF. Recommended size 400x400px.</p>
                </div>
            </div>
        </div>

        {/* 2. Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Identity Section */}
            <div className="md:col-span-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
                    Identity
                </h3>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-400"><User size={18} /></div>
                    <input 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all focus:scale-[1.01] dark:text-white"
                        placeholder="Your Name"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Job Title</label>
                <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-400"><Briefcase size={18} /></div>
                    <input 
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all focus:scale-[1.01] dark:text-white"
                        placeholder="Product Designer"
                    />
                </div>
            </div>

            {/* Contact Section */}
            <div className="md:col-span-2 mt-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
                    Contact Information
                </h3>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-400"><Mail size={18} /></div>
                    <input 
                        value={formData.email}
                        disabled
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 cursor-not-allowed"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-400"><Phone size={18} /></div>
                    <input 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all focus:scale-[1.01] dark:text-white"
                        placeholder="+1 (555) 000-0000"
                    />
                </div>
            </div>

            <div className="md:col-span-2 space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-400"><MapPin size={18} /></div>
                    <input 
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all focus:scale-[1.01] dark:text-white"
                        placeholder="San Francisco, CA"
                    />
                </div>
            </div>
        </div>

        {/* 3. Action Bar */}
        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-4">
             {success && (
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-lg animate-in fade-in slide-in-from-right-4">
                    <CheckCircle2 size={18} /> 
                    <span className="text-sm font-medium">Profile Updated!</span>
                </div>
            )}

            <button 
                type="submit"
                disabled={isLoading}
                className="group relative px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
            >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} className="transition-transform group-hover:scale-110" />}
                <span>Save Changes</span>
            </button>
        </div>

      </form>
    </div>
  );
}