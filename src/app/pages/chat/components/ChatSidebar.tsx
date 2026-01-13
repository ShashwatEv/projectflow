import { useState } from 'react';
import { Hash, Plus, User, Search } from 'lucide-react';
import { useChat } from '../ChatContext';
import { useAuth } from '../../../../context/AuthContext';

export function ChatSidebar() {
  const { channels, users, activeChannelId, setActiveChannelId, createChannel } = useChat();
  const { user: currentUser } = useAuth();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChannelName.trim()) {
      createChannel(newChannelName);
      setNewChannelName('');
      setIsCreating(false);
    }
  };

  // Helper to generate DM ID: "dm_minID_maxID" to ensure uniqueness
  const getDmId = (otherId: string) => {
    if (!currentUser) return '';
    const ids = [currentUser.id, otherId].sort();
    return `dm_${ids[0]}_${ids[1]}`;
  };

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full text-gray-300">
      
      {/* Header */}
      <div className="p-4 border-b border-gray-800 font-bold text-white tracking-wide">
        Team Workspace
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        
        {/* --- CHANNELS --- */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2 group">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-gray-300 transition-colors">Channels</h3>
            <button onClick={() => setIsCreating(!isCreating)} className="text-gray-500 hover:text-white transition-colors"><Plus size={14} /></button>
          </div>
          
          {isCreating && (
            <form onSubmit={handleCreate} className="mb-2 px-2">
                <input 
                  autoFocus 
                  value={newChannelName} 
                  onChange={e => setNewChannelName(e.target.value)} 
                  className="w-full text-sm bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white outline-none focus:border-indigo-500" 
                  placeholder="# name..." 
                />
            </form>
          )}

          <div className="space-y-0.5">
            {channels.map(c => (
              <button 
                key={c.id} 
                onClick={() => setActiveChannelId(c.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-all duration-200 ${
                  activeChannelId === c.id 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
                }`}
              >
                <Hash size={16} className={activeChannelId === c.id ? 'text-indigo-200' : 'opacity-50'} /> 
                <span className="truncate">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* --- DIRECT MESSAGES --- */}
        <div>
           <div className="flex items-center justify-between px-2 mb-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Direct Messages</h3>
           </div>
           <div className="space-y-0.5">
             {users.filter(u => u.id !== currentUser?.id).map(u => {
               const dmId = getDmId(u.id);
               const isActive = activeChannelId === dmId;
               return (
                 <button 
                    key={u.id} 
                    onClick={() => setActiveChannelId(dmId)}
                    className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-md transition-all duration-200 ${
                      isActive 
                        ? 'bg-gray-800 text-white' 
                        : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
                    }`}
                 >
                    <div className="relative">
                      <img src={u.avatar || "https://ui-avatars.com/api/?name=" + u.name} className="w-5 h-5 rounded-md bg-gray-700 object-cover" alt="" />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 border-2 border-gray-900 rounded-full bg-green-500`}></div>
                    </div>
                    <span className={`text-sm truncate ${isActive ? 'font-medium' : ''}`}>{u.name}</span>
                 </button>
               )
             })}
           </div>
        </div>
      </div>
    </div>
  );
}