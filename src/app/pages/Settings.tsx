import { useNavigate } from 'react-router-dom';
import { User, Bell, Lock, CreditCard, Save, LogOut } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Clear the "fake" authentication token
    localStorage.removeItem('isAuthenticated');
    
    // 2. Redirect the user back to the Login page
    navigate('/');
  };

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Account Settings</h1>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        <TabButton icon={<User size={18} />} label="Profile" active />
        <TabButton icon={<Bell size={18} />} label="Notifications" />
        <TabButton icon={<Lock size={18} />} label="Security" />
        <TabButton icon={<CreditCard size={18} />} label="Billing" />
      </div>

      <div className="space-y-6">
        {/* Profile Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-start gap-8">
            {/* Avatar Change */}
            <div className="flex flex-col items-center gap-3">
              <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-md">
                AM
              </div>
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                Change Photo
              </button>
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <InputField label="First Name" defaultValue="Alex" />
                <InputField label="Last Name" defaultValue="Morgan" />
              </div>
              <InputField label="Email Address" defaultValue="alex.morgan@company.com" />
              <InputField label="Job Title" defaultValue="Product Lead" />
              
              <div className="pt-4 flex justify-end gap-3">
                <button className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* NEW: Session / Logout Section */}
        <div className="bg-white rounded-xl border border-red-100 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Session Management</h3>
          <p className="text-sm text-gray-500 mb-4">
            Log out of your account on this device. You will need to sign in again to access your dashboard.
          </p>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 border border-red-200 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

// Helpers
function TabButton({ icon, label, active }: any) {
  return (
    <button className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${active ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
      {icon}
      {label}
    </button>
  );
}

function InputField({ label, defaultValue }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type="text" defaultValue={defaultValue} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm transition-all" />
    </div>
  );
}