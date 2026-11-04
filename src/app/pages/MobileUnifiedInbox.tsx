import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Clock3,
  MessageCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { toast } from 'sonner';

interface InboxItem {
  id: string;
  kind: 'notification' | 'message';
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  route: string;
  category?: string;
  roomId?: string;
  unreadCount?: number;
}

type InboxFilter = 'all' | 'updates' | 'messages';

const FILTERS: { id: InboxFilter; label: string }[] = [
  { id: 'all', label: 'All activity' },
  { id: 'updates', label: 'Updates' },
  { id: 'messages', label: 'Messages' },
];

export default function MobileUnifiedInbox() {
  const navigate = useNavigate();
  const theme = useAccentTheme();
  const { user } = useAuth();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [filter, setFilter] = useState<InboxFilter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadInbox = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);
    setLoadError(null);

    const [notificationsResult, messagesResult, channelsResult, unreadResult] = await Promise.all([
      supabase
        .from('notifications')
        .select('id, title, message, type, link, is_read, created_at')
        .order('created_at', { ascending: false })
        .limit(40),
      supabase
        .from('messages')
        .select('id, room_id, content, user_id, created_at')
        .order('created_at', { ascending: false })
        .limit(60),
      supabase.from('workspace_channels').select('id, name'),
      supabase.rpc('workspace_unread_counts'),
    ]);

    const errors = [notificationsResult.error, messagesResult.error].filter(Boolean);
    if (errors.length === 2) {
      console.error('Could not load mobile inbox:', errors);
      setLoadError('Inbox activity could not be loaded. Please try again.');
      setItems([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    if (errors.length > 0) {
      console.error('Some mobile inbox activity could not be loaded:', errors);
      toast.warning('Some inbox activity could not be loaded');
    }
    if (unreadResult.error) {
      console.warn('Chat unread counts are unavailable:', unreadResult.error);
      toast.warning('Chat unread counts are unavailable');
    }

    const channelNames = new Map((channelsResult.data || []).map((channel) => [channel.id, channel.name]));
    const unreadByRoom = new Map<string, number>(
      (unreadResult.data || []).map((room: { room_id: string; unread_count: number }) => [
        room.room_id,
        Number(room.unread_count) || 0,
      ] as [string, number])
    );
    const notificationItems: InboxItem[] = (notificationsResult.data || []).map((item) => ({
      id: item.id,
      kind: 'notification',
      title: item.title || 'Workspace update',
      body: item.message || '',
      createdAt: item.created_at,
      isRead: Boolean(item.is_read),
      route: item.link || '/notifications',
      category: item.type || 'update',
    }));
    const latestIncomingByRoom = new Map<string, { id: string; room_id: string; content: string; created_at: string }>();
    (messagesResult.data || []).forEach((message) => {
      if (message.user_id !== user?.id && !latestIncomingByRoom.has(message.room_id)) {
        latestIncomingByRoom.set(message.room_id, message);
      }
    });
    const messageItems: InboxItem[] = Array.from(latestIncomingByRoom.values()).map((message) => {
      const roomName = channelNames.get(message.room_id);
      const isDirectMessage = message.room_id.startsWith('dm_');
      const roomUnreadCount = unreadByRoom.get(message.room_id) || 0;
      return {
        id: message.id,
        kind: 'message',
        title: isDirectMessage ? 'Direct message' : `#${roomName || message.room_id}`,
        body: message.content || 'Shared an attachment',
        createdAt: message.created_at,
        isRead: roomUnreadCount === 0,
        route: `/messages/${message.room_id}`,
        category: 'message',
        roomId: message.room_id,
        unreadCount: roomUnreadCount,
      };
    });

    const combined = [...notificationItems, ...messageItems]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 60);
    setItems(combined);
    setLoading(false);
    setRefreshing(false);
  }, [user?.id]);

  useEffect(() => {
    loadInbox();
    const channel = supabase
      .channel(`mobile_inbox_${user?.id || 'guest'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => loadInbox(true))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => loadInbox(true))
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadInbox, user?.id]);

  const filteredItems = useMemo(
    () => items.filter((item) => filter === 'all' || (filter === 'messages' ? item.kind === 'message' : item.kind === 'notification')),
    [filter, items]
  );
  const unreadNotificationsCount = items.filter((item) => item.kind === 'notification' && !item.isRead).length;
  const unreadMessagesCount = items.reduce((count, item) => count + (item.kind === 'message' ? item.unreadCount || 0 : 0), 0);
  const unreadCount = unreadNotificationsCount + unreadMessagesCount;
  const formatRelativeTime = (value: string) => {
    const date = new Date(value);
    const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000));
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const hours = Math.floor(diffMinutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const openItem = async (item: InboxItem) => {
    if (item.kind === 'notification' && !item.isRead) {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', item.id);
      if (error) {
        console.error('Could not mark inbox update as read:', error);
        toast.error('Could not update read status');
        return;
      }
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, isRead: true } : entry));
    }
    navigate(item.route);
  };

  const markAllRead = async () => {
    if (!user?.id || unreadCount === 0) return;
    const results = await Promise.all([
      ...(unreadNotificationsCount
        ? [supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)]
        : []),
      ...items
        .filter((item) => item.kind === 'message' && (item.unreadCount || 0) > 0 && item.roomId)
        .map((item) =>
          supabase.from('workspace_channel_reads').upsert(
            { channel_id: item.roomId, user_id: user.id, last_read_at: new Date().toISOString() },
            { onConflict: 'channel_id,user_id' }
          )
        ),
    ]);
    const failedResult = results.find((result) => result.error);
    if (failedResult?.error) {
      console.error('Could not mark mobile inbox items as read:', failedResult.error);
      toast.error('Could not mark updates as read');
      await loadInbox(true);
      return;
    }
    setItems((current) => current.map((item) => ({ ...item, isRead: true, unreadCount: 0 })));
    toast.success('All caught up');
  };

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="mx-auto max-w-3xl space-y-5 px-4 py-5 sm:px-6 sm:py-8">
        <header className="flex items-start justify-between gap-3">
          <div>
            <div className={`mb-2 inline-flex items-center gap-1.5 text-xs font-semibold ${theme.textAccent}`}>
              <Sparkles size={14} />
              One place to catch up
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Inbox</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {unreadCount ? `${unreadCount} unread ${unreadCount === 1 ? 'item' : 'items'}` : 'You’re all caught up.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadInbox(true)}
            disabled={refreshing}
            aria-label="Refresh inbox"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </header>

        <div className="flex items-center justify-between gap-3">
          <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            <div className="flex w-max gap-2" role="group" aria-label="Filter inbox">
              {FILTERS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={filter === id}
                  onClick={() => setFilter(id)}
                  className={`min-h-10 rounded-full border px-4 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    filter === id
                      ? `${theme.bgSubtle} ${theme.textAccent} ${theme.borderAccent}/40`
                      : 'border-border bg-card text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {filter !== 'messages' && unreadCount > 0 && (
            <button type="button" aria-label="Mark all inbox items as read" onClick={() => void markAllRead()} className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 text-xs font-semibold ${theme.textAccent} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}>
              <CheckCheck size={15} />
              <span className="hidden min-[380px]:inline">Mark read</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3" aria-label="Loading inbox">
            {[0, 1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl border border-border bg-card" />)}
          </div>
        ) : loadError ? (
          <div role="alert" className="rounded-2xl border border-destructive/25 bg-destructive/5 p-5 text-center">
            <p className="text-sm font-semibold text-foreground">{loadError}</p>
            <button type="button" onClick={() => void loadInbox()} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold hover:bg-muted">
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-12 text-center">
            <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${theme.bgSubtle} ${theme.textAccent}`}>
              {filter === 'messages' ? <MessageCircle size={23} /> : <Bell size={23} />}
            </div>
            <h2 className="mt-4 font-semibold text-card-foreground">Nothing new right now</h2>
            <p className="mt-1 text-sm text-muted-foreground">New team messages and workspace updates will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredItems.map((item) => (
              <button
                key={`${item.kind}-${item.id}`}
                type="button"
                onClick={() => void openItem(item)}
                className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left shadow-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  !item.isRead ? `${theme.bgSubtle} border-border` : 'border-border bg-card'
                }`}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.bgSubtle} ${theme.textAccent}`}>
                  {item.kind === 'message' ? <MessageCircle size={18} /> : <Bell size={18} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="line-clamp-2 text-sm font-semibold text-card-foreground">{item.title}</span>
                    {!item.isRead && (
                      <span className={`mt-1.5 min-w-2 rounded-full ${theme.toggleActive} px-1.5 py-0.5 text-[10px] font-bold text-white`}>
                        {item.kind === 'message' ? item.unreadCount : ''}
                      </span>
                    )}
                  </span>
                  <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-muted-foreground">{item.body}</span>
                  <span className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Clock3 size={12} />
                    {formatRelativeTime(item.createdAt)}
                    {item.kind === 'notification' && item.isRead && <Check size={12} className="ml-1 text-emerald-500" />}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
