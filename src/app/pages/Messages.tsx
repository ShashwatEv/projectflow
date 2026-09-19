import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Send, Hash, Search, Plus, Smile, MessageSquare,
  Menu, X, ExternalLink
} from 'lucide-react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTyping } from '../../hooks/useTyping';
import { useOnlineUsers } from '../../hooks/useOnlineUsers';
import TypingIndicator from '../components/TypingIndicator';
import ChatFileButton from '../components/ChatFileButton';
import MessageBubble from '../components/MessageBubble';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  file_url?: string;
  file_type?: string;
  is_edited?: boolean;
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
}

const DEFAULT_CHANNELS: Channel[] = [
  { id: 'room_1', name: 'general', description: 'Company-wide discussion and updates' },
  { id: 'room_dev', name: 'development', description: 'Tech stack, architecture & bug tracking' },
  { id: 'room_design', name: 'design', description: 'UI/UX specs, Figma boards & creative work' },
  { id: 'room_random', name: 'random', description: 'Coffee chats, memes & watercooler conversations' },
];

export default function Messages() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const currentRoomId = roomId || 'room_1';

  // Online Presence
  const onlineUserIds = useOnlineUsers();

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [channels, setChannels] = useState<Channel[]>(() => {
    const saved = localStorage.getItem('projectflow_channels');
    return saved ? JSON.parse(saved) : DEFAULT_CHANNELS;
  });

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInputEmojiPicker, setShowInputEmojiPicker] = useState(false);
  const [isAddChannelOpen, setIsAddChannelOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const { typingUsers, broadcastTyping } = useTyping(currentRoomId);

  // Close emoji picker when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowInputEmojiPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Team Users for Direct Messages list
  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase.from('users').select('id, name, avatar, email, role');
      if (data && !error) setUsers(data);
    }
    fetchUsers();
  }, []);

  // Subscribe to Messages and Reactions
  useEffect(() => {
    setMessages([]);
    fetchMessages();

    const channel = supabase
      .channel(`chat_${currentRoomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `room_id=eq.${currentRoomId}` },
        (payload) => handleMessageChange(payload)
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'message_reactions' },
        () => fetchMessages()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentRoomId]);

  // Auto-scroll on new message or typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, typingUsers]);

  const handleMessageChange = async (payload: any) => {
    if (payload.eventType === 'INSERT') {
      const { data: userData } = await supabase.from('users').select('name, avatar').eq('id', payload.new.user_id).single();
      setMessages((prev) => [...prev, { ...payload.new, user: userData, message_reactions: [] }]);
    }
    if (payload.eventType === 'DELETE') {
      setMessages((prev) => prev.filter(msg => msg.id !== payload.old.id));
    }
    if (payload.eventType === 'UPDATE') {
      setMessages((prev) => prev.map(msg => msg.id === payload.new.id ? { ...msg, ...payload.new } : msg));
    }
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*, user:users(name, avatar), message_reactions(*)')
      .eq('room_id', currentRoomId)
      .order('created_at', { ascending: true });

    if (data) setMessages(data);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    const content = newMessage.trim();
    setNewMessage('');
    setShowInputEmojiPicker(false);

    const { error } = await supabase.from('messages').insert({
      room_id: currentRoomId,
      user_id: user.id,
      content: content,
    });

    if (error) {
      toast.error('Failed to send message');
      setNewMessage(content);
    }
  };

  const handleFileUpload = async (url: string, type: string) => {
    if (!user) return;
    const { error } = await supabase.from('messages').insert({
      room_id: currentRoomId,
      user_id: user.id,
      content: type === 'image' ? 'Shared an image' : 'Shared an attachment',
      file_url: url,
      file_type: type
    });

    if (error) {
      toast.error('Failed to share file');
    } else {
      toast.success('File shared in chat');
    }
  };

  const handleEdit = async (id: string, newContent: string) => {
    await supabase.from('messages').update({ content: newContent, is_edited: true }).eq('id', id);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('messages').delete().eq('id', id);
    toast.success('Message deleted');
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

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
        emoji: emoji
      });
    }
  };

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedName = newChannelName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!formattedName) return;

    const newChannel: Channel = {
      id: `room_${formattedName}`,
      name: formattedName,
      description: newChannelDesc.trim() || 'Custom discussion channel'
    };

    const updated = [...channels, newChannel];
    setChannels(updated);
    localStorage.setItem('projectflow_channels', JSON.stringify(updated));

    setIsAddChannelOpen(false);
    setNewChannelName('');
    setNewChannelDesc('');
    toast.success(`Channel #${formattedName} created!`);
    navigate(`/messages/${newChannel.id}`);
  };

  // Determine current conversation type (Channel vs DM)
  const isDM = currentRoomId.startsWith('dm_');
  let dmRecipient: TeamUser | undefined;
  if (isDM && user) {
    const parts = currentRoomId.replace('dm_', '').split('_');
    const recipientId = parts.find(id => id !== user.id) || parts[0];
    dmRecipient = users.find(u => u.id === recipientId);
  }

  const currentChannel = channels.find(c => c.id === currentRoomId);

  // Helper to construct DM room id
  const getDMRoomId = (otherUserId: string) => {
    if (!user) return 'room_1';
    const ids = [user.id, otherUserId].sort();
    return `dm_${ids[0]}_${ids[1]}`;
  };

  // Filtered lists for search
  const filteredChannels = channels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredUsers = users.filter(u => u.id !== user?.id && (
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  ));

  return (
    <div className="flex h-full bg-white dark:bg-gray-900 overflow-hidden relative">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- CONVERSATIONS SIDEBAR --- */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-72 md:w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <MessageSquare size={16} />
            </div>
            <div>
              <h2 className="font-bold text-sm text-gray-900 dark:text-white">Conversations</h2>
              <p className="text-[11px] text-gray-500">{channels.length} channels • {users.length} members</p>
            </div>
          </div>

          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search chat or people..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Channels & DMs List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          {/* Channels Section */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Channels</span>
              <button
                onClick={() => setIsAddChannelOpen(true)}
                className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors"
                title="Create Channel"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="space-y-0.5">
              {filteredChannels.map(ch => {
                const isActive = currentRoomId === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      navigate(`/messages/${ch.id}`);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800/60'
                    }`}
                  >
                    <Hash size={15} className={isActive ? 'text-white' : 'text-gray-400'} />
                    <span className="truncate flex-1">{ch.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct Messages Section */}
          <div>
            <div className="px-2 mb-1.5">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Direct Messages</span>
            </div>

            <div className="space-y-0.5">
              {filteredUsers.map(u => {
                const dmId = getDMRoomId(u.id);
                const isActive = currentRoomId === dmId;
                const isOnline = onlineUserIds.has(u.id);

                return (
                  <button
                    key={u.id}
                    onClick={() => {
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
                        src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=6366f1&color=fff`}
                        alt={u.name}
                        className="w-7 h-7 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                      />
                      <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white dark:border-gray-800 ${
                        isOnline ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{u.name}</p>
                      <p className={`text-[10px] truncate ${isActive ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {u.role || 'Member'}
                      </p>
                    </div>
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

      {/* --- MAIN CHAT WORKSPACE --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Dynamic Chat Header */}
        <div className="h-16 px-5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Menu size={18} />
            </button>

            {isDM && dmRecipient ? (
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <img
                    src={dmRecipient.avatar || `https://ui-avatars.com/api/?name=${dmRecipient.name}`}
                    alt={dmRecipient.name}
                    className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                  />
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800 ${
                    onlineUserIds.has(dmRecipient.id) ? 'bg-emerald-500' : 'bg-gray-400'
                  }`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="font-bold text-sm text-gray-900 dark:text-white truncate">{dmRecipient.name}</h1>
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

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
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

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-gray-50/60 dark:bg-gray-900">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 flex items-center justify-center mb-3">
                <MessageSquare size={24} />
              </div>
              <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300">
                {isDM ? `This is the start of your direct conversation with ${dmRecipient?.name || 'them'}.` : `Welcome to #${currentChannel?.name || currentRoomId}!`}
              </h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">Send a message or share a document to start collaborating in real time.</p>
            </div>
          )}

          {messages.map((msg, index) => {
            const isMe = msg.user_id === user?.id;
            const prevMsg = messages[index - 1];
            const showHeader = index === 0 || (prevMsg?.user_id !== msg.user_id);

            return (
              <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="w-8 shrink-0 flex flex-col justify-end">
                  {showHeader && !isMe && (
                    <img 
                      src={msg.user?.avatar || `https://ui-avatars.com/api/?name=${msg.user?.name || 'User'}`} 
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
                    onEdit={handleEdit} 
                    onDelete={handleDelete} 
                    onReact={handleReaction} 
                  />
                  
                  <span className={`text-[10px] text-gray-400 mt-1 ${isMe ? 'mr-1' : 'ml-1'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing & Input Bar */}
        <div className="p-3 md:p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 relative">
          <div className="h-5 mb-1">
            <TypingIndicator users={typingUsers} />
          </div>

          {/* Input Emoji Picker Popover */}
          {showInputEmojiPicker && (
            <div 
              ref={emojiPickerRef} 
              className="absolute bottom-20 left-4 md:left-12 z-50 shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            >
              <EmojiPicker
                theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT}
                onEmojiClick={(emojiData: EmojiClickData) => {
                  setNewMessage(prev => prev + emojiData.emoji);
                }}
                width={320}
                height={380}
                lazyLoadEmojis={true}
                searchPlaceHolder="Search emoji..."
              />
            </div>
          )}

          <form onSubmit={sendMessage} className="flex gap-2 items-center max-w-5xl mx-auto">
            <ChatFileButton onUploadComplete={handleFileUpload} />

            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={() => broadcastTyping()}
                placeholder={isDM ? `Message ${dmRecipient?.name || '...'}` : `Message #${currentChannel?.name || currentRoomId}...`}
                className="w-full pl-4 pr-20 py-3 bg-gray-100 dark:bg-gray-900 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-900 dark:text-white transition-all placeholder-gray-400"
              />

              <div className="absolute right-2.5 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowInputEmojiPicker(!showInputEmojiPicker)}
                  className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-gray-200/50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Insert emoji"
                >
                  <Smile size={18} />
                </button>
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-30 transition-all shadow-sm active:scale-95"
                  title="Send"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* --- CREATE CHANNEL MODAL --- */}
      {isAddChannelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Create New Channel</h3>
              <button onClick={() => setIsAddChannelOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleCreateChannel} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Channel Name *</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-gray-400 font-bold">#</span>
                  <input
                    required
                    autoFocus
                    type="text"
                    placeholder="announcements"
                    value={newChannelName}
                    onChange={e => setNewChannelName(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="What is this channel about?"
                  value={newChannelDesc}
                  onChange={e => setNewChannelDesc(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                />
              </div>

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
                  disabled={!newChannelName.trim()}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md disabled:opacity-50"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}