import { useState } from 'react';
import { Bell, Check, MessageSquare, AtSign, Info, Filter, Trash2 } from 'lucide-react';

export default function Notifications() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'mentions'>('all');
  
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'mention', user: 'Sarah Chen', text: 'mentioned you in', target: 'Website Redesign', time: '2 mins ago', unread: true },
    { id: 2, type: 'reply', user: 'Alex Morgan', text: 'replied to your comment on', target: 'Mobile App V2', time: '1 hour ago', unread: true },
    { id: 3, type: 'system', user: 'System', text: 'Deployment successful:', target: 'Production Server', time: '3 hours ago', unread: false },
    { id: 4, type: 'mention', user: 'Mike Ross', text: 'assigned you to', target: 'API Integration', time: 'Yesterday', unread: false },
  ]);

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return n.unread;
    if (filter === 'mentions') return n.type === 'mention';
    return true;
  });

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
             Notifications 
             {notifications.some(n => n.unread) && (
               <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{notifications.filter(n => n.unread).length}</span>
             )}
           </h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm">Stay updated with your team activity.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setFilter('all')} className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${filter === 'all' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>All</button>
            <button onClick={() => setFilter('unread')} className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${filter === 'unread' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>Unread</button>
            <button onClick={() => setFilter('mentions')} className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${filter === 'mentions' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>Mentions</button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2"></div>
            <button onClick={markAllRead} className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400" title="Mark all read"><Check size={20} /></button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
               <Bell size={48} className="mb-4 opacity-20" />
               <p>No notifications found</p>
            </div>
          ) : (
            filtered.map((n) => (
              <div key={n.id} className={`p-4 border-b border-gray-100 dark:border-gray-800 flex gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group ${n.unread ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                  <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      n.type === 'mention' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                      n.type === 'system' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                  }`}>
                      {n.type === 'mention' ? <AtSign size={18} /> : n.type === 'system' ? <Info size={18} /> : <MessageSquare size={18} />}
                  </div>
                  
                  <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                          <span className="font-bold">{n.user}</span> {n.text} <span className="font-medium text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">{n.target}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{n.time}</p>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {n.unread && (
                          <button onClick={() => setNotifications(notifications.map(i => i.id === n.id ? { ...i, unread: false } : i))} className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg" title="Mark read">
                              <Check size={16} />
                          </button>
                      )}
                      <button onClick={() => deleteNotification(n.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete">
                          <Trash2 size={16} />
                      </button>
                  </div>
                  
                  {n.unread && <div className="w-2 h-2 bg-indigo-600 rounded-full self-center"></div>}
              </div>
            ))
          )}
      </div>
    </div>
  );
}