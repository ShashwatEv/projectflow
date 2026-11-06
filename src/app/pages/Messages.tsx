import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Send, Hash, Search, Plus, Smile, MessageSquare,
  Menu, X, Palette, ExternalLink, Check, Lock, Bell, BellOff
} from 'lucide-react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTyping } from '../../hooks/useTyping';
import { useOnlineUsers } from '../../hooks/useOnlineUsers';
import TypingIndicator from '../components/TypingIndicator';
import ChatFileButton from '../components/ChatFileButton';
import ChatVoiceRecorder from '../components/ChatVoiceRecorder';
import MessageBubble from '../components/MessageBubble';
import { triggerHaptic } from '../../lib/haptics';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  file_url?: string;
  file_type?: string;
  is_edited?: boolean;
  reply_count?: number;
  user?: { name: string; avatar: string };
  message_reactions?: { id: string; emoji: string; user_id: string }[];
}

interface TeamUser {
  id: string;
  name: string;
  avatar: string;
  email: string;
  role: string;
}

interface Channel {
  id: string;
  name: string;
  description?: string;
  is_private?: boolean;
  created_by?: string | null;
  last_message?: string;
  unread_count?: number;
}

const DEFAULT_CHANNELS: Channel[] = [
  { id: 'room_1', name: 'general', description: 'Company-wide discussion and updates' },
  { id: 'room_dev', name: 'development', description: 'Tech stack, architecture and bug tracking' },
  { id: 'room_design', name: 'design', description: 'UI and UX specs, Figma boards and creative work' },
  { id: 'room_random', name: 'random', description: 'Coffee chats, memes and watercooler conversations' },
];

export default function Messages() {
  const { user } = useAuth();
  const { theme, accentColor, chatWallpaper } = useTheme();
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const currentRoomId = roomId || 'room_1';

  const onlineUserIds = useOnlineUsers();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [channels, setChannels] = useState<Channel[]>(DEFAULT_CHANNELS);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [lastMessagePreviews, setLastMessagePreviews] = useState<Record<string, string>>({});
  const [mutedRooms, setMutedRooms] = useState<Record<string, boolean>>({});
  const [activeWallpaper, setActiveWallpaper] = useState(chatWallpaper);
  const [isCurrentRoomMuted, setIsCurrentRoomMuted] = useState(false);
  const [newChannelIsPrivate, setNewChannelIsPrivate] = useState(false);
  const [inviteeIds, setInviteeIds] = useState<string[]>([]);
  const [hasOlderMessages, setHasOlderMessages] = useState(false);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [isChannelLoading, setIsChannelLoading] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [isMessageSearchOpen, setIsMessageSearchOpen] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [showInputEmojiPicker, setShowInputEmojiPicker] = useState(false);
  const [isAddChannelOpen, setIsAddChannelOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesListRef = useRef<HTMLDivElement>(null);
  const isAtLatestRef = useRef(true);
  const previousMessageCountRef = useRef(0);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const oldestMessageAtRef = useRef<string | null>(null);
  const fetchRequestIdRef = useRef(0);
  const isCurrentRoomMutedRef = useRef(false);
  const { typingUsers, broadcastTyping } = useTyping(currentRoomId);

  useEffect(() => {
    isCurrentRoomMutedRef.current = isCurrentRoomMuted;
  }, [isCurrentRoomMuted]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowInputEmojiPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let active = true;
    const loadChannels = async () => {
      const saved = localStorage.getItem('projectflow_channels');
      let localChannels: Channel[] = DEFAULT_CHANNELS;
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) localChannels = parsed;
        } catch (error) {
          console.error('Could not parse locally saved channels:', error);
        }
      }

      const { data, error } = await supabase
        .from('workspace_channels')
        .select('id, name, description, is_private, created_by')
        .order('created_at', { ascending: true });
      if (!active) return;
      if (error) {
        console.warn('Shared channels unavailable; using this browser’s saved channels. Apply the collaboration migration to enable shared channels.', error);
        setChannels(localChannels);
        return;
      }

      const sharedChannels = (data || []) as Channel[];
      const sharedIds = new Set(sharedChannels.map((channel) => channel.id));
      const legacyChannels = localChannels.filter(
        (channel) => !sharedIds.has(channel.id) && !channel.is_private && /^room_[a-z0-9-]+$/.test(channel.id)
      );
      if (user?.id && legacyChannels.length) {
        const { data: migratedLegacyChannels, error: legacyError } = await supabase
          .from('workspace_channels')
          .upsert(
            legacyChannels.map((channel) => ({
              id: channel.id,
              name: channel.name,
              description: channel.description || '',
              is_private: false,
              created_by: user.id,
            })),
            { onConflict: 'id', ignoreDuplicates: true }
          )
          .select('id, name, description, is_private, created_by');
        if (legacyError) {
          console.warn('Some browser-local channels could not be migrated to the shared workspace:', legacyError);
        } else {
          sharedChannels.push(...((migratedLegacyChannels || []) as Channel[]));
        }
      }
      const migratedIds = new Set(sharedChannels.map((channel) => channel.id));
      const remainingLocalChannels = legacyChannels.filter((channel) => !migratedIds.has(channel.id));
      setChannels([...sharedChannels, ...remainingLocalChannels]);
      if (user?.id) {
        const { data: unreadData, error: unreadError } = await supabase.rpc('workspace_unread_counts');
        if (unreadError) {
          console.warn('Unread chat counts are unavailable until the collaboration migration is applied.', unreadError);
        } else if (active) {
          const counts: Record<string, number> = {};
          (unreadData || []).forEach((row: { room_id: string; unread_count: number }) => {
            counts[row.room_id] = Number(row.unread_count) || 0;
          });
          setUnreadCounts(counts);
        }

        const { data: preferenceData, error: preferenceError } = await supabase
          .from('workspace_channel_preferences')
          .select('channel_id, is_muted')
          .eq('user_id', user.id)
          .eq('is_muted', true);
        if (preferenceError) {
          console.warn('Muted conversation preferences are unavailable until the collaboration migration is applied.', preferenceError);
        } else if (active) {
          const muted: Record<string, boolean> = {};
          (preferenceData || []).forEach((preference: { channel_id: string; is_muted: boolean }) => {
            muted[preference.channel_id] = preference.is_muted;
          });
          setMutedRooms(muted);
        }

        const { data: previewData, error: previewError } = await supabase.rpc('workspace_channel_previews');
        if (previewError) {
          console.warn('Chat previews are unavailable until the collaboration migration is applied.', previewError);
        } else if (active) {
          const previews: Record<string, string> = {};
          (previewData || []).forEach((row: { room_id: string; last_message: string }) => {
            previews[row.room_id] = row.last_message || '';
          });
          setLastMessagePreviews(previews);
          setChannels((current) => current.map((channel) => ({
            ...channel,
            last_message: previews[channel.id] || '',
          })));
        }
      }
    };
    loadChannels();
    return () => {
      active = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    const loadRoomPreferences = async () => {
      const { data, error } = await supabase
        .from('workspace_channel_preferences')
        .select('wallpaper, is_muted')
        .eq('channel_id', currentRoomId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (!active) return;
      if (error) {
        console.warn('Per-conversation chat settings are unavailable until the collaboration migration is applied.', error);
        setActiveWallpaper(chatWallpaper);
        setIsCurrentRoomMuted(false);
        return;
      }
      setActiveWallpaper(data?.wallpaper || chatWallpaper);
      setIsCurrentRoomMuted(data?.is_muted || false);
      setMutedRooms((current) => ({ ...current, [currentRoomId]: data?.is_muted || false }));
    };
    loadRoomPreferences();
    return () => {
      active = false;
    };
  }, [currentRoomId, user?.id, chatWallpaper]);

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase.from('user_profiles').select('id, name, avatar, email, role');
      if (data && !error) setUsers(data);
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    setMessages([]);
    previousMessageCountRef.current = 0;
    isAtLatestRef.current = true;
    setNewMessageCount(0);
    setMessageSearchQuery('');
    setIsMessageSearchOpen(false);
    setHasOlderMessages(false);
    oldestMessageAtRef.current = null;
    fetchMessages(true, '');
    void (async () => {
      await markRoomRead();
      const { data: refreshedUnread, error: unreadError } = await supabase.rpc('workspace_unread_counts');
      if (!unreadError) {
        const refreshedCounts: Record<string, number> = {};
        (refreshedUnread || []).forEach((row: { room_id: string; unread_count: number }) => {
          refreshedCounts[row.room_id] = Number(row.unread_count) || 0;
        });
        setUnreadCounts((current) => ({ ...current, ...refreshedCounts, [currentRoomId]: 0 }));
      }
    })();

    const channel = supabase
      .channel(`chat_${currentRoomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `room_id=eq.${currentRoomId}` },
        (payload) => {
          handleMessageChange(payload);
          if (payload.eventType === 'INSERT' && payload.new.user_id !== user?.id && !isCurrentRoomMutedRef.current) {
            triggerHaptic('tap');
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'message_reactions' },
        () => fetchMessages(true, messageSearchQuery)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentRoomId]);

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`workspace_unread_${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const message = payload.new as Message & { room_id: string };
        if (!message.room_id || message.user_id === user.id || message.room_id === currentRoomId) return;
        setLastMessagePreviews((current) => ({ ...current, [message.room_id]: message.content || '' }));
        setUnreadCounts((current) => ({
          ...current,
          [message.room_id]: (current[message.room_id] || 0) + 1,
        }));
        if (!mutedRooms[message.room_id]) {
          const roomName = channels.find((item) => item.id === message.room_id)?.name;
          toast(`${roomName ? `#${roomName}` : 'New direct message'}: ${message.content}`);
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, currentRoomId, mutedRooms, channels]);

  useEffect(() => {
    if (!isMessageSearchOpen) return;
    const timer = window.setTimeout(() => {
      fetchMessages(true, messageSearchQuery);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [messageSearchQuery, isMessageSearchOpen, currentRoomId]);

  useEffect(() => {
    if (messages.length > previousMessageCountRef.current) {
      const addedCount = messages.length - previousMessageCountRef.current;
      if (isAtLatestRef.current) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setNewMessageCount(0);
      } else {
        setNewMessageCount((count) => count + addedCount);
      }
    }
    previousMessageCountRef.current = messages.length;
  }, [messages.length]);

  const handleMessageChange = async (payload: any) => {
    if (payload.eventType === 'INSERT') {
      const { data: userData } = await supabase
        .from('user_profiles')
        .select('name, avatar')
        .eq('id', payload.new.user_id)
        .single();
      setMessages((prev) => {
        if (prev.some((message) => message.id === payload.new.id)) return prev;
        return [...prev, { ...payload.new, user: userData, message_reactions: [] }];
      });
      setLastMessagePreviews((current) => ({ ...current, [currentRoomId]: payload.new.content || '' }));
      if (payload.new.user_id !== user?.id) {
        if (isAtLatestRef.current) {
          void markRoomRead();
        } else {
          setUnreadCounts((current) => ({
            ...current,
            [currentRoomId]: (current[currentRoomId] || 0) + 1,
          }));
        }
      }
    }
    if (payload.eventType === 'DELETE') {
      setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
    }
    if (payload.eventType === 'UPDATE') {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === payload.new.id ? { ...msg, ...payload.new } : msg))
      );
    }
  };

  const markRoomRead = async () => {
    if (!user?.id) return;
    const { error } = await supabase
      .from('workspace_channel_reads')
      .upsert(
        { channel_id: currentRoomId, user_id: user.id, last_read_at: new Date().toISOString() },
        { onConflict: 'channel_id,user_id' }
      );
    if (error) {
      console.warn('Could not save chat read state. Apply the collaboration migration to enable unread counts.', error);
      return;
    }
    setUnreadCounts((current) => ({ ...current, [currentRoomId]: 0 }));
  };

  const saveRoomPreference = async (updates: { wallpaper?: typeof chatWallpaper; is_muted?: boolean }) => {
    if (!user?.id) return;
    const { error } = await supabase.from('workspace_channel_preferences').upsert(
      {
        channel_id: currentRoomId,
        user_id: user.id,
        wallpaper: updates.wallpaper ?? activeWallpaper,
        is_muted: updates.is_muted ?? isCurrentRoomMuted,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'channel_id,user_id' }
    );
    if (error) {
      console.warn('Could not save chat preference. Apply the collaboration migration to sync this setting.', error);
      toast.warning('This preference is only saved for this session until the collaboration migration is applied.');
    }
    if (updates.is_muted !== undefined) {
      setMutedRooms((current) => ({ ...current, [currentRoomId]: updates.is_muted || false }));
    }
  };

  const fetchMessages = async (reset = true, search = '') => {
    const requestId = ++fetchRequestIdRef.current;
    let query = supabase
      .from('messages')
      .select('*, user:users(name, avatar), message_reactions(*)')
      .eq('room_id', currentRoomId);

    const normalizedSearch = search.trim();
    if (normalizedSearch) query = query.ilike('content', `%${normalizedSearch}%`);
    if (!reset && oldestMessageAtRef.current) {
      query = query.lt('created_at', oldestMessageAtRef.current);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching chat messages:', error);
      toast.error('Could not load messages');
      return;
    }

    const page = (data || []).reverse() as Message[];
    if (requestId !== fetchRequestIdRef.current) return;
    if (reset) {
      oldestMessageAtRef.current = page[0]?.created_at || null;
      setHasOlderMessages(page.length === 50);
      setMessages(page);
    } else {
      const oldestMessageAt = page[0]?.created_at;
      if (oldestMessageAt) oldestMessageAtRef.current = oldestMessageAt;
      setHasOlderMessages(page.length === 50);
      setMessages((current) => {
        const existingIds = new Set(current.map((message) => message.id));
        return [...page.filter((message) => !existingIds.has(message.id)), ...current];
      });
    }
  };

  const loadOlderMessages = async () => {
    if (!hasOlderMessages || loadingOlderMessages) return;
    const list = messagesListRef.current;
    const previousHeight = list?.scrollHeight || 0;
    const previousTop = list?.scrollTop || 0;
    setLoadingOlderMessages(true);
    try {
      await fetchMessages(false, messageSearchQuery);
      requestAnimationFrame(() => {
        if (list) list.scrollTop = previousTop + list.scrollHeight - previousHeight;
      });
    } finally {
      setLoadingOlderMessages(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    const content = newMessage.trim();
    setNewMessage('');
    setShowInputEmojiPicker(false);
    triggerHaptic('tap');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    isAtLatestRef.current = true;
    const { error } = await supabase.from('messages').insert({
      room_id: currentRoomId,
      user_id: user.id,
      content: content,
    });

    if (error) {
      toast.error('Failed to send message');
      setNewMessage(content);
    } else {
      isAtLatestRef.current = true;
      setNewMessageCount(0);
    }
  };

  const handleFileUpload = async (url: string, type: string) => {
    if (!user) return;
    triggerHaptic('tap');
    const { error } = await supabase.from('messages').insert({
      room_id: currentRoomId,
      user_id: user.id,
      content: type === 'image' ? 'Shared an image' : 'Shared an attachment',
      file_url: url,
      file_type: type,
    });

    if (error) {
      toast.error('Failed to share file');
    } else {
      toast.success('File shared in chat');
    }
  };

  const handleSendVoiceNote = async (audioUrl: string, durationSec: number) => {
    if (!user) return;
    triggerHaptic('tap');
    const { error } = await supabase.from('messages').insert({
      room_id: currentRoomId,
      user_id: user.id,
      content: `Voice note • ${durationSec}s`,
      file_url: audioUrl,
      file_type: 'audio',
    });

    if (error) {
      toast.error('Failed to send voice note');
    } else {
      toast.success('Voice note sent');
    }
  };

  const handleEdit = async (id: string, newContent: string) => {
    await supabase.from('messages').update({ content: newContent, is_edited: true }).eq('id', id);
  };

  const handleDelete = async (id: string) => {
    triggerHaptic('warning');
    await supabase.from('messages').delete().eq('id', id);
    toast.success('Message deleted');
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    triggerHaptic('tap');

    const { data: existing } = await supabase
      .from('message_reactions')
      .select('id')
      .eq('message_id', messageId)
      .eq('user_id', user.id)
      .eq('emoji', emoji)
      .single();

    if (existing) {
      await supabase.from('message_reactions').delete().eq('id', existing.id);
    } else {
      await supabase.from('message_reactions').insert({
        message_id: messageId,
        user_id: user.id,
        emoji: emoji,
      });
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    const formattedName = newChannelName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    if (!formattedName) return;

    setIsChannelLoading(true);
    const newChannel: Channel = {
      id: `room_${formattedName}`,
      name: formattedName,
      description: newChannelDesc.trim() || 'Custom discussion channel',
      is_private: newChannelIsPrivate,
      created_by: user.id,
    };

    try {
      const { data: createdChannel, error: createError } = await supabase
        .from('workspace_channels')
        .insert({
          id: newChannel.id,
          name: newChannel.name,
          description: newChannel.description,
          is_private: newChannelIsPrivate,
          created_by: user.id,
        })
        .select('id, name, description, is_private, created_by')
        .single();

      if (createError) {
        const migrationMissing = ['42P01', 'PGRST202', 'PGRST205'].includes(createError.code || '');
        if (!migrationMissing || newChannelIsPrivate) throw createError;

        const localChannels = [...channels, newChannel];
        setChannels(localChannels);
        localStorage.setItem('projectflow_channels', JSON.stringify(localChannels));
        toast.warning(`Channel #${formattedName} is local to this browser. Apply the collaboration migration to share it.`);
      } else {
        const members = [...new Set([user.id, ...inviteeIds])].map((userId) => ({
          channel_id: newChannel.id,
          user_id: userId,
        }));
        const { error: membersError } = await supabase
          .from('workspace_channel_members')
          .insert(members);
        if (membersError) {
          await supabase.from('workspace_channels').delete().eq('id', newChannel.id);
          throw membersError;
        }
        setChannels((current) => [...current, createdChannel as Channel]);
        toast.success(`Shared channel #${formattedName} created`);
      }

      setIsAddChannelOpen(false);
      setNewChannelName('');
      setNewChannelDesc('');
      setInviteeIds([]);
      setNewChannelIsPrivate(false);
      triggerHaptic('success');
      navigate(`/messages/${newChannel.id}`);
    } catch (error) {
      console.error('Could not create chat channel:', error);
      toast.error(newChannelIsPrivate
        ? 'Could not create the private channel. Apply the collaboration migration and check your access.'
        : 'Could not create this channel. The name may already be in use.');
    } finally {
      setIsChannelLoading(false);
    }
  };

  const isDM = currentRoomId.startsWith('dm_');
  let dmRecipient: TeamUser | undefined;
  if (isDM && user) {
    const parts = currentRoomId.replace('dm_', '').split('_');
    const recipientId = parts.find((id) => id !== user.id) || parts[0];
    dmRecipient = users.find((u) => u.id === recipientId);
  }

  const currentChannel = channels.find((c) => c.id === currentRoomId);

  const getDMRoomId = (otherUserId: string) => {
    if (!user) return 'room_1';
    const ids = [user.id, otherUserId].sort();
    return `dm_${ids[0]}_${ids[1]}`;
  };

  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredUsers = users.filter(
    (u) =>
      u.id !== user?.id &&
      (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role?.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const visibleMessages = messages.filter((message) => {
    const query = messageSearchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      message.content.toLowerCase().includes(query) ||
      message.user?.name?.toLowerCase().includes(query)
    );
  });
  const accentColors: Record<typeof accentColor, string> = {
    indigo: '#4f46e5',
    emerald: '#059669',
    blue: '#2563eb',
    purple: '#9333ea',
    rose: '#e11d48',
    orange: '#ea580c',
  };

  return (
    <div className="flex h-full bg-white dark:bg-gray-900 overflow-hidden relative">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 md:w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <MessageSquare size={16} />
            </div>
            <div>
              <h2 className="font-bold text-sm text-gray-900 dark:text-white">Conversations</h2>
              <p className="text-[11px] text-gray-500">
                {channels.length} channels • {users.length} members
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search chat or people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 touch-scroll-smooth">
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Channels
              </span>
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setIsAddChannelOpen(true);
                }}
                className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors"
                title="Create Channel"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="space-y-0.5">
              {filteredChannels.map((ch) => {
                const isActive = currentRoomId === ch.id;
                const unreadCount = unreadCounts[ch.id] || 0;
                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      triggerHaptic('tap');
                      navigate(`/messages/${ch.id}`);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800/60'
                    }`}
                  >
                    {ch.is_private
                      ? <Lock size={14} className={isActive ? 'text-white' : 'text-gray-400'} />
                      : <Hash size={15} className={isActive ? 'text-white' : 'text-gray-400'} />}
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate ${unreadCount ? 'font-bold' : ''}`}>{ch.name}</span>
                      <span className={`block truncate text-[10px] ${isActive ? 'text-indigo-100' : 'text-gray-400'}`}>
                        {lastMessagePreviews[ch.id] || ch.description || 'No messages yet'}
                      </span>
                    </span>
                    {unreadCount > 0 && (
                      <span className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-indigo-600 text-white'}`}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="px-2 mb-1.5">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Direct Messages
              </span>
            </div>

            <div className="space-y-0.5">
              {filteredUsers.map((u) => {
                const dmId = getDMRoomId(u.id);
                const isActive = currentRoomId === dmId;
                const isOnline = onlineUserIds.has(u.id);
                const unreadCount = unreadCounts[dmId] || 0;

                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      triggerHaptic('tap');
                      navigate(`/messages/${dmId}`);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors text-left ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800/60'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={
                          u.avatar ||
                          `https://ui-avatars.com/api/?name=${u.name}&background=6366f1&color=fff`
                        }
                        alt={u.name}
                        className="w-7 h-7 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white dark:border-gray-800 ${
                          isOnline ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{u.name}</p>
                      <p
                        className={`text-[10px] truncate ${
                          isActive ? 'text-indigo-200' : 'text-gray-400'
                        }`}
                      >
                        {lastMessagePreviews[dmId] || u.role || 'Member'}
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <span className="min-w-5 rounded-full bg-indigo-600 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}

              {filteredUsers.length === 0 && (
                <p className="text-[11px] text-gray-400 px-3 py-2">No members found.</p>
              )}
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="h-16 px-4 md:px-5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => {
                triggerHaptic('tap');
                setIsSidebarOpen(true);
              }}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              title="Open conversations drawer"
            >
              <Menu size={18} />
            </button>

            {isDM && dmRecipient ? (
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <img
                    src={
                      dmRecipient.avatar ||
                      `https://ui-avatars.com/api/?name=${dmRecipient.name}`
                    }
                    alt={dmRecipient.name}
                    className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800 ${
                      onlineUserIds.has(dmRecipient.id) ? 'bg-emerald-500' : 'bg-gray-400'
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                      {dmRecipient.name}
                    </h1>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {dmRecipient.role || 'Member'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1">
                    {onlineUserIds.has(dmRecipient.id) ? (
                      <span className="text-emerald-500 font-medium">Active now</span>
                    ) : (
                      <span>Offline</span>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Hash size={18} className="text-indigo-600 dark:text-indigo-400" />
                  <h1 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                    {currentChannel?.name || currentRoomId}
                  </h1>
                </div>
                <p className="text-[11px] text-gray-500 truncate max-w-md">
                  {currentChannel?.description || 'Team real-time collaboration channel'}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const nextMuted = !isCurrentRoomMuted;
                setIsCurrentRoomMuted(nextMuted);
                void saveRoomPreference({ is_muted: nextMuted });
                toast.success(nextMuted ? 'Conversation muted' : 'Conversation unmuted');
              }}
              aria-label={isCurrentRoomMuted ? 'Unmute this conversation' : 'Mute this conversation'}
              aria-pressed={isCurrentRoomMuted}
              className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
              title={isCurrentRoomMuted ? 'Unmute conversation' : 'Mute conversation'}
            >
              {isCurrentRoomMuted ? <BellOff size={16} /> : <Bell size={16} />}
            </button>
            <button
              type="button"
              onClick={() => {
                const closingSearch = isMessageSearchOpen;
                setIsMessageSearchOpen((open) => !open);
                setMessageSearchQuery('');
                if (closingSearch) fetchMessages(true, '');
              }}
              aria-label={isMessageSearchOpen ? 'Close message search' : 'Search this conversation'}
              aria-expanded={isMessageSearchOpen}
              className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
              title="Search this conversation"
            >
              {isMessageSearchOpen ? <X size={17} /> : <Search size={17} />}
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('tap');
                setIsThemeModalOpen(true);
              }}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-indigo-500/40 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Change chat theme wallpaper"
            >
              <Palette size={15} className="text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Theme</span>
            </button>

            {isDM && dmRecipient && (
              <Link
                to={`/profile/${dmRecipient.id}`}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
              >
                Profile <ExternalLink size={12} />
              </Link>
            )}
          </div>
        </div>

        {isMessageSearchOpen && (
          <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-2 dark:border-gray-800 dark:bg-gray-800">
            <Search size={15} className="shrink-0 text-gray-400" />
            <input
              type="search"
              autoFocus
              value={messageSearchQuery}
              onChange={(event) => setMessageSearchQuery(event.target.value)}
              placeholder="Search messages in this conversation..."
              aria-label="Search messages in this conversation"
              className="min-w-0 flex-1 bg-transparent py-1 text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100"
            />
            {messageSearchQuery && (
              <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400" aria-live="polite">
                {visibleMessages.length} {visibleMessages.length === 1 ? 'match' : 'matches'}
              </span>
            )}
          </div>
        )}

        <div
          ref={messagesListRef}
          onScroll={(event) => {
            const element = event.currentTarget;
            const atLatest = element.scrollHeight - element.scrollTop - element.clientHeight < 100;
            const wasAtLatest = isAtLatestRef.current;
            isAtLatestRef.current = atLatest;
            if (atLatest) {
              setNewMessageCount(0);
              if (!wasAtLatest) void markRoomRead();
            }
          }}
          className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-5 transition-all duration-300 relative touch-scroll-smooth ${
            activeWallpaper === 'whatsapp'
              ? 'bg-[#efeae2] dark:bg-[#0b141a]'
              : activeWallpaper === 'telegram'
              ? 'bg-gradient-to-b from-[#72b5e8]/25 via-[#2a75b2]/15 to-[#0e1621] dark:bg-[#0e1621]'
              : activeWallpaper === 'cyberpunk'
              ? 'bg-[#06060e] text-white'
              : activeWallpaper === 'dots'
              ? 'bg-[radial-gradient(#6366f125_1.5px,transparent_1.5px)] bg-[size:18px_18px] bg-indigo-50/40 dark:bg-[#0b0e14]'
              : activeWallpaper === 'gradient'
              ? 'bg-gradient-to-b from-indigo-500/10 via-purple-500/10 to-transparent bg-gray-50 dark:bg-gray-950'
              : activeWallpaper === 'minimal'
              ? 'bg-gray-50 dark:bg-gray-900'
              : 'bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] bg-gray-50/80 dark:bg-gray-950'
          }`}
          style={{
            backgroundImage:
              activeWallpaper === 'whatsapp'
                ? 'radial-gradient(#128c7e18 1.5px, transparent 1.5px), radial-gradient(#00a88412 1.5px, transparent 1.5px)'
                : activeWallpaper === 'cyberpunk'
                ? 'linear-gradient(to right, #ec489915 1px, transparent 1px), linear-gradient(to bottom, #3b82f615 1px, transparent 1px)'
                : undefined,
            backgroundSize:
              activeWallpaper === 'whatsapp'
                ? '20px 20px, 40px 40px'
                : activeWallpaper === 'cyberpunk'
                ? '28px 28px'
                : undefined,
          }}
        >
          {hasOlderMessages && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={loadOlderMessages}
                disabled={loadingOlderMessages}
                className="rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-xs font-semibold text-gray-600 shadow-sm backdrop-blur transition-colors hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-300 dark:hover:text-indigo-300"
              >
                {loadingOlderMessages ? 'Loading older messages…' : 'Load older messages'}
              </button>
            </div>
          )}
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 flex items-center justify-center mb-3">
                <MessageSquare size={24} />
              </div>
              <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300">
                {isDM
                  ? `This is the start of your direct conversation with ${dmRecipient?.name || 'them'}.`
                  : `Welcome to #${currentChannel?.name || currentRoomId}!`}
              </h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                Send a message, voice note, or share a document to start collaborating in real time.
              </p>
            </div>
          )}

          {messages.length > 0 && visibleMessages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-gray-500 dark:text-gray-400">
              <Search size={22} className="text-gray-400" />
              <p>No messages match “{messageSearchQuery}”.</p>
            </div>
          )}

          {visibleMessages.map((msg, index) => {
            const isMe = msg.user_id === user?.id;
            const prevMsg = messages[index - 1];
            const showHeader = index === 0 || prevMsg?.user_id !== msg.user_id;

            return (
              <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="w-8 shrink-0 flex flex-col justify-end">
                  {showHeader && !isMe && (
                    <img
                      src={
                        msg.user?.avatar ||
                        `https://ui-avatars.com/api/?name=${msg.user?.name || 'User'}`
                      }
                      className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm object-cover"
                      alt="avatar"
                    />
                  )}
                </div>

                <div className={`flex flex-col w-full ${isMe ? 'items-end' : 'items-start'}`}>
                  {showHeader && !isMe && (
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 ml-1 mb-1">
                      {msg.user?.name}
                    </span>
                  )}

                  <MessageBubble
                    message={msg}
                    isMe={isMe}
                    accentColor={accentColors[accentColor]}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onReact={handleReaction}
                  />

                  <span className={`text-[10px] text-gray-400 mt-1 ${isMe ? 'mr-1' : 'ml-1'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })}
          {newMessageCount > 0 && (
            <button
              type="button"
              onClick={() => {
                isAtLatestRef.current = true;
                setNewMessageCount(0);
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="sticky bottom-2 left-1/2 z-10 mx-auto flex min-h-10 -translate-x-1/2 items-center gap-2 rounded-full border border-indigo-200 bg-white/95 px-4 py-2 text-xs font-semibold text-indigo-700 shadow-lg backdrop-blur-md transition-colors hover:bg-indigo-50 dark:border-indigo-800 dark:bg-gray-900/95 dark:text-indigo-300 dark:hover:bg-gray-800"
            >
              {newMessageCount} new {newMessageCount === 1 ? 'message' : 'messages'} · Jump to latest
            </button>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 md:p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 relative">
          <div className="h-5 mb-1">
            <TypingIndicator users={typingUsers} />
          </div>

          {showInputEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-20 left-4 md:left-12 z-50 shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            >
              <EmojiPicker
                theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT}
                onEmojiClick={(emojiData: EmojiClickData) => {
                  setNewMessage((prev) => prev + emojiData.emoji);
                }}
                width={320}
                height={380}
                lazyLoadEmojis={true}
                searchPlaceHolder="Search emoji..."
              />
            </div>
          )}

          <form onSubmit={sendMessage} className="flex gap-2 items-end max-w-5xl mx-auto">
            <div className="flex items-center gap-1 pb-1">
              <ChatFileButton onUploadComplete={handleFileUpload} />
              <ChatVoiceRecorder
                roomId={currentRoomId}
                onSendVoiceNote={handleSendVoiceNote}
              />
            </div>

            <div className="flex-1 relative flex items-center bg-gray-100 dark:bg-gray-900 rounded-2xl border-0 focus-within:ring-2 focus-within:ring-indigo-500">
              <textarea
                ref={textareaRef}
                rows={1}
                value={newMessage}
                aria-label="Write a message"
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onFocus={() => {
                  if (isAtLatestRef.current) {
                    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 120);
                  }
                }}
                onKeyDown={(e) => {
                  broadcastTyping();
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
                placeholder={
                  isDM
                    ? `Message ${dmRecipient?.name || 'user'}...`
                    : `Message #${currentChannel?.name || currentRoomId}...`
                }
                className="w-full pl-4 pr-16 py-3 bg-transparent border-0 outline-none text-xs sm:text-sm text-gray-900 dark:text-white transition-all placeholder-gray-400 resize-none max-h-32 custom-scrollbar"
              />

              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('tap');
                    setIsThemeModalOpen(true);
                  }}
                  className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-gray-200/50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                  title="Customize chat wallpaper and theme"
                >
                  <Palette size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('tap');
                    setShowInputEmojiPicker(!showInputEmojiPicker);
                  }}
                  className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-gray-200/50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Insert emoji"
                >
                  <Smile size={17} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-30 transition-all shadow-sm active:scale-95 shrink-0"
              title="Send"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>

      {isAddChannelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Create New Channel</h3>
              <button
                onClick={() => setIsAddChannelOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateChannel} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  Channel Name *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-gray-400 font-bold">#</span>
                  <input
                    required
                    autoFocus
                    type="text"
                    placeholder="announcements"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="What is this channel about?"
                  value={newChannelDesc}
                  onChange={(e) => setNewChannelDesc(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                />
              </div>

              <label className="flex items-start gap-2 rounded-xl border border-gray-200 p-3 text-xs dark:border-gray-700">
                <input
                  type="checkbox"
                  checked={newChannelIsPrivate}
                  onChange={(event) => {
                    setNewChannelIsPrivate(event.target.checked);
                    if (!event.target.checked) setInviteeIds([]);
                  }}
                  className="mt-0.5 accent-indigo-600"
                />
                <span>
                  <span className="block font-semibold text-gray-800 dark:text-gray-200">Private channel</span>
                  <span className="mt-0.5 block text-gray-500 dark:text-gray-400">
                    Only you and invited members can discover or read this channel.
                  </span>
                </span>
              </label>

              {newChannelIsPrivate && (
                <fieldset className="space-y-2">
                  <legend className="text-xs font-bold text-gray-700 dark:text-gray-300">Invite members</legend>
                  <div className="max-h-32 space-y-1 overflow-y-auto rounded-xl border border-gray-200 p-2 dark:border-gray-700">
                    {users.filter((member) => member.id !== user?.id).map((member) => (
                      <label key={member.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900">
                        <input
                          type="checkbox"
                          checked={inviteeIds.includes(member.id)}
                          onChange={(event) => setInviteeIds((current) =>
                            event.target.checked
                              ? [...current, member.id]
                              : current.filter((id) => id !== member.id)
                          )}
                          className="accent-indigo-600"
                        />
                        <span className="truncate">{member.name || member.email}</span>
                      </label>
                    ))}
                    {users.filter((member) => member.id !== user?.id).length === 0 && (
                      <p className="px-2 py-1 text-xs text-gray-400">No other workspace members found.</p>
                    )}
                  </div>
                </fieldset>
              )}

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsAddChannelOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newChannelName.trim() || isChannelLoading}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md disabled:opacity-50"
                >
                  {isChannelLoading ? 'Creating…' : newChannelIsPrivate ? 'Create Private Channel' : 'Create Channel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isThemeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#12161f] w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Palette size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">
                    Chat Themes & Wallpaper
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Choose a wallpaper for this conversation only.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsThemeModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {[
                  {
                    id: 'whatsapp',
                    name: 'WhatsApp Doodle',
                    tag: 'WhatsApp Style',
                    bgPreview: 'bg-[#efeae2] dark:bg-[#0b141a]',
                    pattern: 'radial-gradient(#128c7e25 1.5px, transparent 1.5px)',
                    bubbleMe: 'bg-[#d9fdd3] text-gray-900',
                    bubbleThem: 'bg-white text-gray-900',
                  },
                  {
                    id: 'telegram',
                    name: 'Telegram Clouds',
                    tag: 'Telegram Style',
                    bgPreview:
                      'bg-gradient-to-b from-[#72b5e8]/30 via-[#2a75b2]/20 to-[#0e1621] dark:bg-[#0e1621]',
                    pattern: 'none',
                    bubbleMe: 'bg-[#2b5278] text-white',
                    bubbleThem: 'bg-[#182533] text-white',
                  },
                  {
                    id: 'cyberpunk',
                    name: 'Cyberpunk Grid',
                    tag: 'Neon High-Tech',
                    bgPreview: 'bg-[#05050c]',
                    pattern:
                      'linear-gradient(to right, #ec489915 1px, transparent 1px), linear-gradient(to bottom, #3b82f615 1px, transparent 1px)',
                    bubbleMe: 'bg-gradient-to-r from-pink-600 to-purple-600 text-white',
                    bubbleThem: 'bg-[#11131f] text-gray-200 border border-purple-500/30',
                  },
                  {
                    id: 'subtle-grid',
                    name: 'Subtle Grid',
                    tag: 'Clean Engineering',
                    bgPreview: 'bg-gray-100 dark:bg-gray-900',
                    pattern:
                      'linear-gradient(to right, #80808012 1px, transparent 1px), linear-gradient(to bottom, #80808012 1px, transparent 1px)',
                    bubbleMe: 'bg-indigo-600 text-white',
                    bubbleThem: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
                  },
                  {
                    id: 'dots',
                    name: 'Blueprint Dots',
                    tag: 'Architecture Studio',
                    bgPreview: 'bg-indigo-50/50 dark:bg-[#0d1117]',
                    pattern: 'radial-gradient(#6366f125 1.5px, transparent 1.5px)',
                    bubbleMe: 'bg-indigo-600 text-white',
                    bubbleThem: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
                  },
                  {
                    id: 'gradient',
                    name: 'Ambient Aurora',
                    tag: 'Vibrant Mesh',
                    bgPreview:
                      'bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/5 dark:bg-gray-900',
                    pattern: 'none',
                    bubbleMe: 'bg-indigo-600 text-white',
                    bubbleThem: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
                  },
                  {
                    id: 'minimal',
                    name: 'Clean Solid',
                    tag: 'Focus Mode',
                    bgPreview: 'bg-white dark:bg-gray-900',
                    pattern: 'none',
                    bubbleMe: 'bg-indigo-600 text-white',
                    bubbleThem: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100',
                  },
                ].map((th) => {
                  const isSelected = activeWallpaper === th.id;
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('tap');
                        const wallpaper = th.id as typeof chatWallpaper;
                        setActiveWallpaper(wallpaper);
                        void saveRoomPreference({ wallpaper });
                        toast.success(`Chat theme set to ${th.name}`);
                      }}
                      className={`text-left p-3 rounded-2xl border transition-all flex flex-col justify-between group cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-500/30 shadow-md bg-white dark:bg-gray-800'
                          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/80 hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                    >
                      <div
                        className={`h-24 w-full rounded-xl border border-gray-200/60 dark:border-gray-700/60 mb-2.5 p-2 flex flex-col justify-between relative overflow-hidden ${th.bgPreview}`}
                        style={{
                          backgroundImage: th.pattern !== 'none' ? th.pattern : undefined,
                          backgroundSize: th.pattern !== 'none' ? '14px 14px' : undefined,
                        }}
                      >
                        <div className="flex justify-start">
                          <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-lg shadow-2xs ${th.bubbleThem}`}>
                            Hey team 👋
                          </span>
                        </div>
                        <div className="flex justify-end">
                          <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-lg shadow-2xs ${th.bubbleMe}`}>
                            Looks great! 🚀
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            {th.name}
                          </p>
                          {isSelected && (
                            <Check
                              size={14}
                              className="text-indigo-600 dark:text-indigo-400 shrink-0"
                            />
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{th.tag}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/40">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Current: <strong className="text-gray-900 dark:text-white capitalize">{activeWallpaper}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('tap');
                  setIsThemeModalOpen(false);
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}