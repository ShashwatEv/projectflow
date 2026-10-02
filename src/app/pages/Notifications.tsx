import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Clock, AlertCircle, CheckCircle2, Info, 
  Trash2, CheckCheck, Sparkles, Code2, FolderKanban, MessageSquare 
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'code' | 'task';
  is_read: boolean;
  link?: string;
  created_at: string;
}

const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'seed-1',
    title: 'Code Studio Push Completed',
    message: 'Your commit to main branch in ProjectFlow repo was pushed and verified.',
    type: 'code',
    is_read: false,
    link: '/code',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'seed-2',
    title: 'Task Due Soon: Frontend Polish',
    message: 'Finish the appearance settings sync and color tokens before the upcoming milestone.',
    type: 'warning',
    is_read: false,
    link: '/tasks',
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'seed-3',
    title: 'New Team Message',
    message: 'A team member shared an update in #general chat room.',
    type: 'info',
    is_read: true,
    link: '/messages/room_1',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // 1. Fetch & Initialize Notifications
  const fetchNotifications = async () => {
    try {
      if (!user?.id) {
        setNotifications(SEED_NOTIFICATIONS);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        // Fallback to starter notifications if table has no entries for user
        setNotifications(SEED_NOTIFICATIONS);
      } else {
        setNotifications(data);
      }
    } catch {
      setNotifications(SEED_NOTIFICATIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // 2. Real-time Subscription to Live Alerts
    const channel = supabase
      .channel('realtime_user_notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newItem = payload.new as NotificationItem;
            setNotifications((prev) => [newItem, ...prev]);
            toast.info(`🔔 New Notification: ${newItem.title}`);
          } else if (payload.eventType === 'UPDATE') {
            const updatedItem = payload.new as NotificationItem;
            setNotifications((prev) =>
              prev.map((n) => (n.id === updatedItem.id ? updatedItem : n))
            );
          } else if (payload.eventType === 'DELETE') {
            setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Actions
  const markAsRead = async (id: string, link?: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );

    if (user?.id && !id.startsWith('seed-')) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    }

    if (link) {
      navigate(link);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    if (user?.id) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id);
    }

    toast.success('All notifications marked as read');
  };

  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    if (user?.id && !id.startsWith('seed-')) {
      await supabase.from('notifications').delete().eq('id', id);
    }

    toast.success('Notification removed');
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'code':
        return <Code2 className="text-indigo-400" size={18} />;
      case 'success':
        return <CheckCircle2 className="text-emerald-400" size={18} />;
      case 'warning':
        return <AlertCircle className="text-amber-400" size={18} />;
      case 'task':
        return <FolderKanban className="text-blue-400" size={18} />;
      default:
        return <Info className="text-purple-400" size={18} />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const filteredNotifications = notifications.filter((n) =>
    filter === 'unread' ? !n.is_read : true
  );

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <Bell className="text-orange-500" size={24} />
            Notifications
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Stay updated with your live workspace activity and team events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-all active:scale-95"
            >
              <CheckCheck size={14} className="text-emerald-500" />
              <span>Mark all as read</span>
            </button>
          )}

          <div className="flex items-center gap-1 bg-[#161b22] border border-gray-800 p-1 rounded-xl">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filter === 'unread'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            Loading updates...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-16 bg-[#161b22] rounded-3xl border border-dashed border-gray-800">
            <div className="w-12 h-12 rounded-2xl bg-gray-800/80 text-gray-400 flex items-center justify-center mx-auto mb-3">
              <Bell size={22} />
            </div>
            <h3 className="text-sm font-bold text-gray-200">All caught up!</h3>
            <p className="text-xs text-gray-500 mt-1">
              {filter === 'unread'
                ? 'No unread notifications left.'
                : 'No active notifications in this workspace.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => markAsRead(item.id, item.link)}
              className={`group relative p-4 rounded-2xl border transition-all cursor-pointer ${
                item.is_read
                  ? 'bg-[#161b22]/60 border-gray-800/60 opacity-75 hover:opacity-100 hover:bg-[#161b22]'
                  : 'bg-[#161b22] border-orange-500/40 shadow-sm hover:border-orange-500/70'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Icon */}
                <div
                  className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    item.is_read ? 'bg-gray-800/80' : 'bg-[#0d1117] border border-gray-800'
                  }`}
                >
                  {getIcon(item.type)}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 pr-8">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-xs font-bold leading-snug truncate ${
                        item.is_read ? 'text-gray-300' : 'text-white'
                      }`}
                    >
                      {item.title}
                    </h4>
                    {!item.is_read && (
                      <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 animate-pulse" />
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    {item.message}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(item.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {item.link && (
                      <span className="text-orange-400 hover:underline font-semibold">
                        View item →
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(item.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 hover:text-red-400 text-gray-500 rounded-lg transition-all"
                  title="Dismiss notification"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}