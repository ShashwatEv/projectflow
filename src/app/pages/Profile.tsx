import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Save, CheckCircle2, User, Mail, Shield } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '', // Email is usually read-only
    role: '',
    avatar: ''
  });

  const avatars = [
    { id: 'male', src: '../Avatar/male.jpg', label: 'Male' },
    { id: 'female', src: '../Avatar/female.jpg', label: 'Female' },
    { id: 'default', src: '../Avatar/pfp.jpg', label: 'Default' },
  ];

  // 1. Fetch User Data
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
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
            avatar: data.avatar || '../Avatar/pfp.jpg'
          });
        }
        setLoading(false);
      };
      fetchProfile();
    }
  }, [user]);

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
          avatar: formData.avatar
        })
        .eq('id', user.id);

      if (error) throw error;
      
      // Show success message
      setSuccessMsg('Profile updated successfully!');
      
      // Hide message after 3 seconds
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
    <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <img 
                src={formData.avatar} 
                alt="Profile" 
                className="w-32 h-32 rounded-full object-cover border-4 border-indigo-50 dark:border-indigo-900/30" 
              />
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-white dark:border-gray-800 rounded-full"></div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{formData.name}</h2>
            <p className="text-indigo-600 dark:text-indigo-400 font-medium text-sm">{formData.role}</p>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white">Edit Details</h3>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              
              {/* Avatar Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Change Avatar</label>
                <div className="flex gap-4">
                  {avatars.map((av) => (
                    <div 
                      key={av.id}
                      onClick={() => setFormData({ ...formData, avatar: av.src })}
                      className={`relative cursor-pointer group transition-all ${
                        formData.avatar === av.src ? 'scale-110' : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img 
                        src={av.src} 
                        alt={av.label} 
                        className={`w-14 h-14 rounded-full object-cover border-2 ${
                          formData.avatar === av.src ? 'border-indigo-600' : 'border-transparent'
                        }`} 
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <User size={16} /> Full Name
                  </label>
                  <input 
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Shield size={16} /> Role
                  </label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  >
                    <option>Member</option>
                    <option>Developer</option>
                    <option>Designer</option>
                    <option>Manager</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Mail size={16} /> Email Address
                  </label>
                  <input 
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-between">
                 {successMsg ? (
                    <div className="flex items-center gap-2 text-green-600 font-medium animate-in fade-in slide-in-from-left-2">
                        <CheckCircle2 size={18} /> {successMsg}
                    </div>
                 ) : (
                    <div></div> // Spacer
                 )}

                 <button 
                  type="submit" 
                  disabled={saving}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-70"
                 >
                   {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
                 </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}