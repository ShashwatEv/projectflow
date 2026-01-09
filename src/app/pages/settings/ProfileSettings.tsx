import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { updateUser } from '../../../data/mockData'; // Now this works!
import { Save, Loader2, CheckCircle2 } from 'lucide-react';

export default function ProfileSettings() {
  const { user, login } = useAuth(); // We can re-fetch or manually update context if needed
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    role: user?.role || '',
    location: user?.location || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);

    try {
      if (!user?.id) return;
      
      // Update "DB"
      updateUser({
        id: user.id,
        ...formData
      });

      // Force a page reload or context update to show new data
      // In a real app, AuthContext would have an 'updateProfile' method.
      // For this mock, a reload is the simplest way to refresh all components.
      setTimeout(() => {
          setIsLoading(false);
          setSuccess(true);
          window.location.reload(); 
      }, 800);

    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Public Profile</h2>
      
      <div className="mb-8 flex items-center gap-6">
          <img src={formData.avatar} alt="Profile" className="w-20 h-20 rounded-full object-cover border-4 border-gray-100 dark:border-gray-700" />
          <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Picture</label>
              <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={formData.avatar}
                    onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                    placeholder="Image URL"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white w-64 outline-none focus:border-indigo-500"
                  />
              </div>
              <p className="text-xs text-gray-500 mt-2">Paste an image URL from Unsplash or elsewhere.</p>
          </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                <input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Title</label>
                <input 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                <input 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                <input 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                />
            </div>
        </div>

        <div className="pt-4 flex items-center gap-4">
            <button 
                disabled={isLoading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2"
            >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Save Changes
            </button>
            {success && (
                <span className="text-emerald-600 font-medium flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 size={18} /> Saved successfully!
                </span>
            )}
        </div>
      </form>
    </div>
  );
}