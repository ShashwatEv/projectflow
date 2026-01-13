import { useState, useEffect } from 'react';
import { ChatProvider } from './ChatContext';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatMainArea } from './components/ChatMainArea';
import { ChatInfo } from './components/ChatInfo'; 
import { supabase } from '../../../lib/supabaseClient';
import { useOnlineUsers } from '../../../hooks/useOnlineUsers';

export default function ChatLayout() {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const onlineUserIds = useOnlineUsers();

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from('users').select('*');
      if (data) setAllUsers(data);
    };
    fetchUsers();
  }, []);

  return (
    <ChatProvider>
      {/* Main Container - added 'fixed' to ensure it takes full viewport if needed */}
      <div className="flex h-[calc(100vh-4rem)] w-full bg-gray-900 overflow-hidden">
        
        {/* LEFT SIDEBAR - Forced Width & Border */}
        <div className="w-64 min-w-[16rem] h-full border-r border-gray-800 bg-gray-900 flex-shrink-0">
          <ChatSidebar />
        </div>

        {/* MIDDLE CHAT AREA - Grows to fill space */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative bg-gray-50 dark:bg-gray-900">
          <ChatMainArea />
        </div>

        {/* RIGHT SIDEBAR - Hidden on small screens */}
        <div className="w-72 min-w-[18rem] h-full border-l border-gray-800 bg-gray-900 hidden xl:block flex-shrink-0">
             <ChatInfo 
                channel={{ id: 'general', name: 'general', type: 'public', members: allUsers.map(u => ({...u, status: onlineUserIds.has(u.id) ? 'online' : 'offline'})) }}
                isOpen={true} 
                pinnedMessages={[]} 
             />
        </div>

      </div>
    </ChatProvider>
  );
}