import { useState, useRef, useEffect } from 'react';
import { Search, Hash, Loader2 } from 'lucide-react';
import { useChat } from '../ChatContext';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';

export function ChatMainArea() {
  const { 
    activeChannelId, messages, searchQuery, setSearchQuery, 
    sendMessage, broadcastTyping, typingUsers, 
    loadMoreMessages, hasMoreMessages, isLoadingHistory 
  } = useChat();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);

  // --- INFINITE SCROLL LOGIC ---
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // 1. Detect Scroll to Top (Load More)
    if (scrollTop === 0 && hasMoreMessages && !isLoadingHistory) {
      const oldHeight = scrollHeight;
      loadMoreMessages().then(() => {
        // Adjust scroll position to maintain view
        if (scrollRef.current) {
           scrollRef.current.scrollTop = scrollRef.current.scrollHeight - oldHeight;
        }
      });
    }

    // 2. Detect if near bottom (Enable Auto-Scroll)
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsAutoScroll(isNearBottom);
  };

  // Auto-scroll to bottom on new messages (if user was already at bottom)
  useEffect(() => {
    if (isAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeChannelId, isAutoScroll]);

  // Filter logic
  const channelMessages = messages[activeChannelId] || [];
  const filteredMessages = channelMessages.filter(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col h-full relative">
      
      {/* Header */}
      <div className="h-16 px-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0">
         <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-lg">
            <Hash size={20} className="text-gray-400" />
            {activeChannelId}
         </div>
         <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm outline-none w-64" />
         </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef} 
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
         {/* Loading Spinner at Top */}
         {isLoadingHistory && (
           <div className="flex justify-center py-2">
             <Loader2 size={20} className="animate-spin text-indigo-500" />
           </div>
         )}

         <MessageList messages={filteredMessages} onReply={() => {}} />
      </div>

      {/* Footer Area: Typing & Input */}
      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
         
         {/* Typing Indicator */}
         {typingUsers.length > 0 && (
            <div className="px-2 pb-2 text-xs text-gray-500 dark:text-gray-400 italic animate-pulse flex items-center gap-1">
               <span className="font-bold">{typingUsers.join(', ')}</span> is typing...
            </div>
         )}

         <ChatInput 
            onSendMessage={(text, att) => sendMessage(text, att ? new File([], att.name) : undefined)} // Note: You'll need to adapt ChatInput to pass the raw File object up
            onTyping={(isTyping) => broadcastTyping(isTyping)} // New prop needed in ChatInput
            placeholder={`Message #${activeChannelId}`}
         />
      </div>
    </div>
  );
}