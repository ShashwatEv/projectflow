import { useState, useEffect } from 'react';
import { ChatProvider } from './ChatContext';
import { ChatSidebar } from './components/ChatSidebar'; // Left: Channels
import { ChatMainArea } from './components/ChatMainArea'; // Middle: Chat
import { ChatInfo } from './components/ChatInfo'; // Right: Members
import { supabase } from '../../../lib/supabaseClient';
import { useOnlineUsers } from '../../../hooks/useOnlineUsers';

export default function ChatLayout() {
  const [isRightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const onlineUserIds = useOnlineUsers();

  // Fetch users for the Member List
  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from('users').select('*');
      if (data) setAllUsers(data);
    };
    fetchUsers();
  }, []);

  return (
    <ChatProvider>
      <div className="flex h-full w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
        
        {/* LEFT SIDEBAR (Fixed Width) */}
        <div className="w-64 flex-shrink-0 h-full border-r border-gray-200 dark:border-gray-800 bg-gray-900">
          <ChatSidebar />
        </div>

        {/* MIDDLE CHAT AREA (Flexible) */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          <ChatMainArea />
        </div>

        {/* RIGHT SIDEBAR (Collapsible Member List) */}
        {isRightSidebarOpen && (
          <div className="w-72 flex-shrink-0 h-full border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hidden lg:block">
             {/* We pass a mock channel object for now to satisfy the component */}
             <ChatInfo 
                channel={{ id: 'general', name: 'general', type: 'public', members: allUsers.map(u => ({...u, status: onlineUserIds.has(u.id) ? 'online' : 'offline'})) }}
                isOpen={true} 
                pinnedMessages={[]} 
             />
          </div>
        )}

      </div>
    </ChatProvider>
  );
}