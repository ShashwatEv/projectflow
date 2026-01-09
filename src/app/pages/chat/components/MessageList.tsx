import { useRef, useEffect } from 'react';
import { Trash2, Edit2, Download, FileText, Pin, SmilePlus, Reply, MessageSquare } from 'lucide-react';
import { Message } from '../types';
import { useChat } from '../ChatContext';
import { useAuth } from '../../../../context/AuthContext';

interface MessageListProps {
  messages: Message[];
  onReply: (msg: Message) => void;
}

export function MessageList({ messages, onReply }: MessageListProps) {
  const { users, openThread } = useChat();
  const { user: currentUser } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Helper to find user details
  const getUser = (id: string) => {
    if (id === 'me') return { name: currentUser?.name || 'You', avatar: currentUser?.avatar };
    return users.find(u => u.id === id) || { name: 'Unknown', avatar: '' };
  };

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth">
      {messages.map((msg) => {
        const sender = getUser(msg.senderId);
        const isMe = msg.senderId === 'me';
        
        return (
            <div key={msg.id} className={`flex gap-4 group ${isMe ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            
            <div className="shrink-0">
                <img src={sender.avatar} alt={sender.name} className="w-9 h-9 rounded-lg object-cover shadow-sm bg-gray-200 dark:bg-gray-700" />
            </div>

            <div className={`max-w-[85%] sm:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline gap-2 mb-1 px-1">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{sender.name}</span>
                  <span className="text-[10px] text-gray-400">{msg.timestamp}</span>
                </div>

                <div className="relative">
                    {/* Message Bubble */}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm relative group-hover:shadow-md transition-shadow ${isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-sm'}`}>
                        {msg.text}

                        {/* Attachments */}
                        {msg.attachments?.map(att => (
                        <div key={att.id} className="mt-3 flex items-center gap-3 p-2 bg-black/10 dark:bg-white/10 rounded-lg border border-white/10 backdrop-blur-sm overflow-hidden">
                            {att.type === 'image' ? (
                                <img src={att.url} alt="attachment" className="w-10 h-10 rounded-md object-cover" />
                            ) : (
                                <div className="p-2 bg-white/20 rounded-md"><FileText size={20} /></div>
                            )}
                            <div className="flex-1 min-w-0"><p className="text-xs font-medium truncate">{att.name}</p></div>
                            <button className="p-1 hover:bg-black/20 rounded"><Download size={14} /></button>
                        </div>
                        ))}
                    </div>

                    {/* Actions Menu */}
                    <div className={`absolute -top-3 ${isMe ? 'right-0 -mr-2' : 'left-0 -ml-2'} opacity-0 group-hover:opacity-100 flex items-center gap-0.5 bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 rounded-lg p-0.5 transition-opacity z-10 scale-90`}>
                        <button onClick={() => onReply(msg)} className="p-1.5 text-gray-400 hover:text-indigo-500 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Reply">
                            <Reply size={14} />
                        </button>
                        <button onClick={() => openThread(msg.id)} className="p-1.5 text-gray-400 hover:text-indigo-500 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Start Thread">
                            <MessageSquare size={14} />
                        </button>
                    </div>
                    
                    {/* Thread Link */}
                    {msg.replyCount ? (
                        <div onClick={() => openThread(msg.id)} className="mt-1 flex items-center gap-2 cursor-pointer opacity-80 hover:opacity-100 transition-opacity">
                            <div className="flex -space-x-1">
                                <div className="w-4 h-4 bg-gray-200 rounded-full border border-white"></div>
                                <div className="w-4 h-4 bg-gray-300 rounded-full border border-white"></div>
                            </div>
                            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">{msg.replyCount} replies</span>
                        </div>
                    ) : null}

                </div>
            </div>
            </div>
        );
      })}
    </div>
  );
}