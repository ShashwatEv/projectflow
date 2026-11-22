import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Clock,
  Code2,
  FolderKanban,
  Inbox,
  ListTodo,
  MessageSquare,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAccentTheme } from '../../lib/useAccentTheme';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'code' | 'task' | 'project' | 'message' | 'deadline';
  link?: string;
  is_read: boolean;
  created_at: string;
}

export default function Notifications() {
  const navigate = useNavigate();
  const theme = useAccentTheme();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  const fetchLiveNotifications = useCallback(async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData.user?.id;

      const { data: storedData, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error && error.code !== '42P01') {
        console.error('Error fetching notifications:', error);
      }

      const realList: NotificationItem[] = (storedData || []).map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: (['code', 'task', 'project', 'message', 'deadline'].includes(n.type || '')
          ? n.type
          : 'task') as NotificationItem['type'],
        link: n.link ?? undefined,
        is_read: Boolean(n.is_read),
        created_at: n.created_at,
      }));

      const { data: activeProjects } = await supabase
        .from('projects')
        .select('id, name, progress, created_at, status')
        .eq('status', 'active');

      const projectAutomations: NotificationItem[] = (activeProjects || []).map((proj) => {
        const progress = proj.progress || 0;
        let message = `Project ${proj.name} is currently running at ${progress}% milestone velocity.`;
        let title = `Project Progress: ${proj.name}`;

        if (progress >= 100) {
          title = `Milestone Complete: ${proj.name}`;
          message = `All active deliverables in ${proj.name} have reached 100% completion.`;
        } else if (progress > 50) {
          title = `Velocity Update: ${proj.name}`;
          message = `${proj.name} has surpassed 50% milestone progress.`;
        }

        return {
          id: `automation-proj-${proj.id}`,
          title,
          message,
          type: 'project',
          link: `/projects/${proj.id}`,
          is_read: true,
          created_at: proj.created_at || new Date().toISOString(),
        };
      });

      let dueTaskReminders: NotificationItem[] = [];
      if (currentUserId) {
        const { data: preference } = await supabase
          .from('user_notification_preferences')
          .select('task_reminders')
          .eq('user_id', currentUserId)
          .maybeSingle();

        if (preference?.task_reminders) {
          const tomorrow = new Date();
          tomorrow.setHours(24, 0, 0, 0);
          const { data: dueTasks, error: dueTasksError } = await supabase
            .from('tasks')
            .select('id, title, due_date')
            .eq('assigned_to', currentUserId)
            .neq('status', 'done')
            .lt('due_date', tomorrow.toISOString())
            .order('due_date', { ascending: true })
            .limit(20);

          if (dueTasksError) {
            console.error('Could not load due task reminders:', dueTasksError);
          } else {
            dueTaskReminders = (dueTasks || [])
              .filter((task): task is { id: string; title: string; due_date: string } =>
                Boolean(task.due_date)
              )
              .map((task) => ({
                id: `automation-deadline-${task.id}`,
                title:
                  new Date(task.due_date).getTime() < Date.now()
                    ? 'Task overdue'
                    : 'Task due today',
                message: task.title,
                type: 'deadline',
                link: '/tasks',
                is_read: true,
                created_at: task.due_date,
              }));
          }
        }
      }

      const combined = [...realList, ...projectAutomations, ...dueTaskReminders].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setNotifications(combined);
    } catch (err) {
      console.error('Error building notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchLiveNotifications();

    const channel = supabase
      .channel('notifications_page_live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => void fetchLiveNotifications()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => void fetchLiveNotifications()
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchLiveNotifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const visibleNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications;

  const markAllAsRead = async () => {
    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = authData.user?.id;

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    if (currentUserId) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', currentUserId)
        .eq('is_read', false);
    }
  };

  const handleOpenNotification = async (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
    );

    if (!item.id.startsWith('automation-')) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', item.id);
    }

    if (item.link) {
      navigate(item.link);
    }
  };

  const getTypeIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'code':
        return <Code2 size={18} />;
      case 'project':
        return <FolderKanban size={18} />;
      case 'message':
        return <MessageSquare size={18} />;
      case 'deadline':
        return <Clock size={18} />;
      default:
        return <ListTodo size={18} />;
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${theme.bgSubtle} ${theme.textAccent} ${theme.borderAccent}/30`}
          >
            <Bell size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Notifications
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Stay updated with your live workspace activity and team events.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/mobile/inbox')}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <Inbox size={14} />
            <span>Unified inbox</span>
          </button>

          <button
            type="button"
            onClick={() => void markAllAsRead()}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-xs transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <CheckCheck size={14} />
            <span>Mark all as read</span>
          </button>

          <div className="inline-flex items-center rounded-xl border border-gray-200 bg-gray-100 p-1 text-xs font-semibold dark:border-gray-700 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`rounded-lg px-3 py-1.5 transition ${filter === 'all'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`rounded-lg px-3 py-1.5 transition ${filter === 'unread'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-12 dark:border-gray-800 dark:bg-gray-900">
          <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={28} />
        </div>
      ) : visibleNotifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {filter === 'unread' ? 'No unread notifications.' : 'No notifications yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => void handleOpenNotification(item)}
              className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition sm:p-5 ${item.is_read
                  ? 'border-gray-200 bg-gray-50/90 text-gray-700 hover:bg-gray-100/80 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-300 dark:hover:bg-gray-900'
                  : 'border-gray-200 bg-white text-gray-900 shadow-xs hover:border-gray-300 hover:bg-gray-50/60 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:border-gray-600'
                }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${theme.bgSubtle} ${theme.textAccent} ${theme.borderAccent}/25`}
              >
                {getTypeIcon(item.type)}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-sm font-bold text-gray-900 dark:text-white">
                    {item.title}
                  </h2>
                  {!item.is_read && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.message}
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(item.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {item.link && (
                    <span className="inline-flex items-center gap-1 font-semibold text-orange-600 dark:text-orange-400">
                      View item <ArrowRight size={12} />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}