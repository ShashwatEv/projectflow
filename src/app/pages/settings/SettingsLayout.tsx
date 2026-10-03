import { useState } from 'react';
import { User, Bell, Shield, CreditCard, Palette, BadgeCheck } from 'lucide-react';
import { useAccentTheme } from '../../../lib/useAccentTheme';

// Import settings components
import ProfileSettings from './ProfileSettings';
import VerificationSettings from './VerificationSettings';
import NotificationsSettings from './NotificationsSettings';
import SecuritySettings from './SecuritySettings';
import BillingSettings from './BillingSettings';
import AppearanceSettings from './AppearanceSettings';

export default function SettingsLayout() {
  const [activeTab, setActiveTab] = useState('profile');
  const theme = useAccentTheme();

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'verification', label: 'Verification', icon: <BadgeCheck size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
  ];

  return (
    <div className="p-8 h-full overflow-y-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">Settings</h1>
      
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                  isActive
                    ? `${theme.bgSubtle} ${theme.textAccent} border${theme.borderAccent}/30 shadow-sm`
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <span className={isActive ? theme.textAccent : 'text-gray-400 dark:text-gray-500'}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-[#161b22] rounded-3xl border border-gray-200 dark:border-gray-800/80 p-8 shadow-sm w-full">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'verification' && <VerificationSettings />}
          {activeTab === 'notifications' && <NotificationsSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'billing' && <BillingSettings />}
          {activeTab === 'appearance' && <AppearanceSettings />}
        </div>
      </div>
    </div>
  );
}