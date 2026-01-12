import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabaseClient'; 
import { Save, Loader2, CheckCircle2, MapPin, Mail, Phone, Globe, Camera, Briefcase } from 'lucide-react';

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

  // Auto-hide success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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
      
      setTimeout(() => window.location.reload(), 1500);

    } catch (error) {
      console.error("Error updating profile:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-full animate-in fade-in duration-500">
      
      <div className="flex items-center justify-between mb-8">
        <div>
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
           <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Update your personal details and public preview.</p>
        </div>
        
        {/* Save Button (Top Right for easy access) */}
        <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className={`
                px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg
                ${success 
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30 hover:shadow-indigo-500/40'
                }
                disabled:opacity-70 disabled:cursor-not-allowed
            `}
        >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : success ? <CheckCircle2 size={18} /> : <Save size={18} />}
            {success ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT COLUMN: LIVE PREVIEW CARD --- */}
        <div className="lg:col-span-4 space-y-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Live Preview</h3>
            
            {/* The Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-700 sticky top-6">
                {/* Banner Background */}
                <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>

                {/* Card Content */}
                <div className="px-6 pb-8 relative">
                    {/* Floating Avatar */}
                    <div className="relative -mt-12 mb-4 inline-block">
                        <img 
                            src={formData.avatar || "https://github.com/shadcn.png"} 
                            alt="Profile" 
                            className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-gray-800 shadow-md bg-white" 
                        />
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-gray-800 rounded-full"></div>
                    </div>

                    <div className="text-center sm:text-left">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                            {formData.name || 'Your Name'}
                        </h2>
                        <p className="text-indigo-600 dark:text-indigo-400 font-medium text-sm mb-4">
                            {formData.role || 'Role / Job Title'}
                        </p>

                        <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                             <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-400"><Mail size={16} /></div>
                                <span className="truncate">{formData.email}</span>
                             </div>
                             
                             {formData.phone && (
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-400"><Phone size={16} /></div>
                                    <span>{formData.phone}</span>
                                </div>
                             )}

                             {formData.location && (
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-400"><MapPin size={16} /></div>
                                    <span>{formData.location}</span>
                                </div>
                             )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- RIGHT COLUMN: EDIT FORM --- */}
        <div className="lg:col-span-8">
             <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 dark:text-white">Personal Information</h3>
                    <span className="text-xs text-gray-500">All fields auto-save to preview</span>
                </div>
                
                <div className="p-8 space-y-8">
                    {/* Avatar Input */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Profile Image</label>
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <div className="absolute left-3 top-3 text-gray-400"><Camera size={18} /></div>
                                <input 
                                    value={formData.avatar}
                                    onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                                    placeholder="Paste image URL here..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Use a direct link to a JPG or PNG image.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup 
                            label="Full Name" 
                            icon={<span className="text-lg font-bold">Aa</span>} // Text Icon
                            value={formData.name} 
                            onChange={(v: string) => setFormData({...formData, name: v})}
                            placeholder="e.g. Sarah Connor"
                        />
                         <InputGroup 
                            label="Job Title / Role" 
                            icon={<Briefcase size={18} />} 
                            value={formData.role} 
                            onChange={(v: string) => setFormData({...formData, role: v})}
                            placeholder="e.g. Senior Developer"
                        />
                         <InputGroup 
                            label="Location" 
                            icon={<MapPin size={18} />} 
                            value={formData.location} 
                            onChange={(v: string) => setFormData({...formData, location: v})}
                            placeholder="e.g. London, UK"
                        />
                         <InputGroup 
                            label="Phone Number" 
                            icon={<Phone size={18} />} 
                            value={formData.phone} 
                            onChange={(v: string) => setFormData({...formData, phone: v})}
                            placeholder="+1 (555) 000-0000"
                        />
                    </div>
                </div>
             </div>
        </div>

      </div>
    </div>
  );
}

// Reusable Input Component for cleaner code
function InputGroup({ label, icon, value, onChange, placeholder }: any) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
            <div className="relative group">
                <div className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                    {icon}
                </div>
                <input 
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
}