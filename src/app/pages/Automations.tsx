import { useState, useEffect } from 'react';
import { 
  Zap, Mail, Github, MoreVertical, 
  Clock, CheckCircle, AlertTriangle, Loader2, Slack 
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

// Define the platform icons
const PLATFORM_ICONS: Record<string, JSX.Element> = {
  internal: <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={20} />,
  slack: <Slack className="text-pink-600 dark:text-pink-400" size={20} />,
  github: <Github className="text-gray-900 dark:text-gray-100" size={20} />,
  email: <Mail className="text-blue-600 dark:text-blue-400" size={20} />,
  default: <AlertTriangle className="text-gray-600" size={20} />,
};

interface Automation {
  id: string;
  title: string;
  trigger: string;
  action: string;
  status: 'active' | 'paused';
  last_run: string | null;
  platform: string;
}

export default function Automations() {
  const { user } = useAuth();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAutomations = async () => {
    try {
      if (!user) return;
      setLoading(true);

      const { data, error } = await supabase
        .from('automations')
        .select('id, title, trigger, action, status, last_run, platform')
        .order('title');

      if (error) throw error;
      if (data) setAutomations(data as Automation[]);
    } catch (err: any) {
      console.error('Error fetching automations:', err);
      toast.error('Failed to load automations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();

    const channel = supabase
      .channel('automations_page_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'automations' }, () => {
        fetchAutomations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Handle toggling the Active/Paused switch
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';

    // Optimistically update UI
    setAutomations(prev =>
      prev.map(a => (a.id === id ? { ...a, status: newStatus as 'active' | 'paused' } : a))
    );

    try {
      const { error } = await supabase
        .from('automations')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(
        newStatus === 'active' 
          ? `Rule "${automations.find(a => a.id === id)?.title}" activated` 
          : `Rule "${automations.find(a => a.id === id)?.title}" paused`
      );
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update automation status');
      fetchAutomations(); // Rollback on error
    }
  };

  // Humanize "last run" timestamp
  const formatLastRun = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return Math.floor(seconds) + ' seconds ago';
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
          <Zap className="text-amber-500" size={28} /> Work Automations
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Define simple event-based rules to eliminate repetitive tasks.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-16">
          <Loader2 className="animate-spin text-indigo-600" size={36} />
        </div>
      ) : automations.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <Zap className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">No automations found</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
            Create your first workflow automation to streamline your team delivery.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {automations.map((a) => {
            const isActive = a.status === 'active';
            return (
              <div
                key={a.id}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500/50 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar (Icon, Toggle, Actions) */}
                  <div className="flex items-start justify-between gap-3 mb-6">
                    <div className="p-3.5 bg-gray-50 dark:bg-gray-900/40 rounded-2xl shrink-0">
                      {PLATFORM_ICONS[a.platform] || PLATFORM_ICONS.default}
                    </div>
                    
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {/* Active/Pause Toggle */}
                      <button
                        onClick={() => handleToggleStatus(a.id, a.status)}
                        className={`w-12 h-6.5 rounded-full p-1 flex transition-colors ${
                          isActive ? 'bg-indigo-600 justify-end' : 'bg-gray-200 dark:bg-gray-700 justify-start'
                        }`}
                      >
                        <div className="w-4.5 h-4.5 bg-white rounded-full shadow-md" />
                      </button>

                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-lg">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Rules */}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 mb-5">
                    {a.title}
                  </h3>

                  <div className="space-y-2.5 relative">
                    {/* Visual Vertical Connection */}
                    <div className="absolute left-3.5 top-8 bottom-4 w-px bg-gray-100 dark:bg-gray-700" />

                    {/* Trigger Block */}
                    <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700 rounded-xl p-3 flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">If</span>
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {a.trigger}
                      </p>
                    </div>

                    {/* Action Block */}
                    <div className="bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-900/40 rounded-xl p-3 flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Then</span>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate">
                        {a.action}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Metrics */}
                <div className="pt-5 mt-5 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-[11px] font-medium text-gray-400">
                  <div className={`flex items-center gap-1.5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                    {isActive ? 'Active' : 'Paused'}
                  </div>
                  <span>Last run: {formatLastRun(a.last_run)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}