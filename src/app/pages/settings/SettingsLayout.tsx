import { useState, useRef, useEffect } from 'react';
import { 
  User, ShieldCheck, History, Bell, Palette, 
  CreditCard, Lock, Download, ChevronDown, Check
} from 'lucide-react';
import { useAccentTheme } from '../../../lib/useAccentTheme';

// Settings sub-components
import ProfileSettings from './ProfileSettings';
import VerificationSettings from './VerificationSettings';
import AuditLogSettings from './AuditLogSettings';
import NotificationsSettings from './NotificationsSettings';
import AppearanceSettings from './AppearanceSettings';
import BillingSettings from './BillingSettings';
import SecuritySettings from './SecuritySettings';
import DataPortabilitySettings from './DataPortabilitySettings';

type SettingsTab = 
  | 'profile'
  | 'verification'
  | 'audit'
  | 'notifications'
  | 'appearance'
  | 'billing'
  | 'security'
  | 'data';

export default function SettingsLayout() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const theme = useAccentTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={16} /> },
    { id: 'verification', label: 'Verification', icon: <ShieldCheck size={16} /> },
    { id: 'audit', label: 'Audit Trail', icon: <History size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={16} /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard size={16} /> },
    { id: 'security', label: 'Security', icon: <Lock size={16} /> },
    { id: 'data', label: 'Data Portability', icon: <Download size={16} /> },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsMobileDropdownOpen(false);
      }
    };
    if (isMobileDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isMobileDropdownOpen]);

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'verification':
        return <VerificationSettings />;
      case 'audit':
        return <AuditLogSettings />;
      case 'notifications':
        return <NotificationsSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'billing':
        return <BillingSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'data':
        return <DataPortabilitySettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your personal identity, security credentials, and workspace preferences.
        </p>
      </div>

      {/* Mobile view dropdown selector */}
      <div className="block md:hidden relative w-full" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
          className="w-full flex items-center justify-between p-3.5 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xs text-xs font-bold text-gray-900 dark:text-white"
        >
          <div className="flex items-center gap-2.5">
            <span className={theme.textAccent}>{currentTab?.icon}</span>
            <span>{currentTab?.label}</span>
          </div>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-200 ${
              isMobileDropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isMobileDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
            {tabs.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id as SettingsTab);
                    setIsMobileDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isSelected
                      ? `${theme.bgSubtle}${theme.textAccent} font-bold`
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isSelected ? theme.textAccent : 'text-gray-400'}>
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </div>
                  {isSelected && <Check size={14} className={theme.textAccent} />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Desktop left sidebar */}
        <div className="hidden md:block w-60 shrink-0">
          <div className="flex flex-col gap-1.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? `${theme.bgSubtle} ${theme.textAccent} font-bold shadow-xs border${theme.borderAccent}/30`
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                  }`}
                >
                  <span className={isActive ? theme.textAccent : 'text-gray-400'}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Setting active content */}
        <div className="flex-1 w-full min-w-0">
          {renderActiveTabContent()}
        </div>
      </div>
    </div>
  );
}