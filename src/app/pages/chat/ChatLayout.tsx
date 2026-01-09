import { ChatProvider } from './ChatContext';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatMainArea } from './components/ChatMainArea';
import { ThreadSidebar } from './components/ThreadSidebar';

export default function ChatLayout() {
  return (
    <ChatProvider>
      <div className="flex h-full overflow-hidden bg-white dark:bg-gray-900">
        <ChatSidebar />
        <ChatMainArea />
        <ThreadSidebar />
      </div>
    </ChatProvider>
  );
}