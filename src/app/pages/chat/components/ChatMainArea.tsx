import { useEffect, useRef } from 'react';
import { Hash, Loader2 } from 'lucide-react';
import { useChat } from '../ChatContext';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';

export function ChatMainArea() {
  const { 
    activeChannelId, activeChannelName, messages, 
    sendMessage, broadcastTyping, typingUsers, isLoadingHistory 
  } = useChat();
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeChannelId, typingUsers]);

  const channelMessages = messages[activeChannelId] || [];

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900">
      
      {/* Header */}
      <div className="h-16 px-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0 bg-white dark:bg-gray-900 shadow-sm z-10">
         <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-lg">
            {activeChannelId.includes('dm_') ? (
               <span className="text-gray-400">@</span>
            ) : (
               <Hash size={20} className="text-gray-400" />
            )}
            {activeChannelName}
         </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-gray-50 dark:bg-gray-900/50"
      >
         {isLoadingHistory ? (
           <div className="flex justify-center py-10">
             <Loader2 size={32} className="animate-spin text-indigo-500" />
           </div>
         ) : channelMessages.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Hash size={32} />
              </div>
              <p className="text-lg font-medium">Welcome to #{activeChannelName}!</p>
              <p className="text-sm">This is the start of something new.</p>
           </div>
         ) : (
           <MessageList messages={channelMessages} onReply={() => {}} />
         )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
         {typingUsers.length > 0 && (
            <div className="px-2 pb-2 text-xs text-gray-500 dark:text-gray-400 italic animate-pulse flex items-center gap-1">
               <span className="font-bold">{typingUsers.join(', ')}</span> is typing...
            </div>
         )}

         {/* FIX: Handle null vs undefined mismatch here */}
         <ChatInput 
            onSendMessage={(text, file) => sendMessage(text, file || undefined)} 
            onTyping={(isTyping) => broadcastTyping(isTyping)}
            placeholder={`Message ${activeChannelId.includes('dm_') ? '@' : '#'}${activeChannelName}`}
         />
      </div>
    </div>
  );
}