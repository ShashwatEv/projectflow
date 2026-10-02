import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { 
  Loader2, Save, Mail, Camera, MapPin, 
  X, Globe, Lock, CheckCircle2 
} from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user: currentUser } = useAuth();
  const { id } = useParams();

  const targetUserId = id || currentUser?.id;
  const isOwnProfile = currentUser?.id === targetUserId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    bio: '',
    website: '',
  });

  // Local static public presets (no external web URLs)
  const avatars = [
    { src: '/male.jpg', label: 'Male' },
    { src: '/female.jpg', label: 'Female' },
    { src: '/pfp.jpg', label: 'Bot / Default' },
  ];

  // Local fallback if an image path fails to resolve
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/pfp.jpg';
  };

  // 1. Fetch Profile Data
  useEffect(() => {
    if (!targetUserId) return;

    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', targetUserId)
          .single();

        if (!error && data) {
          // Normalize avatar: if saved with an external URL, fallback to local preset
          let cleanAvatar = data.avatar || '/pfp.jpg';
          if (cleanAvatar.startsWith('http')) {
            cleanAvatar = '/pfp.jpg';
          }

          setFormData({
            name: data.name || '',
            email: data.email || '',
            role: data.role || 'Member',
            avatar: cleanAvatar,
            location: data.location || '',
            phone: data.phone || '',
            bio: data.bio || '',
            website: data.website || '',
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [targetUserId]);

  // Click outside to close avatar selector
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
        setIsAvatarMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 2. Save Changes & Broadcast Sync Event
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isOwnProfile || !currentUser) return;

    setSaving(true);
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
          website: formData.website,
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');

      // Notify ModernHeader to immediately sync avatar and profile details
      window.dispatchEvent(new Event('user-profile-updated'));
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" size={32} />
      </div>
    );
  }

  return (
    <div className="relative min-h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-orange-500/5 blur-3xl" />
        <div className="absolute top-[10%] right-[0%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <div className="relative p-6 md:p-10 max-w-7xl mx-auto animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {isOwnProfile ? 'My Profile' : `${formData.name}'s Profile`}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs">
              {isOwnProfile ? 'Manage your identity and team presence.' : 'View team member details.'}
            </p>
          </div>

          {!isOwnProfile && (
            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <Lock size={14} /> View Only Mode
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* --- LEFT COLUMN: PROFILE CARD --- */}
          <div className="lg:col-span-4 space-y-6">
            <div className="group relative bg-white dark:bg-[#161b22] rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300">
              {/* Header Gradient */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 z-0" />

              {/* Avatar Preview */}
              <div className="relative z-10 mx-auto w-32 h-32 mb-4">
                <img
                  src={formData.avatar}
                  onError={handleImageError}
                  alt={formData.name || 'Profile'}
                  className="w-full h-full rounded-full object-cover border-4 border-white dark:border-[#161b22] shadow-lg bg-gray-900"
                />
                <div className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-[#161b22] rounded-full" />
              </div>

              <div className="relative z-10 text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {formData.name || 'Workspace User'}
                </h2>
                <p className="text-orange-500 font-semibold text-xs mb-6">
                  {formData.role}
                </p>

                <div className="space-y-4 text-left bg-gray-50 dark:bg-[#0d1117] p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80">
                  {formData.bio && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 italic mb-3">
                      "{formData.bio}"
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                    <Mail size={15} className="text-gray-400 shrink-0" />
                    <span className="truncate">{formData.email || 'No email provided'}</span>
                  </div>
                  {formData.location && (
                    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                      <MapPin size={15} className="text-gray-400 shrink-0" />
                      <span>{formData.location}</span>
                    </div>
                  )}
                  {formData.website && (
                    <div className="flex items-center gap-3 text-xs text-orange-500">
                      <Globe size={15} className="shrink-0" />
                      <a
                        href={formData.website}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate hover:underline"
                      >
                        {formData.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: EDIT FORM --- */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-[#161b22] rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0d1117]/50 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {isOwnProfile ? 'Edit Details' : 'Professional Details'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {isOwnProfile ? 'Update your personal information' : 'View Only Mode'}
                  </p>
                </div>
                {isOwnProfile && (
                  <button
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm disabled:opacity-70"
                  >
                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    Save
                  </button>
                )}
              </div>

              <form onSubmit={handleSave} className="p-8 space-y-6">
                {/* 1. Public Avatar Picker (Only for Own Profile) */}
                {isOwnProfile && (
                  <div className="flex items-start gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="relative" ref={avatarRef}>
                      <div
                        onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                        className="relative w-20 h-20 rounded-2xl overflow-hidden cursor-pointer group ring-4 ring-transparent hover:ring-orange-500/20 transition-all border border-gray-700 bg-gray-800"
                      >
                        <img
                          src={formData.avatar}
                          onError={handleImageError}
                          className="w-full h-full object-cover"
                          alt="Current avatar"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="text-white" size={20} />
                        </div>
                      </div>

                      {/* Dropdown Popup */}
                      {isAvatarMenuOpen && (
                        <div className="absolute top-full left-0 mt-3 p-4 bg-[#161b22] rounded-2xl shadow-2xl border border-gray-800 z-50 w-72 animate-in zoom-in-95 duration-150">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                              Select Avatar
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsAvatarMenuOpen(false)}
                              className="text-gray-400 hover:text-white"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            {avatars.map((av) => (
                              <button
                                key={av.src}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, avatar: av.src });
                                  setIsAvatarMenuOpen(false);
                                }}
                                className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-square bg-[#0d1117] ${
                                  formData.avatar === av.src
                                    ? 'border-orange-500 ring-2 ring-orange-500/40 scale-105'
                                    : 'border-gray-700 hover:border-gray-500'
                                }`}
                              >
                                <img
                                  src={av.src}
                                  alt={av.label}
                                  onError={handleImageError}
                                  className="w-full h-full object-cover"
                                />
                                {formData.avatar === av.src && (
                                  <div className="absolute top-1 right-1 bg-orange-600 rounded-full p-0.5 text-white">
                                    <CheckCircle2 size={10} />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-semibold text-xs text-gray-900 dark:text-white">Profile Photo</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Choose an avatar bundled in your local workspace.
                      </p>
                    </div>
                  </div>
                )}

                {/* Form Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">Full Name</label>
                    <input
                      disabled={!isOwnProfile}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none focus:border-orange-500 transition-colors disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">Role</label>
                    <input
                      disabled={!isOwnProfile}
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none focus:border-orange-500 transition-colors disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">Location</label>
                    <input
                      disabled={!isOwnProfile}
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Jabalpur, India"
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none focus:border-orange-500 transition-colors disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">Website</label>
                    <input
                      disabled={!isOwnProfile}
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none focus:border-orange-500 transition-colors disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 font-semibold mb-1 text-xs">Bio</label>
                  <textarea
                    rows={3}
                    disabled={!isOwnProfile}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell your team about yourself..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none focus:border-orange-500 transition-colors resize-none text-xs disabled:opacity-60"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}