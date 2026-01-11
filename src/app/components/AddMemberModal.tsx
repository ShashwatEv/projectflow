import { useState } from 'react';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMemberAdded: () => void;
}

export default function AddMemberModal({ isOpen, onClose, onMemberAdded }: AddMemberModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Member',
    avatar: '/pfp.jpg' // Default selection
  });

  if (!isOpen) return null;

  const avatars = [
    { id: 'male', src: '/male.jpg', label: 'Male' },
    { id: 'female', src: '/female.jpg', label: 'Female' },
    { id: 'default', src: '/pfp.jpg', label: 'Default' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create a new user profile directly in the database
      // Note: This creates a profile, but the user still needs to Sign Up 
      // with this email to actually log in.
      const { error } = await supabase.from('users').insert({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        avatar: formData.avatar,
        status: 'offline'
      });

      if (error) throw error;
      
      onMemberAdded();
      onClose();
      setFormData({ name: '', email: '', role: 'Member', avatar: '/pfp.jpg' });
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Failed to add member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">Add New Team Member</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Avatar Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select Avatar</label>
            <div className="flex gap-4 justify-center">
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
                    className={`w-16 h-16 rounded-full object-cover border-2 ${
                      formData.avatar === av.src ? 'border-indigo-600 shadow-md shadow-indigo-500/30' : 'border-transparent'
                    }`} 
                  />
                  {formData.avatar === av.src && (
                    <div className="absolute -top-1 -right-1 bg-indigo-600 text-white rounded-full p-0.5">
                      <CheckCircle2 size={12} />
                    </div>
                  )}
                  <p className="text-xs text-center mt-2 font-medium text-gray-600 dark:text-gray-400">{av.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <input 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full mt-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Sarah Connor"
                />
            </div>
            <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                <input 
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full mt-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. sarah@example.com"
                />
            </div>
            <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full mt-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option>Member</option>
                  <option>Developer</option>
                  <option>Designer</option>
                  <option>Manager</option>
                </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Add Member'}
          </button>
        </form>
      </div>
    </div>
  );
}