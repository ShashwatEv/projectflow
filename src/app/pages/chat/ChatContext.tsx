import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
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
  setActiveChannelId: (id: string) => void;
  createChannel: (name: string) => Promise<void>;
  sendMessage: (text: string, file?: File) => Promise<void>;
  broadcastTyping: (isTyping: boolean) => void;
  loadMoreMessages: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeThreadId: string | null;
  openThread: (id: string) => void;
  closeThread: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const [channels, setChannels] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [activeChannelId, setActiveChannelId] = useState<string>(''); 
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Initial Data Fetch
  useEffect(() => {
    const initData = async () => {
        const { data: channelData } = await supabase.from('channels').select('*').order('name');
        if (channelData) {
            setChannels(channelData);
            if (!activeChannelId && channelData.length > 0) setActiveChannelId(channelData[0].id);
        }
        const { data: userData } = await supabase.from('users').select('*');
        if (userData) setUsersList(userData);
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
    
    if (channelId.includes('dm_')) {
      query = query.eq('room_id', channelId);
    } else {
      query = query.eq('channel_id', channelId);
    }

    const { data } = await query;
    if (data) {
      const formatted = data.map(msg => formatMessageFromDB(msg, msg.user));
      setMessages(prev => ({ ...prev, [channelId]: formatted }));
    }
    setIsLoadingHistory(false);
  };

  // --- FIXED SEND MESSAGE FUNCTION ---
  const sendMessage = async (text: string, file?: File) => {
    if (!user) return;

    // 1. Create a temporary ID for the optimistic message
    const tempId = Math.random().toString(36).substr(2, 9);
    const timestamp = new Date().toISOString();

    // 2. Optimistic Message Object
    const optimisticMessage: Message = {
      id: tempId,
      text: text,
      senderId: user.id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      created_at: timestamp,
      user: { name: user.name, avatar: user.avatar }, // Attach current user info
      attachments: [] // Handle attachments if needed
    };

    // 3. Update State IMMEDIATELY (Show it now!)
    addMessageToState(activeChannelId, optimisticMessage);

    // 4. Prepare Payload for Database
    const payload: any = { 
        user_id: user.id, 
        text: text, // Make sure your DB column is 'text' (or 'content')
    }; 
    
    // Handle DM vs Channel IDs
    if (activeChannelId.includes('dm_')) {
      payload.room_id = activeChannelId;
      payload.channel_id = null; 
    } else {
      payload.channel_id = activeChannelId;
      payload.room_id = null; 
    }

    // 5. Send to Supabase
    const { error } = await supabase.from('messages').insert([payload]);
    
    if (error) {
        console.error("Send Error:", error);
        alert("Failed to send message");
        // Optionally remove the optimistic message here on failure
    } else {
        broadcastTyping(false);
        // Note: The Realtime subscription will come in later and replace/duplicate this.
        // Usually, we filter out duplicates or let the realtime event overwrite the optimistic one.
    }
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
    text: dbMsg.text || dbMsg.content, // Handle both just in case
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