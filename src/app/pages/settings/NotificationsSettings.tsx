import { useState, useEffect } from 'react';
import { Mail, Bell, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'sonner';

interface NotificationPrefs {
  weekly_newsletter: boolean;
  new_comments: boolean;
  project_invites: boolean;
  mentions: boolean;
  task_reminders: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  weekly_newsletter: true,
  new_comments: true,
  project_invites: false,
  mentions: true,
  task_reminders: false,
};

export default function NotificationsSettings() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPrefs>(() => {
    const saved = localStorage.getItem('pf_notification_prefs');
    return saved ? JSON.parse(saved) : DEFAULT_PREFS;
  });
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  // 1. Fetch real preferences from Supabase profile on load
  useEffect(() => {
    async function loadPreferences() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('notification_preferences')
          .eq('id', user.id)
          .single();

        if (!error && data?.notification_preferences) {
          const loaded = { ...DEFAULT_PREFS, ...data.notification_preferences };
          setPrefs(loaded);
          localStorage.setItem('pf_notification_prefs', JSON.stringify(loaded));
        }
      } catch (err) {
        console.warn('Could not load user notification prefs from DB, using local state:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPreferences();
  }, [user]);

  // 2. Toggle Handler with Realtime Push Permission & DB persistence
  const handleToggle = async (key: keyof NotificationPrefs) => {
    const nextValue = !prefs[key];

    // If enabling a push notification, request native browser permission
    if (nextValue && (key === 'mentions' || key === 'task_reminders')) {
      if ('Notification' in window && Notification.permission !== 'granted') {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') {
          toast.warning('Browser notifications blocked. Please enable them in browser settings.');
        }
      }
    }

    const updated = { ...prefs, [key]: nextValue };
    setPrefs(updated);
    localStorage.setItem('pf_notification_prefs', JSON.stringify(updated));
    setUpdatingKey(key);

    try {
      if (user?.id) {
        const { error } = await supabase
          .from('users')
          .update({ notification_preferences: updated })
          .eq('id', user.id);

        if (error) {
          // If the column doesn't exist yet, we still retain local storage smoothly
          console.warn('Could not persist to Supabase users table:', error.message);
        }
      }
      toast.success(nextValue ? 'Preference enabled' : 'Preference disabled');
    } catch {
      toast.error('Failed to sync setting');
    } finally {
      setUpdatingKey(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      {/* 1. Email Notifications Card */}
      <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2 text-white">
            <Mail size={18} className="text-orange-500" />
            <h3 className="font-bold text-base">Email Notifications</h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Choose what we send to your inbox.
          </p>
        </div>

        <div className="space-y-4 divide-y divide-gray-800/80">
          {/* Weekly Newsletter */}
          <div className="flex items-center justify-between pt-4 first:pt-0">
            <div>
              <p className="text-xs font-semibold text-white">Weekly Newsletter</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Get a summary of your team's performance every Monday.
              </p>
            </div>
            <ToggleSwitch
              checked={prefs.weekly_newsletter}
              onChange={() => handleToggle('weekly_newsletter')}
              loading={updatingKey === 'weekly_newsletter'}
            />
          </div>

          {/* New Comments */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <p className="text-xs font-semibold text-white">New Comments</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Receive an email when someone comments on your task.
              </p>
            </div>
            <ToggleSwitch
              checked={prefs.new_comments}
              onChange={() => handleToggle('new_comments')}
              loading={updatingKey === 'new_comments'}
            />
          </div>

          {/* Project Invites */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <p className="text-xs font-semibold text-white">Project Invites</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Get notified when you are added to a new project.
              </p>
            </div>
            <ToggleSwitch
              checked={prefs.project_invites}
              onChange={() => handleToggle('project_invites')}
              loading={updatingKey === 'project_invites'}
            />
          </div>
        </div>
      </div>

      {/* 2. Push Notifications Card */}
      <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2 text-white">
            <Bell size={18} className="text-orange-500" />
            <h3 className="font-bold text-base">Push Notifications</h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Real-time alerts on your desktop/mobile.
          </p>
        </div>

        <div className="space-y-4 divide-y divide-gray-800/80">
          {/* Mentions */}
          <div className="flex items-center justify-between pt-4 first:pt-0">
            <div>
              <p className="text-xs font-semibold text-white">Mentions</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Notify when @mentioned in a comment.
              </p>
            </div>
            <ToggleSwitch
              checked={prefs.mentions}
              onChange={() => handleToggle('mentions')}
              loading={updatingKey === 'mentions'}
            />
          </div>

          {/* Task Reminders */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <p className="text-xs font-semibold text-white">Task Reminders</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Get a reminder 1 hour before a task is due.
              </p>
            </div>
            <ToggleSwitch
              checked={prefs.task_reminders}
              onChange={() => handleToggle('task_reminders')}
              loading={updatingKey === 'task_reminders'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact reusable toggle button
function ToggleSwitch({
  checked,
  onChange,
  loading,
}: {
  checked: boolean;
  onChange: () => void;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={loading}
      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 shrink-0 ${
        checked ? 'bg-orange-600' : 'bg-gray-700'
      } ${loading ? 'opacity-60 cursor-wait' : 'cursor-pointer active:scale-95'}`}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}