import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, Mail, MapPin, Globe, Phone, Save, Loader2, Camera, 
  Sparkles, ExternalLink, CheckCircle2, BadgeCheck, MessageSquare,
  Briefcase, CheckSquare, Clock, ShieldCheck
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { toast } from 'sonner';

const SUPER_ADMIN_EMAIL = 'shashwatop69@gmail.com';

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
  is_verified?: boolean;
  created_at?: string;
}

export default function Profile() {
  const { id: paramUserId } = useParams();
  const navigate = useNavigate();
  const theme = useAccentTheme();

  const [currentAuthId, setCurrentAuthId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Activity stats from Supabase
  const [stats, setStats] = useState({
    completedTasks: 0,
    activeTasks: 0,
  });

  // Editable Form Fields
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

  // 1. Fetch user data & task metrics from Supabase
  const loadProfile = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const authUser = authData?.user;
      if (!authUser && !paramUserId) return;

      const currentId = authUser?.id || '';
      setCurrentAuthId(currentId);

      const targetUserId = paramUserId || currentId;

      // Fetch user profile row
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const email = data?.email || (targetUserId === currentId ? authUser?.email : '') || '';
      const isSuperAdmin = email.toLowerCase().trim() === SUPER_ADMIN_EMAIL;

      const loadedProfile: UserProfile = {
        id: targetUserId,
        name: data?.name || (targetUserId === currentId ? authUser?.user_metadata?.full_name : 'Member') || 'Member',
        email,
        role: isSuperAdmin ? 'Admin' : (data?.role || 'Member'),
        bio: data?.bio || '',
        location: data?.location || '',
        website: data?.website || '',
        phone: data?.phone || '',
        avatar: data?.avatar || (targetUserId === currentId ? authUser?.user_metadata?.avatar_url : '/pfp.jpg') || '/pfp.jpg',
        is_verified: Boolean(data?.is_verified || isSuperAdmin),
        created_at: data?.created_at,
      };

      setProfile(loadedProfile);
      setFullName(loadedProfile.name);
      setRole(loadedProfile.role || 'Member');
      setLocation(loadedProfile.location || '');
      setWebsite(loadedProfile.website || '');
      setPhone(loadedProfile.phone || '');
      setBio(loadedProfile.bio || '');
      setSelectedAvatar(loadedProfile.avatar || '/pfp.jpg');

      // Fetch actual task stats for this user
      const { count: completedCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', targetUserId)
        .eq('status', 'done');

      const { count: activeCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', targetUserId)
        .neq('status', 'done');

      setStats({
        completedTasks: completedCount || 0,
        activeTasks: activeCount || 0,
      });

    } catch (err: any) {
      console.error('Error fetching profile:', err);
      toast.error('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();

    // Subscribe to realtime updates for this user's profile
    const channel = supabase
      .channel(`profile_realtime_${paramUserId || 'me'}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        () => loadProfile()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [paramUserId]);

  const isOwnProfile = !paramUserId || paramUserId === currentAuthId;
  const isSuperAdminAccount = profile?.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !isOwnProfile) return;

    setSaving(true);
    try {
      const updates = {
        name: fullName.trim(),
        role: isSuperAdminAccount ? 'Admin' : role.trim(),
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
      toast.success('Profile credentials synchronized!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const startDM = () => {
    if (!currentAuthId || !profile) return;
    const ids = [currentAuthId, profile.id].sort();
    navigate(`/messages/dm_${ids[0]}_${ids[1]}`);
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-gray-400 space-y-3">
        <Loader2 size={30} className={`animate-spin ${theme.textAccent}`} />
        <p className="text-xs tracking-wide">Syncing workspace profile...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 text-gray-900 dark:text-gray-200 animate-in fade-in duration-300">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {isOwnProfile ? 'My Profile' : 'Team Member Profile'}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${theme.bgSubtle} ${theme.textAccent} border ${theme.borderAccent}/30 flex items-center gap-1`}>
              <Sparkles size={11} /> {isOwnProfile ? 'Live Identity' : 'Directory View'}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isOwnProfile
              ? 'Manage your personal workspace persona, contact channels, and system credentials.'
              : `Review profile details, assignments, and contact channels for ${profile?.name}.`}
          </p>
        </div>

        {isOwnProfile ? (
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl ${theme.btnPrimary} font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50`}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Save Profile</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={startDM}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl ${theme.btnPrimary} font-bold text-xs shadow-md transition-all active:scale-95`}
          >
            <MessageSquare size={14} />
            <span>Send Direct Message</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Modern Interactive ID Badge */}
        <div className="lg:col-span-5 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-xl overflow-hidden">
          
          {/* Cover Art Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 relative">
            {/* Floating Round Avatar */}
            <div className="absolute left-1/2 -bottom-12 -translate-x-1/2 z-10">
              <div className="relative">
                <img
                  src={isOwnProfile ? selectedAvatar : profile?.avatar}
                  alt={fullName || 'User'}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-[#161b22] shadow-2xl bg-white dark:bg-[#0d1117]"
                />
                <span 
                  className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#161b22] rounded-full shadow-sm" 
                  title="Active in workspace" 
                />
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="pt-16 pb-6 px-6 text-center space-y-5">
            <div>
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {isOwnProfile ? (fullName || 'Workspace Member') : profile?.name}
                </h2>
                {profile?.is_verified && (
                  <span title="Verified Workspace Identity" className="text-blue-500">
                    <BadgeCheck size={19} className="fill-blue-500/20" />
                  </span>
                )}
              </div>

              <div className="flex items-center justify-center gap-1.5 mt-1">
                <span className={`text-xs font-semibold ${theme.textAccent} tracking-wide uppercase`}>
                  {isOwnProfile ? (role || 'Member') : profile?.role}
                </span>
                {isSuperAdminAccount && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[10px] font-bold">
                    Root Admin
                  </span>
                )}
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 dark:bg-[#0d1117] border border-gray-100 dark:border-gray-800 rounded-2xl space-y-0.5">
                <div className="flex items-center justify-center gap-1 text-gray-400">
                  <CheckSquare size={13} className="text-emerald-500" />
                  <span className="text-[10px] uppercase font-bold">Completed</span>
                </div>
                <p className="text-base font-black text-gray-900 dark:text-white font-mono">
                  {stats.completedTasks}
                </p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-[#0d1117] border border-gray-100 dark:border-gray-800 rounded-2xl space-y-0.5">
                <div className="flex items-center justify-center gap-1 text-gray-400">
                  <Clock size={13} className={theme.textAccent} />
                  <span className="text-[10px] uppercase font-bold">In Flight</span>
                </div>
                <p className="text-base font-black text-gray-900 dark:text-white font-mono">
                  {stats.activeTasks}
                </p>
              </div>
            </div>

            {/* Bio Callout */}
            <div className="bg-gray-50 dark:bg-[#0d1117]/80 border border-gray-200 dark:border-gray-800/80 rounded-2xl p-4 text-left space-y-3 text-xs shadow-inner">
              <p className="italic text-gray-600 dark:text-gray-300 leading-relaxed text-[11px] border-b border-gray-200 dark:border-gray-800 pb-2">
                {(isOwnProfile ? bio : profile?.bio) || '"Focused on building performant software applications."'}
              </p>
              
              {/* Contact & Meta Stack */}
              <div className="space-y-2.5 text-gray-600 dark:text-gray-400 text-xs">
                <div className="flex items-center gap-2.5">
                  <Mail size={14} className="shrink-0 text-gray-400" />
                  <span className="truncate select-all">{profile?.email}</span>
                </div>

                {(isOwnProfile ? phone : profile?.phone) && (
                  <div className="flex items-center gap-2.5">
                    <Phone size={14} className="shrink-0 text-gray-400" />
                    <span className="truncate select-all">{isOwnProfile ? phone : profile?.phone}</span>
                  </div>
                )}

                {(isOwnProfile ? location : profile?.location) && (
                  <div className="flex items-center gap-2.5">
                    <MapPin size={14} className="shrink-0 text-gray-400" />
                    <span className="truncate">{isOwnProfile ? location : profile?.location}</span>
                  </div>
                )}

                {(isOwnProfile ? website : profile?.website) && (
                  <div className="flex items-center gap-2.5 pt-1">
                    <Globe size={14} className={`shrink-0 ${theme.textAccent}`} />
                    <a
                      href={(isOwnProfile ? website : profile?.website)?.startsWith('http') 
                        ? (isOwnProfile ? website : profile?.website) 
                        : `https://${isOwnProfile ? website : profile?.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className={`truncate ${theme.textAccent} ${theme.textHover} inline-flex items-center gap-1 transition-colors font-semibold`}
                    >
                      <span>{(isOwnProfile ? website : profile?.website)?.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Edit Form Canvas or Read-Only Directory Summary */}
        <div className="lg:col-span-7 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          
          {isOwnProfile ? (
            <>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">Edit Identity Details</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Update how your profile appears across project tasks, code commits, and team channels.</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                
                {/* Avatar Selector Tray */}
                <div className="p-4 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src={selectedAvatar}
                    alt="Selected"
                    className="w-16 h-16 rounded-2xl object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
                  />
                  <div className="space-y-1.5 flex-1 text-center sm:text-left">
                    <div className="text-xs font-semibold text-gray-900 dark:text-white flex items-center justify-center sm:justify-start gap-1.5">
                      <Camera size={14} className={theme.textAccent} />
                      <span>Workspace Avatar</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Choose your active display portrait:</p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                      {avatarOptions.map((av) => {
                        const isSelected = selectedAvatar === av.src;
                        return (
                          <button
                            type="button"
                            key={av.id}
                            onClick={() => setSelectedAvatar(av.src)}
                            className={`text-xs px-3 py-1.5 rounded-xl font-semibold border flex items-center gap-1.5 transition-all ${
                              isSelected
                                ? `${theme.borderAccent} ${theme.textAccent}${theme.bgSubtle} shadow-sm`
                                : 'border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-[#161b22]'
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
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`w-full bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white outline-none ${theme.ringAccent} transition-colors`}
                    />
                  </div>

                  {/* Role Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Job Title / Role</label>
                    <input
                      type="text"
                      disabled={isSuperAdminAccount}
                      value={isSuperAdminAccount ? 'Admin (Root Owner)' : role}
                      onChange={(e) => setRole(e.target.value)}
                      className={`w-full bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white outline-none ${theme.ringAccent} transition-colors ${
                        isSuperAdminAccount ? 'cursor-not-allowed text-amber-500 font-bold' : ''
                      }`}
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Jabalpur, India"
                      className={`w-full bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white outline-none ${theme.ringAccent} transition-colors`}
                    />
                  </div>

                  {/* Optional Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className={`w-full bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white outline-none ${theme.ringAccent} transition-colors`}
                    />
                  </div>

                  {/* Website / Portfolio */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Portfolio URL</label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://threed-portfolio-2rae.onrender.com/"
                      className={`w-full bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white outline-none ${theme.ringAccent} transition-colors`}
                    />
                  </div>

                  {/* Bio Field */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Workspace Tagline / Bio</label>
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Brief note about your engineering domain..."
                      className={`w-full bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white outline-none ${theme.ringAccent} transition-colors`}
                    />
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl ${theme.btnPrimary} font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50`}
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    <span>Save Profile</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Workspace Activity Overview</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Collaboration history and assignments for {profile?.name}.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Assigned Tasks In-Flight</span>
                    <p className="text-[11px] text-gray-500">Currently active on project boards</p>
                  </div>
                  <span className="text-lg font-bold font-mono text-gray-900 dark:text-white">{stats.activeTasks}</span>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Completed Deliverables</span>
                    <p className="text-[11px] text-gray-500">Total closed issues & user stories</p>
                  </div>
                  <span className="text-lg font-bold font-mono text-emerald-500">{stats.completedTasks}</span>
                </div>

                {profile?.created_at && (
                  <div className="p-4 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Member Since</span>
                      <p className="text-[11px] text-gray-500">First joined workspace</p>
                    </div>
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/team')}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  ← Back to Team Directory
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}