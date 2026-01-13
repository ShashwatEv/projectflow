import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

// Types
interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
  created_at: string;
  attachments?: any[];
  reactions?: any[];
  replyCount?: number;
  user?: { name: string; avatar: string }; 
}

interface ChatContextType {
  channels: any[];
  users: any[];
  messages: Record<string, Message[]>;
  activeChannelId: string;
  activeChannelName: string;
  isLoadingHistory: boolean;
  typingUsers: string[];
  hasMoreMessages: boolean;
  
  // Actions
  setActiveChannelId: (id: string) => void;
  createChannel: (name: string) => Promise<void>;
  sendMessage: (text: string, file?: File) => Promise<void>;
  broadcastTyping: (isTyping: boolean) => void;
  loadMoreMessages: () => Promise<void>;
  
  // Search & Thread (Placeholders)
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeThreadId: string | null;
  openThread: (id: string) => void;
  closeThread: () => void;

  // Status (Restored for Sidebar)
  currentUserStatus: string;
  setStatus: (status: any) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { roomId } = useParams(); // Read URL param
  const navigate = useNavigate();
  
  const [channels, setChannels] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [activeChannelId, setActiveChannelIdState] = useState<string>(''); 
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [currentUserStatus, setCurrentUserStatus] = useState('online');
  
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Sync URL with State
  useEffect(() => {
    if (roomId && roomId !== activeChannelId) {
      setActiveChannelIdState(roomId);
    }
  }, [roomId]);

  // Wrapper to update URL when channel changes
  const setActiveChannelId = (id: string) => {
    setActiveChannelIdState(id);
    navigate(`/messages/${id}`);
  };

  // Initial Fetch
  useEffect(() => {
    const initData = async () => {
        const { data: ch } = await supabase.from('channels').select('*').order('name');
        if (ch) {
            setChannels(ch);
            // If no ID in URL, default to first channel
            if (!roomId && ch.length > 0) {
               setActiveChannelId(ch[0].id);
            }
        }
        const { data: u } = await supabase.from('users').select('*');
        if (u) setUsersList(u);
    };
    initData();
  }, []);

  // Realtime Subscription
  useEffect(() => {
    if (!activeChannelId || !user) return;

    if (channelRef.current) supabase.removeChannel(channelRef.current);
    fetchMessages(activeChannelId);

    const newChannel = supabase.channel(`chat:${activeChannelId}`, {
      config: { presence: { key: user.id } }
    });

    const filter = activeChannelId.includes('dm_') 
        ? `room_id=eq.${activeChannelId}` 
        : `channel_id=eq.${activeChannelId}`;

    newChannel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter }, async (payload) => {
         const { data: userData } = await supabase.from('users').select('name, avatar').eq('id', payload.new.user_id).single();
         const newMsg = formatMessageFromDB(payload.new, userData);
         addMessageToState(activeChannelId, newMsg);
      })
      .on('presence', { event: 'sync' }, () => {
        const state = newChannel.presenceState<{user_id: string, username: string, isTyping: boolean}>();
        const typers = Object.values(state).flat().filter(p => p.user_id !== user.id && p.isTyping).map(p => p.username);
        setTypingUsers(typers);
      })
      .subscribe();

    channelRef.current = newChannel;
    return () => { supabase.removeChannel(newChannel); };
  }, [activeChannelId]);

  const fetchMessages = async (channelId: string) => {
    setIsLoadingHistory(true);
    let query = supabase.from('messages').select(`*, user:users(name, avatar)`).order('created_at', { ascending: true });
    
    if (channelId.includes('dm_')) query = query.eq('room_id', channelId);
    else query = query.eq('channel_id', channelId);

    const { data } = await query;
    if (data) {
      const formatted = data.map(msg => formatMessageFromDB(msg, msg.user));
      setMessages(prev => ({ ...prev, [channelId]: formatted }));
    }
    setIsLoadingHistory(false);
  };

  const sendMessage = async (text: string, file?: File) => {
    if (!user) return;
    
    // Optimistic Update
    const tempId = Math.random().toString();
    const optimisticMsg: Message = {
        id: tempId, text, senderId: user.id, timestamp: 'Now', created_at: new Date().toISOString(),
        user: { name: user.name, avatar: user.avatar }
    };
    addMessageToState(activeChannelId, optimisticMsg);

    const payload: any = { user_id: user.id, text }; 
    
    if (activeChannelId.includes('dm_')) {
      payload.room_id = activeChannelId;
      payload.channel_id = null;
    } else {
      payload.channel_id = activeChannelId;
      payload.room_id = null;
    }

    const { error } = await supabase.from('messages').insert([payload]);
    if (error) console.error(error);
    else broadcastTyping(false);
  };

  const createChannel = async (name: string) => {
    const { data } = await supabase.from('channels').insert([{ name, type: 'public' }]).select().single();
    if (data) {
        setChannels(prev => [...prev, data]);
        setActiveChannelId(data.id);
    }
  };

  const broadcastTyping = async (isTyping: boolean) => {
    if (channelRef.current && user) {
      await channelRef.current.track({ user_id: user.id, username: user.name, isTyping });
    }
  };

  const formatMessageFromDB = (dbMsg: any, userData: any): Message => ({
    id: dbMsg.id,
    text: dbMsg.text || dbMsg.content,
    senderId: dbMsg.user_id,
    user: userData,
    timestamp: new Date(dbMsg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    created_at: dbMsg.created_at,
    attachments: [], 
  });

  const addMessageToState = (channelId: string, msg: Message) => {
    setMessages(prev => ({ ...prev, [channelId]: [...(prev[channelId] || []), msg] }));
  };

  const activeChannelName = channels.find(c => c.id === activeChannelId)?.name 
    || usersList.find(u => activeChannelId.includes(u.id))?.name 
    || 'Chat';

  return (
    <ChatContext.Provider value={{
      channels, users: usersList, messages, activeChannelId, activeChannelName,
      typingUsers, isLoadingHistory, hasMoreMessages: false,
      setActiveChannelId, createChannel, sendMessage, broadcastTyping,
      loadMoreMessages: async () => {},
      searchQuery: '', setSearchQuery: () => {},
      activeThreadId: null, openThread: () => {}, closeThread: () => {},
      currentUserStatus, setStatus: setCurrentUserStatus
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};