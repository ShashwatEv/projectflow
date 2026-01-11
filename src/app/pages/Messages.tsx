import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useTyping } from '../../hooks/useTyping';
import TypingIndicator from '../components/TypingIndicator';
import ChatFileButton from '../components/ChatFileButton';
import MessageBubble from '../components/MessageBubble';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  file_url?: string;
  file_type?: string;
  is_edited?: boolean;
  user?: { name: string; avatar: string };
  message_reactions?: { id: string; emoji: string; user_id: string }[]; // <--- Nested reactions
}

export default function Messages() {
  const { user } = useAuth();
  const { roomId } = useParams(); 
  const currentRoomId = roomId || 'room_1';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { typingUsers, broadcastTyping } = useTyping(currentRoomId);

  useEffect(() => {
    setMessages([]); 
    fetchMessages();

    // Subscribe to Messages AND Reactions
    const channel = supabase
      .channel(`chat_${currentRoomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `room_id=eq.${currentRoomId}` }, 
        (payload) => handleMessageChange(payload)
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'message_reactions' }, 
        () => fetchMessages() // Simplest way: refresh messages to get updated reactions count
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentRoomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, typingUsers]); // Scroll only on new message count

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
      .select('*, user:users(name, avatar), message_reactions(*)') // <--- Fetch reactions too
      .eq('room_id', currentRoomId)
      .order('created_at', { ascending: true });

    if (data) setMessages(data);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    const { error } = await supabase.from('messages').insert({
      room_id: currentRoomId,
      user_id: user.id,
      content: newMessage,
    });
    if (!error) setNewMessage('');
  };

  const handleFileUpload = async (url: string, type: string) => {
    if (!user) return;
    await supabase.from('messages').insert({
      room_id: currentRoomId,
      user_id: user.id,
      content: type === 'image' ? 'Shared an image' : 'Shared a file',
      file_url: url,
      file_type: type
    });
  };

  const handleEdit = async (id: string, newContent: string) => {
    await supabase.from('messages').update({ content: newContent, is_edited: true }).eq('id', id);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('messages').delete().eq('id', id);
  };

  // 4. Reaction Logic: Toggle (Add if missing, remove if exists)
  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    // Check if I already reacted with this emoji
    const { data: existing } = await supabase
      .from('message_reactions')
      .select('id')
      .eq('message_id', messageId)
      .eq('user_id', user.id)
      .eq('emoji', emoji)
      .single();

    if (existing) {
      // If exists, remove it (Toggle off)
      await supabase.from('message_reactions').delete().eq('id', existing.id);
    } else {
      // If not, add it (Toggle on)
      await supabase.from('message_reactions').insert({
        message_id: messageId,
        user_id: user.id,
        emoji: emoji
      });
    }
  };

  const getRoomName = () => currentRoomId === 'room_1' ? '# general' : 'Private Conversation';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex justify-between items-center z-10">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">{getRoomName()}</h1>
          <p className="text-xs text-gray-500">Real-time collaboration.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50 dark:bg-gray-900">
        {messages.map((msg, index) => {
          const isMe = msg.user_id === user?.id;
          const showHeader = index === 0 || messages[index - 1].user_id !== msg.user_id;

          return (
            <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="w-8 flex-shrink-0 flex flex-col justify-end">
                {showHeader && !isMe && (
                   <img src={msg.user?.avatar || `https://ui-avatars.com/api/?name=${msg.user?.name}`} className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm" alt="avatar" />
                )}
              </div>

              <div className={`flex flex-col w-full ${isMe ? 'items-end' : 'items-start'}`}>
                {showHeader && !isMe && <span className="text-xs text-gray-500 ml-1 mb-1">{msg.user?.name}</span>}
                
                <MessageBubble 
                  message={msg} 
                  isMe={isMe} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete}
                  onReact={handleReaction} // <--- Pass the handler
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

      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="h-6 mb-2"><TypingIndicator users={typingUsers} /></div>
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
            <button type="submit" disabled={!newMessage.trim()} className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-0 transition-all shadow-sm">
                <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}