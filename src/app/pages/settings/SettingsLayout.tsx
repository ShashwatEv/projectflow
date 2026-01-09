import { useState } from 'react';
import { User, Bell, Shield, CreditCard, Palette } from 'lucide-react';

// Import your existing settings components
import ProfileSettings from './ProfileSettings';
import NotificationsSettings from './NotificationsSettings';
import SecuritySettings from './SecuritySettings';
import BillingSettings from './BillingSettings';
import AppearanceSettings from './AppearanceSettings';

export default function SettingsLayout() {
  const [activeTab, setActiveTab] = useState('profile');

  // Define the tabs and link them to IDs
  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
  ];

  return (
    <div className="p-8 h-full overflow-y-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Settings Sidebar */}
            <div className="w-full md:w-64 shrink-0 space-y-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                            activeTab === tab.id 
                            ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area - Switches based on activeTab */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm w-full">
                {activeTab === 'profile' && <ProfileSettings />}
                {activeTab === 'notifications' && <NotificationsSettings />}
                {activeTab === 'security' && <SecuritySettings />}
                {activeTab === 'billing' && <BillingSettings />}
                {activeTab === 'appearance' && <AppearanceSettings />}
            </div>
        </div>
    </div>
  );
}