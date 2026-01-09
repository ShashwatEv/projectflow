import { X } from 'lucide-react';
import { useChat } from '../ChatContext';
import { ChatInput } from './ChatInput';
import { useAuth } from '../../../../context/AuthContext';

export function ThreadSidebar() {
  const { activeThreadId, messages, threads, activeChannelId, closeThread, sendThreadMessage } = useChat();
  const { user } = useAuth();

  if (!activeThreadId) return null;

  // Find Parent Message
  const parentMessage = messages[activeChannelId]?.find(m => m.id === activeThreadId);
  const threadMessages = threads[activeThreadId] || [];

  if (!parentMessage) return null;

  return (
    <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col shadow-xl z-20">
      
      <div className="h-14 px-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
         <h3 className="font-bold text-gray-900 dark:text-white">Thread</h3>
         <button onClick={closeThread} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500"><X size={18} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
         {/* Parent Message */}
         <div className="flex gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
             <img src="https://i.pravatar.cc/150?u=1" className="w-8 h-8 rounded" alt="" />
             <div>
                 <div className="flex items-baseline gap-2">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">{parentMessage.senderId === 'me' ? 'You' : 'User'}</span>
                    <span className="text-xs text-gray-500">{parentMessage.timestamp}</span>
                 </div>
                 <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{parentMessage.text}</p>
             </div>
         </div>

         {/* Replies */}
         {threadMessages.map(msg => (
             <div key={msg.id} className="flex gap-3">
                <img src={msg.senderId === 'me' ? user?.avatar : "https://i.pravatar.cc/150?u=2"} className="w-8 h-8 rounded" alt="" />
                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="font-bold text-sm text-gray-900 dark:text-white">{msg.senderId === 'me' ? 'You' : 'User'}</span>
                        <span className="text-xs text-gray-500">{msg.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{msg.text}</p>
                </div>
             </div>
         ))}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
         <ChatInput onSendMessage={(text) => sendThreadMessage(activeThreadId, text)} placeholder="Reply..." replyingTo={null} onCancelReply={() => {}} />
      </div>
    </div>
  );
}