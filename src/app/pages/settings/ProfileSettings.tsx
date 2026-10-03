import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import { useAccentTheme } from '../../../lib/useAccentTheme';
import { 
  Save, Loader2, CheckCircle2, MapPin, Mail, Phone, Briefcase, 
  ChevronDown, BadgeCheck 
} from 'lucide-react';
import { toast } from 'sonner';

const SUPER_ADMIN_EMAIL = 'shashwatop69@gmail.com';

export default function ProfileSettings() {
  const { user } = useAuth();
  const theme = useAccentTheme();

  const isSuperAdmin = user?.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    role: isSuperAdmin ? 'Admin' : (user?.role || 'Member'),
    location: user?.location || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '/pfp.jpg',
    is_verified: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  const avatars = [
    { src: '/male.jpg', label: 'Male' },
    { src: '/female.jpg', label: 'Female' },
    { src: '/pfp.jpg', label: 'Default' },
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
            // Hardcode Admin for your account, otherwise use database role
            role: isSuperAdmin ? 'Admin' : (dbData.role || 'Member'),
            location: dbData.location || '',
            email: dbData.email || user.email || '',
            phone: dbData.phone || '',
            avatar: dbData.avatar || '/pfp.jpg',
            is_verified: verified,
          });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user?.id) return;

      // Hardcode Admin for your account, ensure nobody else can submit Admin
      const finalRole = isSuperAdmin ? 'Admin' : formData.role;

      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name.trim(),
          avatar: formData.avatar,
          role: finalRole,
          location: formData.location.trim(),
          phone: formData.phone.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      localStorage.setItem('pf_user_name', formData.name.trim());
      localStorage.setItem('pf_user_avatar', formData.avatar);
      window.dispatchEvent(new Event('storage'));

      setIsLoading(false);
      setSuccess(true);
      toast.success('Profile updated successfully!');
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-full animate-in fade-in duration-300 space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Manage your identity and team presence.</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 ${theme.btnPrimary} disabled:opacity-60`}
        >
          {isLoading ? <Loader2 size={15} className="animate-spin" /> : success ? <CheckCircle2 size={15} /> : <Save size={15} />}
          <span>{success ? 'Saved!' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT COLUMN: LIVE PREVIEW --- */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Live Preview</h3>

          <div className="bg-white dark:bg-[#161b22] rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800 sticky top-6">
            <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
              <div className="absolute inset-0 bg-black/10"></div>
            </div>

            <div className="px-6 pb-8 relative">
              {/* Avatar with Online Status */}
              <div className="relative -mt-12 mb-4 inline-block">
                <img
                  src={formData.avatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-[#161b22] shadow-md bg-white dark:bg-[#0d1117]"
                />
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-[#161b22] rounded-full shadow-sm" />
              </div>

              <div className="text-left space-y-1">
                {/* Name + Verified Badge */}
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                    {formData.name || 'Your Name'}
                  </h2>
                  {formData.is_verified && (
                    <span 
                      title="Verified Identity"
                      className="inline-flex items-center text-blue-500 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <BadgeCheck size={20} className="fill-blue-500/20 text-blue-500" />
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
                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <div className="p-2 bg-gray-50 dark:bg-[#0d1117] rounded-lg text-gray-400">
                      <Mail size={15} />
                    </div>
                    <span className="truncate">{formData.email}</span>
                  </div>

                  {formData.phone && (
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                      <div className="p-2 bg-gray-50 dark:bg-[#0d1117] rounded-lg text-gray-400">
                        <Phone size={15} />
                      </div>
                      <span>{formData.phone}</span>
                    </div>
                  )}

                  {formData.location && (
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                      <div className="p-2 bg-gray-50 dark:bg-[#0d1117] rounded-lg text-gray-400">
                        <MapPin size={15} />
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
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-[#161b22] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0d1117]/50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Personal Information</h3>
              <span className="text-[11px] text-gray-500">Live preview sync</span>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {/* Avatar Selector */}
              <div ref={avatarMenuRef} className="relative">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Profile Image</label>

                <div
                  onClick={() => setIsAvatarPickerOpen(!isAvatarPickerOpen)}
                  className="flex items-center gap-4 p-3 border border-gray-200 dark:border-gray-800 rounded-2xl cursor-pointer hover:bg-gray-50 dark:hover:bg-[#0d1117] transition-colors group"
                >
                  <img
                    src={formData.avatar}
                    className="w-12 h-12 rounded-full object-cover bg-gray-200 dark:bg-gray-800"
                    alt="Current"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-900 dark:text-white">Selected Avatar</p>
                    <p className="text-[11px] text-gray-500 group-hover:text-indigo-400 transition-colors">Click to switch portrait</p>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${isAvatarPickerOpen ? 'rotate-180' : ''}`}
                  />
                </div>

                {isAvatarPickerOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 p-4 bg-white dark:bg-[#161b22] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 z-10 animate-in zoom-in-95 duration-200">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Choose an Avatar</p>
                    <div className="grid grid-cols-3 gap-3">
                      {avatars.map((av) => (
                        <button
                          key={av.src}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, avatar: av.src });
                            setIsAvatarPickerOpen(false);
                          }}
                          className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
                            formData.avatar === av.src
                              ? `${theme.borderAccent} ring-2 ring-indigo-500/20`
                              : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
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
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Job Title / Role</label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-3 text-gray-400">
                      <Briefcase size={15} />
                    </div>
                    {isSuperAdmin ? (
                      <input
                        type="text"
                        disabled
                        value="Admin (Root Owner)"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-amber-500 font-bold outline-none cursor-not-allowed"
                      />
                    ) : (
                      <>
                        <select
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className={`w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl ${theme.ringAccent} outline-none text-xs text-gray-900 dark:text-white appearance-none cursor-pointer`}
                        >
                          {availableRoles.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3.5 top-3 text-gray-400 pointer-events-none">
                          <ChevronDown size={15} />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <InputGroup
                  label="Location"
                  icon={<MapPin size={15} />}
                  value={formData.location}
                  onChange={(v: string) => setFormData({ ...formData, location: v })}
                  placeholder="e.g. Jabalpur, India"
                />
                
                <InputGroup
                  label="Phone Number"
                  icon={<Phone size={15} />}
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

function InputGroup({ label, icon, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      <div className="relative group">
        <div className="absolute left-3.5 top-3 text-gray-400">{icon}</div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-white outline-none transition-all"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}