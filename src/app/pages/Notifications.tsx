import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Check, Code2, AlertCircle, MessageSquare, 
  FolderKanban, Clock, ArrowRight, Loader2 
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { toast } from 'sonner';

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

  // 1. Fetch real notifications and auto-synthesize live project/deadline triggers
  const fetchLiveNotifications = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData?.user?.id;

      // 1. Fetch stored notifications
      const { data: storedData, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error && error.code !== '42P01') {
        console.error('Error fetching notifications:', error);
      }

      const realList: NotificationItem[] = storedData || [];

      // 2. Synthesize automated progress & deadline notifications from active projects
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
          is_read: false,
          created_at: proj.created_at,
        };
      });

      // Merge and sort newest first
      const combined = [...realList, ...projectAutomations].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setNotifications(combined);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveNotifications();

    // Realtime channel listener for dynamic updates
    const channel = supabase
      .channel('notifications-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          setNotifications((prev) => [payload.new as NotificationItem, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData?.user?.id;

      if (currentUserId) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', currentUserId);
      }

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success('Marked all notifications as read');
    } catch (err: any) {
      toast.error('Failed to update notifications');
    }
  };

  // Mark single item read & navigate
  const handleItemClick = async (item: NotificationItem) => {
    if (!item.is_read && !item.id.startsWith('automation-')) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', item.id);
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
    );

    if (item.link) {
      navigate(item.link);
    }
  };

  // Format relative timestamp
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  const getIconForType = (type: NotificationItem['type']) => {
    switch (type) {
      case 'code':
        return <Code2 size={18} className={theme.textAccent} />;
      case 'deadline':
      case 'task':
        return <AlertCircle size={18} className="text-amber-400" />;
      case 'project':
        return <FolderKanban size={18} className={theme.textAccent} />;
      case 'message':
      default:
        return <MessageSquare size={18} className="text-blue-400" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6 text-gray-200 animate-in fade-in duration-200">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${theme.bgSubtle} ${theme.textAccent} border ${theme.borderAccent}/30 shadow-sm`}>
              <Bell size={22} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Stay updated with your live workspace activity and team events.
          </p>
        </div>

        {/* Filter Pills & Mark All Action */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#161b22] hover:bg-gray-800 text-gray-300 border border-gray-800 text-xs font-semibold transition-all disabled:opacity-40"
          >
            <Check size={14} className="text-emerald-400" />
            <span>Mark all as read</span>
          </button>

          <div className="flex items-center bg-[#161b22] p-1 rounded-xl border border-gray-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filter === 'all'
                  ? `${theme.btnPrimary} shadow-sm`
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filter === 'unread'
                  ? `${theme.btnPrimary} shadow-sm`
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-gray-400 space-y-3">
          <Loader2 size={28} className={`animate-spin ${theme.textAccent}`} />
          <p className="text-xs">Checking workspace events...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="py-20 text-center bg-[#161b22] border border-gray-800 rounded-2xl p-8 space-y-3">
          <Bell size={36} className="mx-auto text-gray-600" />
          <h3 className="text-base font-bold text-white">No notifications</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {filter === 'unread'
              ? 'You have caught up with all unread updates.'
              : 'Workspace activities, commits, and milestone events will show up here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`p-4 md:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                !item.is_read
                  ? 'bg-[#161b22] border-gray-800 hover:border-gray-700 shadow-md'
                  : 'bg-[#161b22]/40 border-gray-800/40 opacity-70 hover:opacity-100'
              }`}
            >
              {/* Type Avatar Badge */}
              <div className="p-2.5 rounded-xl bg-[#0d1117] border border-gray-800 shrink-0">
                {getIconForType(item.type)}
              </div>

              {/* Body */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {item.title}
                  </h4>
                  {!item.is_read && (
                    <span className={`w-2 h-2 rounded-full ${theme.toggleActive} shrink-0 animate-pulse`} />
                  )}
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  {item.message}
                </p>

                {/* Metadata & Deep Link */}
                <div className="flex items-center gap-4 pt-2 text-[11px] text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{formatTime(item.created_at)}</span>
                  </div>

                  {item.link && (
                    <button
                      type="button"
                      className={`font-semibold ${theme.textAccent} ${theme.textHover} flex items-center gap-1 transition-colors`}
                    >
                      <span>View item</span>
                      <ArrowRight size={11} />
                    </button>
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