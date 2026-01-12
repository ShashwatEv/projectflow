import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabaseClient'; 
import { Save, Loader2, CheckCircle2, MapPin, Mail, Phone, Camera, Briefcase, ChevronDown } from 'lucide-react';

export default function ProfileSettings() {
  const { user } = useAuth(); 
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    role: user?.role || 'Member', 
    location: user?.location || '', 
    email: user?.email || '',
    phone: user?.phone || '', 
    avatar: user?.avatar || '/pfp.jpg'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  // Predefined Options
  const avatars = [
    { src: '/male.jpg', label: 'Male' },
    { src: '/female.jpg', label: 'Female' },
    { src: '/pfp.jpg', label: 'Default' },
  ];

  const roles = [
    "Member",
    "Developer", 
    "Senior Developer",
    "Designer", 
    "Product Manager", 
    "Project Manager", 
    "Admin",
    "Intern"
  ];

  // Auto-hide success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Close avatar picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target as Node)) {
        setIsAvatarPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        
        {/* --- LEFT COLUMN: LIVE PREVIEW --- */}
        <div className="lg:col-span-4 space-y-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Live Preview</h3>
            
            <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-700 sticky top-6">
                <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>

                <div className="px-6 pb-8 relative">
                    <div className="relative -mt-12 mb-4 inline-block">
                        <img 
                            src={formData.avatar} 
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
                            {formData.role || 'Member'}
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
                    
                    {/* 1. Avatar Picker */}
                    <div ref={avatarMenuRef} className="relative">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Profile Image</label>
                        
                        <div 
                           onClick={() => setIsAvatarPickerOpen(!isAvatarPickerOpen)}
                           className="flex items-center gap-4 p-3 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group"
                        >
                             <img src={formData.avatar} className="w-12 h-12 rounded-lg object-cover bg-gray-200" alt="Current" />
                             <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Selected Avatar</p>
                                <p className="text-xs text-gray-500 group-hover:text-indigo-500 transition-colors">Click to change...</p>
                             </div>
                             <ChevronDown size={16} className={`text-gray-400 transition-transform ${isAvatarPickerOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {/* Avatar Selection Panel */}
                        {isAvatarPickerOpen && (
                            <div className="absolute top-full left-0 w-full mt-2 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-10 animate-in zoom-in-95 duration-200">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Choose an Avatar</p>
                                <div className="grid grid-cols-3 gap-4">
                                    {avatars.map((av) => (
                                        <button 
                                            key={av.src}
                                            onClick={() => { setFormData({...formData, avatar: av.src}); setIsAvatarPickerOpen(false); }}
                                            className={`relative group rounded-xl overflow-hidden border-2 transition-all ${formData.avatar === av.src ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}
                                        >
                                            <img src={av.src} alt={av.label} className="w-full h-20 object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-white text-xs font-bold">{av.label}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup 
                            label="Full Name" 
                            icon={<span className="text-lg font-bold">Aa</span>}
                            value={formData.name} 
                            onChange={(v: string) => setFormData({...formData, name: v})}
                            placeholder="e.g. Sarah Connor"
                        />
                         
                         {/* 2. Job Role Select */}
                         <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Job Title / Role</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                    <Briefcase size={18} />
                                </div>
                                <select 
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white appearance-none cursor-pointer"
                                >
                                    {roles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                        </div>

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

// Reusable Input Component
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