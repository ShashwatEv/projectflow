import { Pin } from 'lucide-react';
import { Channel, Message } from '../chatConfig';

export function ChatInfo({ channel, isOpen, pinnedMessages }: { channel?: Channel; isOpen: boolean; pinnedMessages: Message[] }) {
  if (!isOpen || !channel) return null;

  return (
    <div className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h3 className="font-bold text-gray-900 dark:text-white mb-1">About #{channel.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{channel.description || 'No description set.'}</p>
      </div>

      {/* Pinned Messages */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
        <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
           <Pin size={14} /> Pinned Messages ({pinnedMessages.length})
        </h4>
        <div className="space-y-3">
           {pinnedMessages.length === 0 ? (
               <p className="text-sm text-gray-400 italic">No pinned messages yet.</p>
           ) : (
               pinnedMessages.map(msg => (
                   <div key={msg.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm text-sm">
                       <div className="flex items-center gap-2 mb-1">
                           <img src={msg.avatar} className="w-4 h-4 rounded-full" alt="" />
                           <span className="font-bold text-xs">{msg.sender}</span>
                           <span className="text-[10px] text-gray-400 ml-auto">{msg.time}</span>
                       </div>
                       <p className="text-gray-600 dark:text-gray-300 line-clamp-2">{msg.text}</p>
                   </div>
               ))
           )}
        </div>
      </div>

      {/* Members */}
      <div className="p-6">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Members ({channel.members?.length || 0})</h4>
        <div className="space-y-3">
          {channel.members?.map((m, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="relative">
                <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-lg object-cover bg-gray-200" />
                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900 ${m.status === 'online' ? 'bg-emerald-500' : m.status === 'busy' ? 'bg-red-500' : 'bg-gray-400'}`}></div>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{m.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}