import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Channel, Message, User, TypingState, UserStatus } from './types';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ChatContextType {
  channels: Channel[];
  users: User[];
  messages: Record<string, Message[]>; 
  activeChannelId: string;
  searchQuery: string;
  typingUsers: string[];
  hasMoreMessages: boolean; 
  isLoadingHistory: boolean;

  // -- RESTORED MISSING PROPERTIES --
  activeThreadId: string | null;
  threads: Record<string, Message[]>;
  currentUserStatus: UserStatus;
  openThread: (msgId: string) => void;
  closeThread: () => void;
  sendThreadMessage: (parentId: string, text: string) => Promise<void>;
  setStatus: (status: UserStatus) => void;
  // --------------------------------

  setActiveChannelId: (id: string) => void;
  setSearchQuery: (query: string) => void;
  createChannel: (name: string) => Promise<void>;
  sendMessage: (text: string, file?: File) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  broadcastTyping: (isTyping: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // State
  const [channels, setChannels] = useState<Channel[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [activeChannelId, setActiveChannelId] = useState<string>(''); // Start empty 
  const [searchQuery, setSearchQuery] = useState('');
  
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const MESSAGES_PER_PAGE = 20;

  // -- RESTORED STATE --
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Record<string, Message[]>>({});
  const [currentUserStatus, setCurrentUserStatus] = useState<UserStatus>('online');
  // --------------------

  useEffect(() => {
    fetchChannels();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!activeChannelId || !user) return;

    if (channelRef.current) supabase.removeChannel(channelRef.current);

    setHasMoreMessages(true);
    fetchMessages(activeChannelId, 0);
    
    // Feature: Mark as read logic would go here

    const newChannel = supabase.channel(`chat:${activeChannelId}`, {
      config: { presence: { key: user.id } }
    });

    newChannel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${activeChannelId}` }, (payload) => {
         const newMsg = formatMessageFromDB(payload.new);
         addMessageToState(activeChannelId, newMsg);
      })
      .on('presence', { event: 'sync' }, () => {
        const state = newChannel.presenceState<TypingState>();
        const typers = Object.values(state)
          .flat()
          .filter(p => p.user_id !== user.id && p.isTyping)
          .map(p => p.username);
        setTypingUsers(typers);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await newChannel.track({ user_id: user.id, username: user.name, isTyping: false });
        }
      });

    channelRef.current = newChannel;

    return () => {
      supabase.removeChannel(newChannel);
    };
  }, [activeChannelId]);

  // --- DATA FETCHING ---
  const fetchChannels = async () => {
  const { data } = await supabase.from('channels').select('*');
  if (data && data.length > 0) {
     setChannels(data);
     // Automatically select the first channel found in DB
     if (!activeChannelId) setActiveChannelId(data[0].id);
  }
};

  const fetchUsers = async () => {
    const { data } = await supabase.from('users').select('*');
    if (data) setUsersList(data);
  };

  const fetchMessages = async (channelId: string, offset: number) => {
    if (offset > 0) setIsLoadingHistory(true);

    const { data, error } = await supabase
      .from('messages')
      .select(`*, user:users(name, avatar)`)
      .eq('channel_id', channelId)
      .is('parent_id', null) // Only fetch main messages, not thread replies
      .order('created_at', { ascending: false })
      .range(offset, offset + MESSAGES_PER_PAGE - 1);

    if (!error && data) {
      const formatted = data.map(formatMessageFromDB).reverse();
      
      if (data.length < MESSAGES_PER_PAGE) setHasMoreMessages(false);

      setMessages(prev => {
        const existing = prev[channelId] || [];
        return { 
          ...prev, 
          [channelId]: offset === 0 ? formatted : [...formatted, ...existing] 
        };
      });
    }
    setIsLoadingHistory(false);
  };

  const loadMoreMessages = async () => {
    if (!hasMoreMessages || isLoadingHistory) return;
    const currentLength = messages[activeChannelId]?.length || 0;
    await fetchMessages(activeChannelId, currentLength);
  };

  // --- ACTIONS ---
  const sendMessage = async (text: string, file?: File) => {
    if (!user) return;

    let attachments = [];

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${activeChannelId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file);

      if (!uploadError) {
        const { data } = supabase.storage.from('chat-attachments').getPublicUrl(filePath);
        attachments.push({
          id: filePath,
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'file',
          url: data.publicUrl,
          size: file.size
        });
      }
    }

    const { error } = await supabase.from('messages').insert([
      { 
        channel_id: activeChannelId, 
        user_id: user.id, 
        text,
        attachments: attachments 
      }
    ]);
    
    if (!error) broadcastTyping(false);
  };

  const broadcastTyping = async (isTyping: boolean) => {
    if (channelRef.current && user) {
      await channelRef.current.track({ user_id: user.id, username: user.name, isTyping });
    }
  };

  const createChannel = async (name: string) => {
    const { data } = await supabase.from('channels').insert([{ name, type: 'channel' }]).select().single();
    if (data) {
        setChannels(prev => [...prev, data]);
        setActiveChannelId(data.id);
    }
  };

  // -- RESTORED ACTIONS (Placeholder logic for now to prevent crashes) --
  const openThread = (msgId: string) => setActiveThreadId(msgId);
  const closeThread = () => setActiveThreadId(null);
  
  const sendThreadMessage = async (parentId: string, text: string) => {
      // Logic for threading would basically be same as sendMessage but with parent_id
      if (!user) return;
      await supabase.from('messages').insert([
          { channel_id: activeChannelId, user_id: user.id, text, parent_id: parentId }
      ]);
  };
  
  const setStatus = (status: UserStatus) => {
      setCurrentUserStatus(status);
      // In real app, you'd save this to Supabase 'users' table
  };
  // -------------------------------------------------------------------

  // --- HELPERS ---
  const formatMessageFromDB = (dbMsg: any): Message => ({
    id: dbMsg.id,
    text: dbMsg.text,
    senderId: dbMsg.user_id,
    timestamp: new Date(dbMsg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    created_at: dbMsg.created_at,
    attachments: dbMsg.attachments || [],
    replyCount: 0 
  });

  const addMessageToState = (channelId: string, msg: Message) => {
    setMessages(prev => ({
      ...prev,
      [channelId]: [...(prev[channelId] || []), msg]
    }));
  };

  return (
    <ChatContext.Provider value={{
      channels, users: usersList, messages, activeChannelId, searchQuery, 
      typingUsers, hasMoreMessages, isLoadingHistory,
      setActiveChannelId, setSearchQuery, createChannel, sendMessage, 
      loadMoreMessages, broadcastTyping,
      // Pass restored values
      activeThreadId, threads, currentUserStatus, openThread, closeThread, sendThreadMessage, setStatus
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