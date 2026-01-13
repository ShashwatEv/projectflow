import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Save, CheckCircle2, User, Mail, Shield, Camera, Briefcase, ChevronDown, MapPin, X } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Avatar Selection State
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '', 
    role: 'Member',
    avatar: '/pfp.jpg',
    location: '',
    phone: ''
  });

  // Predefined Assets
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

  // 1. Fetch User Data
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          if (data) {
            setFormData({
              name: data.name || '',
              email: data.email || '',
              role: data.role || 'Member',
              avatar: data.avatar || '/pfp.jpg',
              location: data.location || '',
              phone: data.phone || ''
            });
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [user]);

  // Close avatar menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
        setIsAvatarMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Save Changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSuccessMsg('');

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          role: formData.role,
          avatar: formData.avatar,
          location: formData.location,
          phone: formData.phone
        })
        .eq('id', user.id);

      if (error) throw error;
      
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);

    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto h-full overflow-y-auto animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
           <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">My Profile</h1>
           <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your identity and team presence.</p>
        </div>
        
        {/* Quick Stats or Status (Optional Decor) */}
        <div className="flex gap-4">
             <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium border border-indigo-100 dark:border-indigo-800">
                {formData.role}
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN: PROFILE CARD PREVIEW --- */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden text-center group">
               
               {/* Background Pattern */}
               <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-800 z-0"></div>
               
               {/* Avatar Container */}
               <div className="relative z-10 mx-auto w-32 h-32 mb-4">
                   <img 
                     src={formData.avatar} 
                     alt="Profile" 
                     className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg" 
                   />
                   <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-gray-800 rounded-full"></div>
               </div>

               <div className="relative z-10">
                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{formData.name}</h2>
                   <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-6">{formData.role}</p>
                   
                   <div className="space-y-3 text-left bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl">
                       <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                           <Mail size={16} className="text-gray-400" />
                           <span className="truncate">{formData.email}</span>
                       </div>
                       <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                           <Shield size={16} className="text-gray-400" />
                           <span>{formData.role}</span>
                       </div>
                        {formData.location && (
                           <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                               <MapPin size={16} className="text-gray-400" />
                               <span>{formData.location}</span>
                           </div>
                       )}
                   </div>
               </div>
           </div>
        </div>

        {/* --- RIGHT COLUMN: EDIT FORM --- */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            
            {/* Form Header */}
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
              <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Details</h3>
                  <p className="text-xs text-gray-500">Update your personal information</p>
              </div>
              {/* Save Button Top */}
               <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-70"
                 >
                   {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                   Save
               </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-8">
              
              {/* 1. Interactive Avatar Selection */}
              <div className="flex items-start gap-6">
                  <div className="relative" ref={avatarRef}>
                      <div 
                         onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                         className="relative w-24 h-24 rounded-2xl overflow-hidden cursor-pointer group ring-4 ring-transparent hover:ring-indigo-100 dark:hover:ring-indigo-900 transition-all"
                      >
                          <img src={formData.avatar} className="w-full h-full object-cover" alt="Current" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="text-white" size={24} />
                          </div>
                      </div>

                      {/* THE AVATAR PANEL */}
                      {isAvatarMenuOpen && (
                          <div className="absolute top-full left-0 mt-3 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 w-64 animate-in zoom-in-95 duration-200">
                              <div className="flex justify-between items-center mb-3">
                                  <span className="text-xs font-bold text-gray-500 uppercase">Select Avatar</span>
                                  <button onClick={(e) => { e.preventDefault(); setIsAvatarMenuOpen(false); }} className="text-gray-400 hover:text-gray-600"><X size={14}/></button>
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                  {avatars.map((av) => (
                                      <button 
                                          key={av.src}
                                          type="button"
                                          onClick={() => { setFormData({ ...formData, avatar: av.src }); setIsAvatarMenuOpen(false); }}
                                          className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-square ${formData.avatar === av.src ? 'border-indigo-600' : 'border-transparent hover:border-gray-300'}`}
                                      >
                                          <img src={av.src} alt={av.label} className="w-full h-full object-cover" />
                                      </button>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>

                  <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Profile Photo</h4>
                      <p className="text-sm text-gray-500 mb-3">Click the image to choose from our preset collection.</p>
                      <button 
                        type="button"
                        onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        Change Photo
                      </button>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <User size={16} className="text-gray-400" /> Full Name
                  </label>
                  <input 
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Your Name"
                  />
                </div>

                {/* Role Selector */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Briefcase size={16} className="text-gray-400" /> Job Role
                  </label>
                  <div className="relative">
                      <select 
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                      >
                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-3 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>

                {/* Email (Read Only) */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" /> Email Address
                  </label>
                  <input 
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400">Contact admin to change email.</p>
                </div>
              </div>

              {/* Feedback Message */}
              {successMsg && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                    <CheckCircle2 size={20} />
                    <span className="font-medium">{successMsg}</span>
                </div>
              )}

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}