import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom'; // To read URL parameters
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Save, CheckCircle2, User, Mail, Shield, Camera, Briefcase, ChevronDown, MapPin, X, Globe, FileText, Lock } from 'lucide-react';

export default function Profile() {
  const { user: currentUser } = useAuth();
  const { id } = useParams(); // Get ID from URL (e.g. /profile/123)
  
  // LOGIC: If ID is present in URL, view that user. Otherwise, view "Me".
  const targetUserId = id || currentUser?.id;
  const isOwnProfile = currentUser?.id === targetUserId;

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
    phone: '',
    bio: '',     // <--- New Field
    website: ''  // <--- New Field
  });

  // Image Fallback Handler
  const handleImageError = (e: any) => {
    e.target.src = `https://ui-avatars.com/api/?name=${formData.name}&background=6366f1&color=fff`;
  };

  const avatars = [
    { src: '/male.jpg', label: 'Male' },
    { src: '/female.jpg', label: 'Female' },
    { src: '/pfp.jpg', label: 'Default' },
  ];

  const roles = [
    "Member", "Developer", "Senior Developer", "Designer", 
    "Product Manager", "Project Manager", "Admin", "Intern"
  ];

  // 1. Fetch Profile Data
  useEffect(() => {
    if (targetUserId) {
      const fetchProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', targetUserId)
            .single();

          if (data) {
            setFormData({
              name: data.name || '',
              email: data.email || '',
              role: data.role || 'Member',
              avatar: data.avatar || '/pfp.jpg',
              location: data.location || '',
              phone: data.phone || '',
              bio: data.bio || '',
              website: data.website || ''
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
  }, [targetUserId]);

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

  // 2. Save Changes (Only if Own Profile)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwnProfile || !currentUser) return; // Security Check

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
          phone: formData.phone,
          bio: formData.bio,
          website: formData.website
        })
        .eq('id', currentUser.id);

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
    <div className="relative min-h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      
      {/* PROFESSIONAL BACKGROUND (Abstract Shapes) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-3xl"></div>
          <div className="absolute top-[10%] right-[0%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-3xl"></div>
      </div>

      <div className="relative p-6 md:p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
             <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
               {isOwnProfile ? 'My Profile' : `${formData.name}'s Profile`}
             </h1>
             <p className="text-gray-500 dark:text-gray-400 mt-1">
               {isOwnProfile ? 'Manage your identity and team presence.' : 'View team member details.'}
             </p>
          </div>
          
          {!isOwnProfile && (
             <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <Lock size={14} /> View Only Mode
             </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- LEFT COLUMN: PROFILE CARD (3D Effect) --- */}
          <div className="lg:col-span-4 space-y-6">
             {/* The Card */}
             <div className="group relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 perspective-1000">
                 
                 {/* Card Background Gradient */}
                 <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 z-0"></div>
                 
                 {/* Avatar */}
                 <div className="relative z-10 mx-auto w-32 h-32 mb-4 group-hover:scale-105 transition-transform duration-500">
                     <img 
                       src={formData.avatar} 
                       onError={handleImageError} // <--- FIX: Handles broken images
                       alt="Profile" 
                       className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg bg-white" 
                     />
                     <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-gray-800 rounded-full"></div>
                 </div>

                 <div className="relative z-10 text-center">
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{formData.name}</h2>
                     <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-6">{formData.role}</p>
                     
                     <div className="space-y-4 text-left bg-gray-50 dark:bg-gray-700/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                         {formData.bio && (
                             <p className="text-sm text-gray-600 dark:text-gray-300 italic mb-4">"{formData.bio}"</p>
                         )}
                         <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                             <Mail size={16} className="text-gray-400 shrink-0" />
                             <span className="truncate">{formData.email}</span>
                         </div>
                         {formData.location && (
                             <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                 <MapPin size={16} className="text-gray-400 shrink-0" />
                                 <span>{formData.location}</span>
                             </div>
                         )}
                         {formData.website && (
                             <div className="flex items-center gap-3 text-sm text-indigo-600 dark:text-indigo-400">
                                 <Globe size={16} className="shrink-0" />
                                 <a href={formData.website} target="_blank" rel="noreferrer" className="truncate hover:underline">{formData.website}</a>
                             </div>
                         )}
                     </div>
                 </div>
             </div>
          </div>

          {/* --- RIGHT COLUMN: EDIT FORM --- */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              
              <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {isOwnProfile ? 'Edit Details' : 'Professional Details'}
                    </h3>
                    <p className="text-xs text-gray-500">
                        {isOwnProfile ? 'Update your personal information' : 'View Only Mode'}
                    </p>
                </div>
                {isOwnProfile && (
                 <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-70"
                   >
                     {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                     Save
                 </button>
                )}
              </div>
              
              <form onSubmit={handleSave} className="p-8 space-y-8">
                
                {/* 1. Avatar Selection (Only visible if Own Profile) */}
                {isOwnProfile && (
                    <div className="flex items-start gap-6 pb-8 border-b border-gray-100 dark:border-gray-800">
                        <div className="relative" ref={avatarRef}>
                            <div 
                               onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                               className="relative w-20 h-20 rounded-2xl overflow-hidden cursor-pointer group ring-4 ring-transparent hover:ring-indigo-100 dark:hover:ring-indigo-900 transition-all"
                            >
                                <img src={formData.avatar} onError={handleImageError} className="w-full h-full object-cover bg-gray-100" alt="Current" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="text-white" size={20} />
                                </div>
                            </div>

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
                            <p className="text-sm text-gray-500 mb-2">Click to choose from our professional presets.</p>
                        </div>
                    </div>
                )}

                {/* 2. Main Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                    <input 
                      disabled={!isOwnProfile}
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Job Role</label>
                    <div className="relative">
                        <select 
                          disabled={!isOwnProfile}
                          value={formData.role}
                          onChange={(e) => setFormData({...formData, role: e.target.value})}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {roles.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-3 text-gray-400 pointer-events-none" size={16} />
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Short Bio</label>
                    <textarea 
                      disabled={!isOwnProfile}
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      rows={2}
                      placeholder="Tell us a little about yourself..."
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location</label>
                     <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                        <input 
                            disabled={!isOwnProfile}
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            placeholder="e.g. New York, USA"
                        />
                     </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Website / Portfolio</label>
                     <div className="relative">
                        <Globe className="absolute left-3 top-3 text-gray-400" size={16} />
                        <input 
                            disabled={!isOwnProfile}
                            value={formData.website}
                            onChange={(e) => setFormData({...formData, website: e.target.value})}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            placeholder="https://..."
                        />
                     </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                    <input 
                      disabled
                      value={formData.email}
                      className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 cursor-not-allowed"
                    />
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
    </div>
  );
}