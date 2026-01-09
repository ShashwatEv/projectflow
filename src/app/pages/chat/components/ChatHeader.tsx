import { Hash, Phone, Video, Info, Menu } from 'lucide-react';
import { Channel } from '../chatConfig';

interface ChatHeaderProps {
  channel?: Channel;
  isInfoOpen: boolean;
  onToggleInfo: () => void;
  onOpenSidebar: () => void;
  onCall: () => void; // NEW
}

export function ChatHeader({ channel, isInfoOpen, onToggleInfo, onOpenSidebar, onCall }: ChatHeaderProps) {
  return (
    <div className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10">
      <div className="flex items-center gap-3">
        <button className="md:hidden text-gray-500" onClick={onOpenSidebar}><Menu size={24} /></button>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Hash size={18} className="text-gray-400" />
            <h2 className="font-bold text-gray-900 dark:text-white text-lg">{channel?.name}</h2>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 text-gray-400">
        <button onClick={onCall} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"><Phone size={20} /></button>
        <button onClick={onCall} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><Video size={20} /></button>
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
        <button onClick={onToggleInfo} className={`p-2 rounded-lg transition-colors ${isInfoOpen ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
          <Info size={20} />
        </button>
      </div>
    </div>
  );
}