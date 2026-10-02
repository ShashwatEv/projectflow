import { useState, useEffect } from 'react';
import { 
  User, Mail, MapPin, Globe, Phone, Save, Loader2, Camera, 
  ShieldCheck, Sparkles, ExternalLink, CheckCircle2 
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role?: string;
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  avatar?: string;
}

export default function Profile() {
  const theme = useAccentTheme();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('/pfp.jpg');

  const avatarOptions = [
    { id: 'male', src: '/male.jpg', label: 'Male' },
    { id: 'female', src: '/female.jpg', label: 'Female' },
    { id: 'default', src: '/pfp.jpg', label: 'Default' },
  ];

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;

        if (!user) return;

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        const initialProfile: UserProfile = {
          id: user.id,
          name: data?.name || user.user_metadata?.full_name || 'Member',
          email: user.email || '',
          role: data?.role || 'Admin',
          bio: data?.bio || '"Founder of Project-Flow & Commune-X"',
          location: data?.location || 'Jabalpur, Madhya Pradesh, India',
          website: data?.website || 'https://threed-portfolio-2rae.onrender.com/',
          phone: data?.phone || '',
          avatar: data?.avatar || user.user_metadata?.avatar_url || '/pfp.jpg',
        };

        setProfile(initialProfile);
        setFullName(initialProfile.name);
        setRole(initialProfile.role || 'Admin');
        setLocation(initialProfile.location || '');
        setWebsite(initialProfile.website || '');
        setPhone(initialProfile.phone || '');
        setBio(initialProfile.bio || '');
        setSelectedAvatar(initialProfile.avatar || '/pfp.jpg');
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        toast.error('Failed to load profile details');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      const updates = {
        name: fullName.trim(),
        role: role.trim(),
        location: location.trim(),
        website: website.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        avatar: selectedAvatar,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', profile.id);

      if (error) throw error;

      // Keep local session storage aligned for global header sync
      localStorage.setItem('pf_user_name', fullName.trim());
      localStorage.setItem('pf_user_avatar', selectedAvatar);
      window.dispatchEvent(new Event('storage'));

      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-gray-400 space-y-3">
        <Loader2 size={30} className={`animate-spin ${theme.textAccent}`} />
        <p className="text-xs tracking-wide">Loading workspace credentials...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 text-gray-200 animate-in fade-in duration-300">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">My Profile</h1>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${theme.bgSubtle} ${theme.textAccent} border ${theme.borderAccent}/30 flex items-center gap-1`}>
              <Sparkles size={11} /> Live Identity
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Manage your personal workspace persona, contact channels, and system credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl ${theme.btnPrimary} font-bold text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50`}
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Modern Interactive ID Badge */}
<div className="lg:col-span-4 bg-[#161b22] border border-gray-800 rounded-3xl shadow-xl">
  
  {/* Cover Art Banner */}
  <div className="h-32 bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 rounded-t-3xl relative">
    {/* Floating Round Avatar */}
    <div className="absolute left-1/2 -bottom-12 -translate-x-1/2 z-10">
      <div className="relative">
        <img
          src={selectedAvatar}
          alt={fullName || 'User'}
          className="w-24 h-24 rounded-full object-cover border-4 border-[#161b22] shadow-2xl bg-[#0d1117]"
        />
        <span 
          className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-[#161b22] rounded-full shadow-sm" 
          title="Online in workspace" 
        />
      </div>
    </div>
  </div>

  {/* User Details */}
  <div className="pt-16 pb-6 px-6 text-center space-y-4">
    <div>
      <h2 className="text-xl font-bold text-white tracking-tight flex items-center justify-center gap-1.5">
        <span>{fullName || 'Workspace Member'}</span>
        <ShieldCheck size={16} className={theme.textAccent} />
      </h2>
      <p className={`text-xs font-semibold ${theme.textAccent} tracking-wide mt-0.5 uppercase`}>
        {role || 'Admin'}
      </p>
    </div>

            {/* Bio Callout */}
            <div className="bg-[#0d1117]/80 border border-gray-800/80 rounded-2xl p-4 text-left space-y-3 text-xs shadow-inner">
              <p className="italic text-gray-300 leading-relaxed text-[11px] border-b border-gray-800 pb-2">
                {bio || '"Focused on building performant software applications."'}
              </p>
              
              {/* Contact & Meta Stack */}
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center gap-2.5">
                  <Mail size={14} className="shrink-0 text-gray-500" />
                  <span className="truncate select-all">{profile?.email}</span>
                </div>

                {phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone size={14} className="shrink-0 text-gray-500" />
                    <span className="truncate select-all">{phone}</span>
                  </div>
                )}

                {location && (
                  <div className="flex items-center gap-2.5">
                    <MapPin size={14} className="shrink-0 text-gray-500" />
                    <span className="truncate">{location}</span>
                  </div>
                )}

                {website && (
                  <div className="flex items-center gap-2.5 pt-1">
                    <Globe size={14} className={`shrink-0 ${theme.textAccent}`} />
                    <a
                      href={website.startsWith('http') ? website : `https://${website}`}
                      target="_blank"
                      rel="noreferrer"
                      className={`truncate ${theme.textAccent} ${theme.textHover} inline-flex items-center gap-1 transition-colors font-medium`}
                    >
                      <span>{website.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Edit Form Canvas */}
        <div className="lg:col-span-8 bg-[#161b22] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Edit Details</h3>
            <p className="text-xs text-gray-400">Customize how your peers see your profile across projects and chats.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            
            {/* Avatar Selector Tray */}
            <div className="p-4 bg-[#0d1117] border border-gray-800 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
              <img
                src={selectedAvatar}
                alt="Selected"
                className="w-16 h-16 rounded-xl object-cover border border-gray-700 shadow-md"
              />
              <div className="space-y-1.5 flex-1 text-center sm:text-left">
                <div className="text-xs font-semibold text-white flex items-center justify-center sm:justify-start gap-1.5">
                  <Camera size={14} className={theme.textAccent} />
                  <span>Workspace Avatar</span>
                </div>
                <p className="text-[11px] text-gray-400">Choose your active display portrait:</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                  {avatarOptions.map((av) => {
                    const isSelected = selectedAvatar === av.src;
                    return (
                      <button
                        type="button"
                        key={av.id}
                        onClick={() => setSelectedAvatar(av.src)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold border flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? `${theme.borderAccent} ${theme.textAccent}${theme.bgSubtle} shadow-sm`
                            : 'border-gray-800 text-gray-400 hover:text-white bg-[#161b22]'
                        }`}
                      >
                        {isSelected && <CheckCircle2 size={12} />}
                        <span>{av.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full bg-[#0d1117] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none ${theme.ringAccent} transition-colors`}
                />
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Role / Position</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={`w-full bg-[#0d1117] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none ${theme.ringAccent} transition-colors`}
                />
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. City, Country"
                  className={`w-full bg-[#0d1117] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none ${theme.ringAccent} transition-colors`}
                />
              </div>

              {/* Optional Phone Number */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-gray-300">Phone Number</label>
                  <span className="text-[10px] text-gray-500 font-medium">Optional</span>
                </div>
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className={`w-full pl-10 pr-4 py-2.5 bg-[#0d1117] border border-gray-800 rounded-xl text-xs text-white outline-none ${theme.ringAccent} transition-colors`}
                  />
                </div>
              </div>

              {/* Website / Portfolio */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-gray-300">Website or Portfolio URL</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourportfolio.com"
                  className={`w-full bg-[#0d1117] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none ${theme.ringAccent} transition-colors`}
                />
              </div>

              {/* Bio Field */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-gray-300">Workspace Bio / Tagline</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="A brief sentence about your focus or interests..."
                  className={`w-full bg-[#0d1117] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none ${theme.ringAccent} transition-colors`}
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl ${theme.btnPrimary} font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50`}
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                <span>Save Profile</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}