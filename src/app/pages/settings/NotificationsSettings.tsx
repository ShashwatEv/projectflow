import { useState, useEffect } from 'react';
import { Mail, Bell, Loader2, Check } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { useAccentTheme } from '../../../lib/useAccentTheme';
import { toast } from 'sonner';

interface NotificationPreferences {
  weekly_newsletter: boolean;
  new_comments: boolean;
  project_invites: boolean;
  mentions: boolean;
  task_reminders: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  weekly_newsletter: true,
  new_comments: true,
  project_invites: false,
  mentions: true,
  task_reminders: false,
};

export default function NotificationsSettings() {
  const theme = useAccentTheme();
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  // 1. Fetch user notification preferences
  useEffect(() => {
    async function loadPreferences() {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;
        if (!user) return;

        const { data, error } = await supabase
          .from('users')
          .select('notification_preferences')
          .eq('id', user.id)
          .single();

        if (!error && data?.notification_preferences) {
          setPreferences({
            ...DEFAULT_PREFERENCES,
            ...data.notification_preferences,
          });
        }
      } catch (err: any) {
        console.error('Failed to load notification settings:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPreferences();
  }, []);

  // 2. Toggle and persist preference state
  const handleToggle = async (key: keyof NotificationPreferences) => {
    const updated = {
      ...preferences,
      [key]: !preferences[key],
    };
    setPreferences(updated);
    setSavingKey(key);

    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) return;

      const { error } = await supabase
        .from('users')
        .update({
          notification_preferences: updated,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Notification preferences updated');
    } catch (err: any) {
      toast.error('Could not save preference change');
      // Rollback on network failure
      setPreferences(preferences);
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-gray-400 space-y-3">
        <Loader2 size={26} className={`animate-spin ${theme.textAccent}`} />
        <p className="text-xs">Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      {/* 1. Email Notifications Card */}
      <div className="bg-[#161b22] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex items-start gap-3 border-b border-gray-800/80 pb-5">
          <div className={`p-2.5 rounded-2xl ${theme.bgSubtle} ${theme.textAccent} border ${theme.borderAccent}/30 mt-0.5`}>
            <Mail size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Email Notifications</h2>
            <p className="text-xs text-gray-400">Choose what we send to your inbox.</p>
          </div>
        </div>

        <div className="divide-y divide-gray-800/70">
          {/* Weekly Newsletter */}
          <div className="py-4 first:pt-0 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">Weekly Newsletter</p>
              <p className="text-xs text-gray-400">Get a summary of your team's performance every Monday.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preferences.weekly_newsletter}
              onClick={() => handleToggle('weekly_newsletter')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                preferences.weekly_newsletter ? theme.toggleActive : 'bg-gray-700/60'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  preferences.weekly_newsletter ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* New Comments */}
          <div className="py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">New Comments</p>
              <p className="text-xs text-gray-400">Receive an email when someone comments on your task.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preferences.new_comments}
              onClick={() => handleToggle('new_comments')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                preferences.new_comments ? theme.toggleActive : 'bg-gray-700/60'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  preferences.new_comments ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Project Invites */}
          <div className="py-4 last:pb-0 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">Project Invites</p>
              <p className="text-xs text-gray-400">Get notified when you are added to a new project.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preferences.project_invites}
              onClick={() => handleToggle('project_invites')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                preferences.project_invites ? theme.toggleActive : 'bg-gray-700/60'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  preferences.project_invites ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Push Notifications Card */}
      <div className="bg-[#161b22] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex items-start gap-3 border-b border-gray-800/80 pb-5">
          <div className={`p-2.5 rounded-2xl ${theme.bgSubtle} ${theme.textAccent} border ${theme.borderAccent}/30 mt-0.5`}>
            <Bell size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Push Notifications</h2>
            <p className="text-xs text-gray-400">Real-time alerts on your desktop/mobile.</p>
          </div>
        </div>

        <div className="divide-y divide-gray-800/70">
          {/* Mentions */}
          <div className="py-4 first:pt-0 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">Mentions</p>
              <p className="text-xs text-gray-400">Notify when @mentioned in a comment or chat.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preferences.mentions}
              onClick={() => handleToggle('mentions')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                preferences.mentions ? theme.toggleActive : 'bg-gray-700/60'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  preferences.mentions ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Task Reminders */}
          <div className="py-4 last:pb-0 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">Task Reminders</p>
              <p className="text-xs text-gray-400">Get a reminder 1 hour before a task is due.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preferences.task_reminders}
              onClick={() => handleToggle('task_reminders')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                preferences.task_reminders ? theme.toggleActive : 'bg-gray-700/60'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  preferences.task_reminders ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}