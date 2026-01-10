import { useState, useEffect, useRef } from 'react';
import { Send, Hash, MessageSquare, Search, Phone, Video, Info } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

// Types matching your DB Schema
interface Channel {
  id: string;
  name: string;
  type: 'channel' | 'dm';
}

interface Message {
  id: string;
  text: string;           // Matches your DB column 'text'
  user_id: string;        // Matches your DB column 'user_id'
  channel_id: string;
  created_at: string;
  user?: {                // Joined data
    name: string;
    avatar: string;
  }; 
}

export default function Chat() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Channels on Mount
  useEffect(() => {
    async function fetchChannels() {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .order('name');
      
      if (data && data.length > 0) {
        setChannels(data);
        setActiveChannel(data[0]); // Default to the first channel (e.g., General)
      }
      setIsLoading(false);
    }
    fetchChannels();
  }, []);

  // 2. Fetch Messages & Setup Realtime when Active Channel Changes
  useEffect(() => {
    if (!activeChannel) return;

    // A. Fetch existing messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*, user:users(name, avatar)') // Join with public.users table
        .eq('channel_id', activeChannel.id)
        .order('created_at', { ascending: true });

      if (data) setMessages(data);
    };

    fetchMessages();

    // B. Listen for NEW messages in this channel
    const channelSubscription = supabase
      .channel(`chat:${activeChannel.id}`)
      .on(
        'postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `channel_id=eq.${activeChannel.id}` // Filter for current channel
        }, 
        async (payload) => {
          // Fetch the full message with user details to append it correctly
          const { data } = await supabase
            .from('messages')
            .select('*, user:users(name, avatar)')
            .eq('id', payload.new.id)
            .single();
            
          if (data) setMessages((prev) => [...prev, data]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelSubscription);
    };
  }, [activeChannel]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !activeChannel) return;

    const textToSend = newMessage;
    setNewMessage(''); // Optimistic clear

    // Insert into DB (Realtime subscription will update the UI)
    await supabase.from('messages').insert({
      text: textToSend,
      user_id: user.id,
      channel_id: activeChannel.id,
    });
  };

  if (isLoading) return <div className="h-full flex items-center justify-center">Loading Chat...</div>;

  return (
    <div className="flex h-full bg-white dark:bg-gray-900 overflow-hidden">
      
      {/* --- LEFT SIDEBAR (Channels) --- */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">Workspace</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">Channels</p>
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setActiveChannel(channel)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeChannel?.id === channel.id 
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Hash size={18} />
              {channel.name}
            </button>
          ))}
        </div>
      </div>

      {/* --- RIGHT MAIN CHAT --- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Chat Header */}
        <div className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <Hash className="text-gray-400" />
            <h3 className="font-bold text-gray-900 dark:text-white">{activeChannel?.name}</h3>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <Search size={20} className="cursor-pointer hover:text-gray-600" />
            <Phone size={20} className="cursor-pointer hover:text-gray-600" />
            <Video size={20} className="cursor-pointer hover:text-gray-600" />
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>
            <Info size={20} className="cursor-pointer hover:text-gray-600" />
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, index) => {
             // Check if previous message was from same user to group them visually
             const isSequence = index > 0 && messages[index - 1].user_id === msg.user_id;
             const isMe = msg.user_id === user?.id;

             return (
               <div key={msg.id} className={`flex gap-4 ${isSequence ? 'mt-1' : 'mt-4'} ${isMe ? 'flex-row-reverse' : ''}`}>
                 
                 {/* Avatar (Only show if not sequence) */}
                 {!isSequence ? (
                    msg.user?.avatar ? (
                      <img src={msg.user.avatar} alt="" className="w-10 h-10 rounded-lg object-cover shadow-sm" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                        {msg.user?.name?.[0] || '?'}
                      </div>
                    )
                 ) : (
                    <div className="w-10" /> // Spacer
                 )}

                 <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isSequence && !isMe && (
                      <span className="text-xs text-gray-500 font-medium mb-1 ml-1">{msg.user?.name}</span>
                    )}
                    
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      isMe 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                 </div>
               </div>
             );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <form onSubmit={sendMessage} className="relative max-w-4xl mx-auto">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message #${activeChannel?.name}`}
              className="w-full pl-6 pr-14 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-gray-900 dark:text-white placeholder-gray-400 shadow-sm"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="absolute right-3 top-3 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-md"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}