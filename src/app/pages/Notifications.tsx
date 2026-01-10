import { useEffect, useState } from 'react';
import { Bell, Check, Clock, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  is_read: boolean;
  created_at: string;
}

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    
    if (data) setNotifications(data);
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    // 1. Update UI instantly
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    
    // 2. Update DB
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };

  const deleteNotification = async (id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
      await supabase.from('notifications').delete().eq('id', id);
  };

  // Helper to get icon based on type
  const getIcon = (type: string) => {
      switch(type) {
          case 'success': return <CheckCircle2 className="text-emerald-500" size={20} />;
          case 'warning': return <AlertCircle className="text-amber-500" size={20} />;
          default: return <Info className="text-indigo-500" size={20} />;
      }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-500">Stay updated with your team activity.</p>
        </div>
        <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
            <Bell size={18} />
            {notifications.filter(n => !n.is_read).length} Unread
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
            <p className="text-gray-500">Loading updates...</p>
        ) : notifications.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                <Bell className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">All caught up!</h3>
                <p className="text-gray-500">No new notifications for you.</p>
            </div>
        ) : (
            notifications.map((n) => (
                <div 
                    key={n.id} 
                    onClick={() => markAsRead(n.id)}
                    className={`group relative p-5 rounded-2xl border transition-all cursor-pointer ${
                        n.is_read 
                        ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-60' 
                        : 'bg-white dark:bg-gray-800 border-indigo-200 dark:border-indigo-800 shadow-sm hover:shadow-md'
                    }`}
                >
                    <div className="flex gap-4">
                        <div className={`mt-1 p-2 rounded-full ${n.is_read ? 'bg-gray-100 dark:bg-gray-800' : 'bg-indigo-50 dark:bg-indigo-900/20'}`}>
                            {getIcon(n.type)}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className={`font-semibold ${n.is_read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                    {n.title}
                                </h4>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock size={12} />
                                    {new Date(n.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{n.message}</p>
                        </div>
                        
                        <button 
                            onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                            className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete"
                        >
                            <span className="text-xs font-bold">✕</span>
                        </button>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
}