import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import { Loader2, Save } from 'lucide-react';

// Define the shape of our settings
interface NotificationPreferences {
  email_newsletter: boolean;
  email_comments: boolean;
  email_invites: boolean;
  push_mentions: boolean;
  push_reminders: boolean;
  [key: string]: boolean; // Allow dynamic keys for flexibility
}

const DEFAULT_SETTINGS: NotificationPreferences = {
  email_newsletter: true,
  email_comments: true,
  email_invites: false,
  push_mentions: true,
  push_reminders: false,
};

export default function NotificationsSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationPreferences>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Fetch Settings on Load
  useEffect(() => {
    async function fetchSettings() {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('users')
          .select('notification_settings')
          .eq('id', user.id)
          .single();

        if (data?.notification_settings) {
          setSettings(data.notification_settings);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [user]);

  // 2. Handle Toggle & Auto-Save
  const handleToggle = async (key: string) => {
    if (!user?.id) return;

    // Optimistic Update (Change UI immediately)
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    setSaving(true);

    try {
      // Save to Supabase
      const { error } = await supabase
        .from('users')
        .update({ notification_settings: newSettings })
        .eq('id', user.id);

      if (error) throw error;
      
      // Simulate a small delay just to show the "Saving..." state briefly
      setTimeout(() => setSaving(false), 500);

    } catch (err) {
      console.error('Error saving settings:', err);
      // Revert if failed
      setSettings(settings); 
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      
      {/* Saving Indicator */}
      <div className="h-6 flex items-center justify-end">
        {saving && (
          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1 animate-pulse">
            <Save size={12} /> Saving changes...
          </span>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Email Notifications</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Choose what we send to your inbox.</p>
        
        <div className="space-y-4">
          <ToggleItem 
            title="Weekly Newsletter" 
            desc="Get a summary of your team's performance every Monday." 
            checked={settings.email_newsletter}
            onChange={() => handleToggle('email_newsletter')}
          />
          <ToggleItem 
            title="New Comments" 
            desc="Receive an email when someone comments on your task." 
            checked={settings.email_comments}
            onChange={() => handleToggle('email_comments')}
          />
          <ToggleItem 
            title="Project Invites" 
            desc="Get notified when you are added to a new project." 
            checked={settings.email_invites}
            onChange={() => handleToggle('email_invites')}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Push Notifications</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Real-time alerts on your desktop/mobile.</p>
        
        <div className="space-y-4">
           <ToggleItem 
            title="Mentions" 
            desc="Notify when @mentioned in a comment." 
            checked={settings.push_mentions}
            onChange={() => handleToggle('push_mentions')}
          />
           <ToggleItem 
            title="Task Reminders" 
            desc="Get a reminder 1 hour before a task is due." 
            checked={settings.push_reminders}
            onChange={() => handleToggle('push_reminders')}
          />
        </div>
      </div>
    </div>
  );
}

// Updated ToggleItem to be "Controlled" (Managed by parent)
function ToggleItem({ title, desc, checked, onChange }: { title: string, desc: string, checked: boolean, onChange: () => void }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
      </div>
      <button 
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${checked ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}