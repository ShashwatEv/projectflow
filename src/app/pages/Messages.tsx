import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom'; // <--- Import this
import { Send, FileText, Download } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useTyping } from '../../hooks/useTyping';
import TypingIndicator from '../components/TypingIndicator';
import ChatFileButton from '../components/ChatFileButton';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  file_url?: string;
  file_type?: string;
  user?: { name: string; avatar: string };
}

export default function Messages() {
  const { user } = useAuth();
  const { roomId } = useParams(); // <--- Get dynamic ID
  const currentRoomId = roomId || 'room_1'; // Default if missing
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 1. Dynamic Typing Hook
  const { typingUsers, broadcastTyping } = useTyping(currentRoomId);

  useEffect(() => {
    setMessages([]); // Clear previous messages when room changes
    fetchMessages();

    // 2. Real-time Subscription for Dynamic Room
    const channel = supabase
      .channel(`chat_${currentRoomId}`) // Unique channel name
      .on(
        'postgres_changes',
        { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages', 
            filter: `room_id=eq.${currentRoomId}` // Dynamic Filter
        },
        async (payload) => {
          const { data: userData } = await supabase
            .from('users')
            .select('name, avatar')
            .eq('id', payload.new.user_id)
            .single();

          const newMsg = { ...payload.new, user: userData } as Message;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentRoomId]); // <--- Re-run when roomId changes!

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*, user:users(name, avatar)')
      .eq('room_id', currentRoomId) // Dynamic Query
      .order('created_at', { ascending: true });

    if (data) setMessages(data);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const { error } = await supabase.from('messages').insert({
      room_id: currentRoomId, // Dynamic Insert
      user_id: user.id,
      content: newMessage,
    });

    if (error) console.error(error);
    setNewMessage('');
  };

  const handleFileUpload = async (url: string, type: string) => {
    if (!user) return;

    const { error } = await supabase.from('messages').insert({
      room_id: currentRoomId, // Dynamic Insert
      user_id: user.id,
      content: type === 'image' ? 'Shared an image' : 'Shared a file',
      file_url: url,
      file_type: type
    });

    if (error) console.error(error);
  };

  // Helper: Format Room Name for Header
  const getRoomName = () => {
      if (currentRoomId === 'room_1') return '# general';
      return 'Private Conversation';
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">{getRoomName()}</h1>
          <p className="text-xs text-gray-500">
             {currentRoomId === 'room_1' ? 'Team announcements and chat.' : 'End-to-end encrypted.'}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50 dark:bg-gray-900">
        {messages.map((msg, index) => {
          const isMe = msg.user_id === user?.id;
          const showHeader = index === 0 || messages[index - 1].user_id !== msg.user_id;

          return (
            <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 flex-shrink-0">
                {showHeader && !isMe && (
                   <img 
                     src={msg.user?.avatar || `https://ui-avatars.com/api/?name=${msg.user?.name}`} 
                     className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700" 
                     alt="avatar" 
                   />
                )}
              </div>

              <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                {showHeader && (
                    <span className="text-xs text-gray-500 ml-1 mb-1">{msg.user?.name}</span>
                )}
                
                <div className={`p-3 rounded-2xl shadow-sm ${
                    isMe 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-none'
                }`}>
                    {msg.file_url && (
                        <div className="mb-2">
                            {msg.file_type === 'image' ? (
                                <a href={msg.file_url} target="_blank" rel="noreferrer">
                                    <img 
                                        src={msg.file_url} 
                                        alt="attachment" 
                                        className="max-w-xs rounded-lg border border-black/10 dark:border-white/10 hover:opacity-90 transition-opacity" 
                                        loading="lazy"
                                    />
                                </a>
                            ) : (
                                <a 
                                    href={msg.file_url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                        isMe ? 'bg-indigo-700 hover:bg-indigo-800' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <FileText size={20} />
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-medium">Attachment</p>
                                        <p className="text-xs opacity-70">Click to download</p>
                                    </div>
                                    <Download size={16} className="opacity-70" />
                                </a>
                            )}
                        </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
                
                <span className="text-[10px] text-gray-400 mt-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="h-6 mb-2">
             <TypingIndicator users={typingUsers} />
        </div>

        <form onSubmit={sendMessage} className="flex gap-3 items-end max-w-4xl mx-auto">
          <ChatFileButton onUploadComplete={handleFileUpload} />
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={() => broadcastTyping()}
              placeholder={`Message ${getRoomName()}...`}
              className="w-full pl-4 pr-12 py-3 bg-gray-100 dark:bg-gray-900 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white transition-all"
            />
            <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-0 transition-all shadow-sm"
            >
                <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}