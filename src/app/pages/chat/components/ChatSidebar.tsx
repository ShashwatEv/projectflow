import { useState } from 'react';
import { Hash, Plus, Circle, Search, MoreVertical, X } from 'lucide-react';
import { useChat } from '../ChatContext';
import { useAuth } from '../../../../context/AuthContext';

export function ChatSidebar() {
  const { channels, users, activeChannelId, setActiveChannelId, createChannel, currentUserStatus, setStatus } = useChat();
  const { user } = useAuth();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [isStatusMenuOpen, setStatusMenuOpen] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChannelName.trim()) {
      createChannel(newChannelName);
      setNewChannelName('');
      setIsCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-emerald-500';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full">
      
      {/* --- CURRENT USER STATUS --- */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <button 
            onClick={() => setStatusMenuOpen(!isStatusMenuOpen)}
            className="flex items-center gap-3 w-full hover:bg-gray-200 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
          >
             <div className="relative">
                <img src={user?.avatar || "https://github.com/shadcn.png"} className="w-10 h-10 rounded-lg" alt="" />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-gray-50 dark:border-gray-900 rounded-full ${getStatusColor(currentUserStatus)}`}></div>
             </div>
             <div className="text-left flex-1">
                <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{user?.name || 'You'}</p>
                <p className="text-xs text-gray-500 capitalize">{currentUserStatus}</p>
             </div>
          </button>

          {/* Status Dropdown */}
          {isStatusMenuOpen && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
               {['online', 'busy', 'away', 'offline'].map((s) => (
                 <button key={s} onClick={() => { setStatus(s as any); setStatusMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 capitalize text-gray-700 dark:text-gray-200">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(s)}`}></div> {s}
                 </button>
               ))}
            </div>
          )}
        </div>
      </div>

      {/* --- CHANNELS LIST --- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2 px-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Channels</h3>
            <button onClick={() => setIsCreating(true)} className="text-gray-400 hover:text-indigo-500"><Plus size={16} /></button>
          </div>
          
          {isCreating && (
            <form onSubmit={handleCreate} className="mb-2 px-2">
                <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-indigo-500 rounded p-1">
                    <input autoFocus value={newChannelName} onChange={e => setNewChannelName(e.target.value)} className="w-full text-sm outline-none bg-transparent dark:text-white" placeholder="channel-name" />
                    <button type="button" onClick={() => setIsCreating(false)}><X size={14} /></button>
                </div>
            </form>
          )}

          <div className="space-y-0.5">
            {channels.map(c => (
              <button 
                key={c.id} 
                onClick={() => setActiveChannelId(c.id)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${activeChannelId === c.id ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                <Hash size={16} className="opacity-50" /> {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* --- USERS LIST --- */}
        <div>
           <div className="flex items-center justify-between mb-2 px-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Direct Messages</h3>
           </div>
           {users.map(u => (
             <button key={u.id} className="w-full flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div className="relative">
                  <img src={u.avatar} className="w-6 h-6 rounded-md" alt="" />
                  <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-white dark:border-gray-900 rounded-full ${getStatusColor(u.status)}`}></div>
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{u.name}</span>
             </button>
           ))}
        </div>
      </div>
    </div>
  );
}