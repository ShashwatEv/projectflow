import { useState, useEffect } from 'react';
import { Mail, Bell, Clock, Loader2, Check } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { useAccentTheme } from '../../../lib/useAccentTheme';
import { toast } from 'sonner';

interface NotificationPreferences {
  weekly_newsletter: boolean;
  new_comments: boolean;
  project_invites: boolean;
  mentions: boolean;
  task_reminders: boolean;
  digest_frequency: 'off' | 'daily' | 'weekly';
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  weekly_newsletter: true,
  new_comments: true,
  project_invites: false,
  mentions: true,
  task_reminders: false,
  digest_frequency: 'off',
};

const DIGEST_OPTIONS: {
  value: NotificationPreferences['digest_frequency'];
  label: string;
  hint: string;
}[] = [
  { value: 'off', label: 'Off', hint: 'No scheduled summary' },
  { value: 'daily', label: 'Daily', hint: 'Morning recap' },
  { value: 'weekly', label: 'Weekly', hint: 'Monday overview' },
];

export default function NotificationsSettings() {
  const theme = useAccentTheme();
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    const isValidDigest = (
      val: unknown
    ): val is NotificationPreferences['digest_frequency'] =>
      val === 'off' || val === 'daily' || val === 'weekly';

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

        if (
          !error &&
          data?.notification_preferences &&
          typeof data.notification_preferences === 'object' &&
          !Array.isArray(data.notification_preferences)
        ) {
          const savedPrefs =
            data.notification_preferences as Partial<NotificationPreferences>;
          setPreferences({
            ...DEFAULT_PREFERENCES,
            ...savedPrefs,
            digest_frequency: isValidDigest(savedPrefs.digest_frequency)
              ? savedPrefs.digest_frequency
              : DEFAULT_PREFERENCES.digest_frequency,
          });
        }

        const { data: workspacePreferences, error: workspaceError } = await supabase
          .from('user_notification_preferences')
          .select('new_comments, project_invites, mentions, task_reminders, digest_frequency')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!workspaceError && workspacePreferences) {
          setPreferences((current) => ({
            ...current,
            ...workspacePreferences,
            digest_frequency: isValidDigest(workspacePreferences.digest_frequency)
              ? workspacePreferences.digest_frequency
              : current.digest_frequency,
          }));
        }
      } catch (err) {
        console.error('Failed to load notification settings:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPreferences();
  }, []);

  const handleToggle = async (
    key: Exclude<keyof NotificationPreferences, 'digest_frequency'>
  ) => {
    const previous = preferences;
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
        })
        .eq('id', user.id);

      if (error) throw error;

      const { error: workspaceError } = await supabase
        .from('user_notification_preferences')
        .upsert(
          {
            user_id: user.id,
            new_comments: updated.new_comments,
            project_invites: updated.project_invites,
            mentions: updated.mentions,
            task_reminders: updated.task_reminders,
            digest_frequency: updated.digest_frequency,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
      if (workspaceError) {
        console.warn(
          'Workspace notification preferences are unavailable; apply the collaboration migration to sync them.'
        );
      }
      toast.success('Notification preferences updated');
    } catch {
      toast.error('Could not save preference change');
      setPreferences(previous);
    } finally {
      setSavingKey(null);
    }
  };

  const handleDigestChange = async (
    digestFrequency: NotificationPreferences['digest_frequency']
  ) => {
    const previous = preferences;
    const updated = { ...preferences, digest_frequency: digestFrequency };
    setPreferences(updated);
    setSavingKey('digest_frequency');
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) {
        throw new Error('You must be signed in to update notification preferences.');
      }

      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert(
          {
            user_id: user.id,
            new_comments: updated.new_comments,
            project_invites: updated.project_invites,
            mentions: updated.mentions,
            task_reminders: updated.task_reminders,
            digest_frequency: digestFrequency,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
      if (error) throw error;
      toast.success('Digest preference updated');
    } catch (err) {
      setPreferences(previous);
      toast.error(
        'Apply the collaboration database migration before enabling digest preferences.'
      );
      console.error('Could not save digest preference:', err);
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 py-20 text-gray-500 dark:text-gray-400">
        <Loader2 size={26} className={`animate-spin ${theme.textAccent}`} />
        <p className="text-xs font-medium">Loading notification preferences...</p>
      </div>
    );
  }

  const emailItems: {
    key: 'weekly_newsletter' | 'new_comments' | 'project_invites';
    title: string;
    description: string;
  }[] = [
    {
      key: 'weekly_newsletter',
      title: 'Weekly Newsletter',
      description: "Get a summary of your team's performance every Monday.",
    },
    {
      key: 'new_comments',
      title: 'New Comments',
      description: 'Receive an email when someone comments on your task.',
    },
    {
      key: 'project_invites',
      title: 'Project Invites',
      description: 'Get notified when you are added to a new project.',
    },
  ];

  const pushItems: {
    key: 'mentions' | 'task_reminders';
    title: string;
    description: string;
  }[] = [
    {
      key: 'mentions',
      title: 'Mentions',
      description: 'Notify when @mentioned in a comment or chat.',
    },
    {
      key: 'task_reminders',
      title: 'Task Reminders',
      description: 'Show overdue and due-today tasks in your in-app notifications.',
    },
  ];

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-200">
      {/* 1. Email Notifications Card */}
      <section className="space-y-6 rounded-3xl border border-gray-200/90 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#161b22] dark:shadow-xl md:p-8">
        <div className="flex items-start gap-3.5 border-b border-gray-100 pb-5 dark:border-gray-800/80">
          <div
            className={`mt-0.5 rounded-2xl border p-2.5 ${theme.bgSubtle} ${theme.textAccent} ${theme.borderAccent}/30`}
          >
            <Mail size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
              Email Notifications
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Choose what we send to your inbox.
            </p>
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800/70">
          {emailItems.map((item, idx) => {
            const enabled = preferences[item.key];
            const isSaving = savingKey === item.key;
            return (
              <div
                key={item.key}
                className={`flex items-center justify-between gap-4 py-4 ${
                  idx === 0 ? 'pt-0' : ''
                } ${idx === emailItems.length - 1 ? 'pb-0' : ''}`}
              >
                <div className="space-y-0.5 pr-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  aria-label={item.title}
                  disabled={isSaving}
                  onClick={() => handleToggle(item.key)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#161b22] disabled:opacity-60 ${
                    enabled
                      ? theme.toggleActive
                      : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700/70 dark:hover:bg-gray-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Push Notifications Card */}
      <section className="space-y-6 rounded-3xl border border-gray-200/90 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#161b22] dark:shadow-xl md:p-8">
        <div className="flex items-start gap-3.5 border-b border-gray-100 pb-5 dark:border-gray-800/80">
          <div
            className={`mt-0.5 rounded-2xl border p-2.5 ${theme.bgSubtle} ${theme.textAccent} ${theme.borderAccent}/30`}
          >
            <Bell size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
              Push Notifications
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Real-time alerts on your desktop and mobile devices.
            </p>
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800/70">
          {pushItems.map((item, idx) => {
            const enabled = preferences[item.key];
            const isSaving = savingKey === item.key;
            return (
              <div
                key={item.key}
                className={`flex items-center justify-between gap-4 py-4 ${
                  idx === 0 ? 'pt-0' : ''
                } ${idx === pushItems.length - 1 ? 'pb-0' : ''}`}
              >
                <div className="space-y-0.5 pr-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  aria-label={item.title}
                  disabled={isSaving}
                  onClick={() => handleToggle(item.key)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#161b22] disabled:opacity-60 ${
                    enabled
                      ? theme.toggleActive
                      : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700/70 dark:hover:bg-gray-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Activity Digest Card */}
      <section className="space-y-5 rounded-3xl border border-gray-200/90 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#161b22] dark:shadow-xl md:p-8">
        <div className="flex items-start gap-3.5 border-b border-gray-100 pb-5 dark:border-gray-800/80">
          <div
            className={`mt-0.5 rounded-2xl border p-2.5 ${theme.bgSubtle} ${theme.textAccent} ${theme.borderAccent}/30`}
          >
            <Clock size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
              Activity Digest
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Choose a digest cadence. Email delivery requires a configured scheduler and mail provider.
            </p>
          </div>
        </div>

        <div
          role="radiogroup"
          aria-label="Digest frequency"
          className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {DIGEST_OPTIONS.map((option) => {
            const isSelected = preferences.digest_frequency === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={savingKey === 'digest_frequency'}
                onClick={() => handleDigestChange(option.value)}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all disabled:opacity-60 ${
                  isSelected
                    ? `${theme.bgSubtle} ${theme.textAccent} ${theme.borderAccent}/50 shadow-xs`
                    : 'border-gray-200 bg-gray-50/70 text-gray-700 hover:border-gray-300 hover:bg-gray-100/70 dark:border-gray-800 dark:bg-[#0d1117] dark:text-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {option.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                    {option.hint}
                  </p>
                </div>
                {isSelected && <Check size={15} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}