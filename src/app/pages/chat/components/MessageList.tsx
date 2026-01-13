import { useRef, useEffect } from 'react';
import { Download, FileText, Reply, MessageSquare, Plus } from 'lucide-react';
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

  const getUser = (id: string) => {
    if (id === currentUser?.id) return { name: currentUser?.name || 'You', avatar: currentUser?.avatar };
    return users.find(u => u.id === id) || { name: 'Unknown', avatar: 'https://ui-avatars.com/api/?name=?' };
  };

  // Helper: Format Date for Separators
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex-1 space-y-2 pb-4">
      {messages.map((msg, index) => {
        const sender = getUser(msg.senderId);
        const isMe = msg.senderId === currentUser?.id;
        
        // --- LOGIC FOR GROUPING ---
        const prevMsg = messages[index - 1];
        
        // 1. Should we show a Date Separator?
        const showDateSeparator = !prevMsg || 
            new Date(msg.created_at).toDateString() !== new Date(prevMsg.created_at).toDateString();

        // 2. Is this message part of a group? (Same user, less than 5 mins apart)
        const isSequence = prevMsg && 
            prevMsg.senderId === msg.senderId && 
            !showDateSeparator &&
            (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() < 5 * 60 * 1000);

        return (
            <div key={msg.id}>
                
                {/* DATE SEPARATOR */}
                {showDateSeparator && (
                    <div className="flex items-center justify-center my-6">
                        <div className="h-px bg-gray-200 dark:bg-gray-800 w-full max-w-[100px] sm:max-w-xs"></div>
                        <span className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            {formatDate(msg.created_at)}
                        </span>
                        <div className="h-px bg-gray-200 dark:bg-gray-800 w-full max-w-[100px] sm:max-w-xs"></div>
                    </div>
                )}

                <div className={`flex gap-3 group px-2 py-0.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors -mx-2 rounded-lg ${isSequence ? 'mt-0.5' : 'mt-4'}`}>
                
                    {/* AVATAR COLUMN */}
                    <div className="w-10 flex-shrink-0 flex flex-col items-end">
                        {!isSequence ? (
                            <img src={sender.avatar} alt={sender.name} className="w-9 h-9 rounded-lg object-cover shadow-sm bg-gray-200" />
                        ) : (
                            // Show timestamp on hover for grouped messages
                            <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1.5 w-full text-right pr-1">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </span>
                        )}
                    </div>

                    {/* CONTENT COLUMN */}
                    <div className="flex-1 min-w-0">
                        
                        {/* Header (Name & Time) - Only show if not sequence */}
                        {!isSequence && (
                            <div className="flex items-baseline gap-2 mb-0.5">
                                <span className="text-sm font-bold text-gray-900 dark:text-white cursor-pointer hover:underline">
                                    {sender.name}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        )}

                        {/* The Message Text */}
                        <div className="relative inline-block max-w-full">
                            <p className={`text-[15px] leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap ${!isSequence ? 'mt-0' : ''}`}>
                                {msg.text}
                            </p>
                            
                            {/* Attachments */}
                            {msg.attachments && msg.attachments.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {msg.attachments.map(att => (
                                        <div key={att.id} className="group/att flex items-center gap-3 p-2 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 max-w-xs cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                                            {att.type === 'image' ? (
                                                <img src={att.url} alt="attachment" className="w-10 h-10 rounded-lg object-cover bg-white" />
                                            ) : (
                                                <div className="p-2 bg-white dark:bg-gray-700 rounded-lg"><FileText size={20} className="text-indigo-500" /></div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate dark:text-gray-200">{att.name}</p>
                                                <p className="text-[10px] text-gray-400">{(att.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                            <button className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-full text-gray-500 hover:text-indigo-600 transition-colors">
                                                <Download size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Reactions Display (The "Pills") */}
                            {msg.reactions && msg.reactions.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {msg.reactions.map((reaction, i) => (
                                        <button 
                                            key={i}
                                            className={`
                                                flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium border transition-all
                                                ${reaction.userReacted 
                                                    ? 'bg-indigo-50 dark:bg-indigo-500/20 border-indigo-200 dark:border-indigo-500/50 text-indigo-600 dark:text-indigo-300' 
                                                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }
                                            `}
                                        >
                                            <span>{reaction.emoji}</span>
                                            <span>{reaction.count}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Floating Action Menu (Visible on Hover) */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-start -mt-2">
                        <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                            <button className="p-1.5 text-gray-400 hover:text-yellow-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" title="Add Reaction">
                                <Plus size={14} />
                            </button>
                            <button onClick={() => onReply(msg)} className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" title="Reply">
                                <Reply size={14} />
                            </button>
                            <button onClick={() => openThread(msg.id)} className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" title="Start Thread">
                                <MessageSquare size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
      })}
    </div>
  );
}