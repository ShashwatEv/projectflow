import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import { useAccentTheme } from '../../../lib/useAccentTheme';
import {
  Save,
  Loader2,
  CheckCircle2,
  Check,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  ChevronDown,
  BadgeCheck,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { getGoogleProfilePhoto } from '../../../lib/profileAvatar';
import { isSuperAdmin as checkIsSuperAdmin } from '../../../lib/constants';
import AvatarWithFrame, {
  AVATAR_FRAMES,
  type AvatarFrameId,
} from '../../components/AvatarWithFrame';

const FRAME_STORAGE_KEY = 'pf_user_avatar_frame';

function normalizeFrameId(value: unknown): AvatarFrameId | null {
  if (typeof value !== 'string') return null;
  return AVATAR_FRAMES.some((frame) => frame.id === value) ? (value as AvatarFrameId) : null;
}

function getSavedFrame(): AvatarFrameId {
  if (typeof window === 'undefined') return 'blue-sparkles';
  return normalizeFrameId(localStorage.getItem(FRAME_STORAGE_KEY)) ?? 'blue-sparkles';
}

export default function ProfileSettings() {
  const { user } = useAuth();
  const theme = useAccentTheme();

  const isSuperAdmin = checkIsSuperAdmin(user?.email, user?.role);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    role: isSuperAdmin ? 'Admin' : user?.role || 'Member',
    location: user?.location || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '/pfp.jpg',
    is_verified: false,
  });

  const [selectedFrame, setSelectedFrame] = useState<AvatarFrameId>(() => getSavedFrame());
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [googleAvatar, setGoogleAvatar] = useState<string | null>(null);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  const avatars = [
    { src: '/male.jpg', label: 'Male' },
    { src: '/female.jpg', label: 'Female' },
    { src: '/pfp.jpg', label: 'Default' },
    ...(googleAvatar ? [{ src: googleAvatar, label: 'Google' }] : []),
  ];

  // "Admin" is removed completely from the selectable list
  const availableRoles = [
    'Member',
    'Developer',
    'Senior Developer',
    'Designer',
    'Product Manager',
    'Project Manager',
    'Intern',
  ];

  useEffect(() => {
    async function loadUserData() {
      if (!user?.id) return;
      try {
        const { data: authData } = await supabase.auth.getUser();
        const authUser = authData?.user;
        setGoogleAvatar(getGoogleProfilePhoto(authUser));
        const isAuthEmailConfirmed = Boolean(authUser?.email_confirmed_at);

        const { data: dbData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (dbData) {
          const verified = Boolean(
            (isAuthEmailConfirmed && dbData.email_verified) ||
              dbData.is_verified ||
              (isAuthEmailConfirmed && isSuperAdmin)
          );

          setFormData({
            name: dbData.name || user.name || '',
            role: isSuperAdmin ? 'Admin' : dbData.role || 'Member',
            location: dbData.location || '',
            email: dbData.email || user.email || '',
            phone: dbData.phone || '',
            avatar: dbData.avatar || '/pfp.jpg',
            is_verified: verified,
          });

          const dbUserRow = dbData as Record<string, unknown>;
          const dbFrame = normalizeFrameId(dbUserRow.avatar_frame);
          if (dbFrame) {
            setSelectedFrame(dbFrame);
            localStorage.setItem(FRAME_STORAGE_KEY, dbFrame);
            window.dispatchEvent(new CustomEvent('avatar-frame-updated', { detail: dbFrame }));
          }
        }
      } catch (err) {
        console.error('Error fetching profile settings:', err);
      }
    }

    loadUserData();
  }, [user?.id, isSuperAdmin]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target as Node)) {
        setIsAvatarPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectFrame = (frameId: AvatarFrameId) => {
    setSelectedFrame(frameId);
    localStorage.setItem(FRAME_STORAGE_KEY, frameId);
    window.dispatchEvent(new CustomEvent('avatar-frame-updated', { detail: frameId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user?.id) return;

      const finalRole = isSuperAdmin ? 'Admin' : formData.role;

      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name.trim(),
          avatar: formData.avatar,
          avatar_frame: selectedFrame,
          role: finalRole,
          location: formData.location.trim(),
          phone: formData.phone.trim(),
        } as Record<string, unknown>)
        .eq('id', user.id);

      if (error) throw error;

      localStorage.setItem('pf_user_name', formData.name.trim());
      localStorage.setItem('pf_user_avatar', formData.avatar);
      localStorage.setItem(FRAME_STORAGE_KEY, selectedFrame);
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('user-profile-updated'));
      window.dispatchEvent(new CustomEvent('avatar-frame-updated', { detail: selectedFrame }));

      setIsLoading(false);
      setSuccess(true);
      toast.success('Profile updated successfully!');
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(message);
      setIsLoading(false);
    }
  };

  const activeAvatarLabel =
    avatars.find((av) => av.src === formData.avatar)?.label ?? 'Custom';

  return (
    <div className="max-w-6xl mx-auto h-full animate-in fade-in duration-300 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
            Manage your identity and team presence.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className={`px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 ${theme.btnPrimary} disabled:opacity-60`}
        >
          {isLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : success ? (
            <CheckCircle2 size={14} />
          ) : (
            <Save size={14} />
          )}
          <span>{success ? 'Saved!' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* --- LEFT COLUMN: LIVE PREVIEW --- */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
            Live Preview
          </h3>

          <div className="bg-white dark:bg-[#161b22] rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800 sticky top-6">
            <div className="h-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
              <div className="absolute inset-0 bg-black/10" />
            </div>

            <div className="px-6 pb-7 relative">
              {/* Centered Circle Frame for Profile View */}
              <div className="relative -mt-12 mb-4 inline-flex items-center justify-center">
                <AvatarWithFrame
                  src={formData.avatar}
                  alt="Profile"
                  shape="circle"
                  frame={selectedFrame}
                  size={88}
                />
                <span
                  aria-hidden="true"
                  className="absolute bottom-1 right-1 z-10 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#161b22] rounded-full shadow-xs"
                />
              </div>

              <div className="text-left space-y-1">
                {/* Name + Verified Badge */}
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                    {formData.name || 'Your Name'}
                  </h2>
                  {formData.is_verified && (
                    <span
                      title="Verified Identity"
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-blue-500 shrink-0"
                    >
                      <BadgeCheck size={15} className="text-blue-500" />
                    </span>
                  )}
                </div>

                {/* Role and Root Admin Tag */}
                <div className="flex items-center gap-2 pt-0.5 pb-4">
                  <span className={`font-semibold text-xs ${theme.textAccent}`}>
                    {formData.role || 'Member'}
                  </span>
                  {isSuperAdmin && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[10px] font-bold">
                      Root Admin
                    </span>
                  )}
                </div>

                {/* Details Strip */}
                <div className="space-y-2.5 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs">
                  <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-300">
                    <div className="p-1.5 bg-gray-50 dark:bg-[#0d1117] rounded-lg text-gray-400 shrink-0">
                      <Mail size={14} />
                    </div>
                    <span className="truncate">{formData.email}</span>
                  </div>

                  {formData.phone && (
                    <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-300">
                      <div className="p-1.5 bg-gray-50 dark:bg-[#0d1117] rounded-lg text-gray-400 shrink-0">
                        <Phone size={14} />
                      </div>
                      <span>{formData.phone}</span>
                    </div>
                  )}

                  {formData.location && (
                    <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-300">
                      <div className="p-1.5 bg-gray-50 dark:bg-[#0d1117] rounded-lg text-gray-400 shrink-0">
                        <MapPin size={14} />
                      </div>
                      <span>{formData.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: EDIT FORM --- */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-[#161b22] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0d1117]/50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                Personal Information
              </h3>
              <span className="text-[11px] text-gray-500">Live preview sync</span>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {/* Avatar Selector */}
              <div ref={avatarMenuRef} className="relative">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Profile Image
                </label>

                <button
                  type="button"
                  onClick={() => setIsAvatarPickerOpen(!isAvatarPickerOpen)}
                  className="w-full flex items-center gap-4 p-3.5 border border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/40 dark:bg-[#0d1117]/40 hover:bg-gray-50 dark:hover:bg-[#0d1117] transition-colors group text-left"
                >
                  <AvatarWithFrame
                    src={formData.avatar}
                    shape="circle"
                    frame={selectedFrame}
                    size={46}
                    alt="Current"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-gray-900 dark:text-white">
                        Selected Portrait
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${theme.bgSubtle} ${theme.textAccent}`}
                      >
                        {activeAvatarLabel}
                      </span>
                    </div>
                    <p
                      className={`text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 transition-colors group-hover:${theme.textAccent}`}
                    >
                      {isAvatarPickerOpen ? 'Select a portrait below' : 'Click to switch portrait'}
                    </p>
                  </div>
                  <ChevronDown
                    size={15}
                    className={`text-gray-400 shrink-0 transition-transform ${
                      isAvatarPickerOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isAvatarPickerOpen && (
                  <div className="mt-2.5 p-4 bg-gray-50/80 dark:bg-[#0d1117]/80 rounded-2xl border border-gray-200 dark:border-gray-800 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Choose a Portrait
                      </p>
                      <span className="text-[10px] text-gray-400">
                        {avatars.length} available
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {avatars.map((av) => {
                        const isSelected = formData.avatar === av.src;
                        return (
                          <button
                            key={av.src}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, avatar: av.src });
                              setIsAvatarPickerOpen(false);
                            }}
                            className={`relative flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all ${
                              isSelected
                                ? `${theme.borderAccent} bg-[var(--app-accent-light)] shadow-xs`
                                : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] hover:border-gray-300 dark:hover:border-gray-700'
                            }`}
                          >
                            <div className="relative">
                              <img
                                src={av.src}
                                alt={av.label}
                                className="h-14 w-14 rounded-full object-cover object-center border-2 border-white dark:border-gray-800 shadow-xs"
                              />
                              {isSelected && (
                                <span
                                  className={`absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-white shadow-xs ${theme.toggleActive}`}
                                >
                                  <Check size={10} strokeWidth={3} />
                                </span>
                              )}
                            </div>
                            <span
                              className={`text-[11px] font-semibold leading-none ${
                                isSelected
                                  ? theme.textAccent
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {av.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Animated Avatar Frame Picker */}
              <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={14} className={theme.textAccent} />
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Avatar Frame
                    </label>
                  </div>
                  <Link
                    to="/avatar-studio"
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold hover:underline ${theme.textAccent}`}
                  >
                    <span>Open Avatar Studio</span>
                    <ArrowUpRight size={13} />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {AVATAR_FRAMES.map((frame) => {
                    const active = selectedFrame === frame.id;
                    return (
                      <button
                        key={frame.id}
                        type="button"
                        onClick={() => handleSelectFrame(frame.id)}
                        className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-all ${
                          active
                            ? `${theme.borderAccent} bg-[var(--app-accent-light)] shadow-xs`
                            : 'border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-[#0d1117]/60 hover:border-gray-300 dark:hover:border-gray-700'
                        }`}
                      >
                        <AvatarWithFrame
                          src={formData.avatar}
                          alt={frame.name}
                          shape="circle"
                          frame={frame.id}
                          size={44}
                        />
                        <span className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                          {frame.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputGroup
                  label="Full Name"
                  icon={<span className="text-xs font-bold">Aa</span>}
                  value={formData.name}
                  onChange={(v: string) => setFormData({ ...formData, name: v })}
                  placeholder="e.g. Shashwat"
                />

                {/* Role Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Job Title / Role
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <Briefcase size={14} />
                    </div>
                    {isSuperAdmin ? (
                      <input
                        type="text"
                        disabled
                        value="Admin (Root Owner)"
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-100 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-amber-500 font-bold outline-none cursor-not-allowed"
                      />
                    ) : (
                      <>
                        <select
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className={`w-full pl-9 pr-9 py-2.5 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl ${theme.ringAccent} outline-none text-xs text-gray-900 dark:text-white appearance-none cursor-pointer`}
                        >
                          {availableRoles.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                          <ChevronDown size={14} />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <InputGroup
                  label="Location"
                  icon={<MapPin size={14} />}
                  value={formData.location}
                  onChange={(v: string) => setFormData({ ...formData, location: v })}
                  placeholder="e.g. Jabalpur, India"
                />

                <InputGroup
                  label="Phone Number"
                  icon={<Phone size={14} />}
                  value={formData.phone}
                  onChange={(v: string) => setFormData({ ...formData, phone: v })}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface InputGroupProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

function InputGroup({ label, icon, value, onChange, placeholder }: InputGroupProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      <div className="relative group">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-white outline-none transition-all"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}