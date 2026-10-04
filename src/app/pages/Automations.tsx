import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, Mail, Github, MoreVertical, Clock, CheckCircle, 
  AlertTriangle, Loader2, Slack, Plus, Play, Trash2, X, Lock
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { toast } from 'sonner';

const SUPER_ADMIN_EMAIL = 'shashwatop69@gmail.com';

const PLATFORM_ICONS: Record<string, JSX.Element> = {
  internal: <CheckCircle className="text-emerald-500" size={20} />,
  slack: <Slack className="text-pink-500" size={20} />,
  github: <Github className="text-gray-900 dark:text-gray-100" size={20} />,
  email: <Mail className="text-blue-500" size={20} />,
  default: <AlertTriangle className="text-amber-500" size={20} />,
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useAccentTheme();

  const isSuperAdmin = user?.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL;
  const isVerified = Boolean(user?.is_verified || isSuperAdmin);
  
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // New Automation Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTrigger, setNewTrigger] = useState('');
  const [newAction, setNewAction] = useState('');
  const [newPlatform, setNewPlatform] = useState('internal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch Automations
  const fetchAutomations = async () => {
    try {
      const { data, error } = await supabase
        .from('automations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error && error.code !== '42P01') throw error;
      if (data) setAutomations(data as Automation[]);
    } catch (err: any) {
      console.error('Error fetching automations:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Real-time Subscription
  useEffect(() => {
    fetchAutomations();

    const channel = supabase
      .channel('automations_live_stream')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'automations' },
        () => {
          fetchAutomations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Gate check helper
  const checkVerifiedAction = (actionDesc: string): boolean => {
    if (!isVerified) {
      toast.error('Identity Verification Required', {
        description: `Please verify your email address to ${actionDesc}.`,
        action: {
          label: 'Verify Now',
          onClick: () => navigate('/settings'),
        },
      });
      return false;
    }
    return true;
  };

  // 3. Toggle Status (Active / Paused)
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    if (!checkVerifiedAction('toggle automation states')) return;

    const newStatus = currentStatus === 'active' ? 'paused' : 'active';

    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus as 'active' | 'paused' } : a))
    );

    try {
      const { error } = await supabase
        .from('automations')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(newStatus === 'active' ? 'Automation activated' : 'Automation paused');
    } catch (err: any) {
      toast.error('Failed to update status');
      fetchAutomations();
    }
  };

  // 4. Manually Run Automation (Simulate Execution)
  const handleRunNow = async (automation: Automation) => {
    if (!checkVerifiedAction('trigger automation workflows')) return;

    setRunningId(automation.id);
    const nowIso = new Date().toISOString();

    try {
      const { error } = await supabase
        .from('automations')
        .update({ last_run: nowIso })
        .eq('id', automation.id);

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: user?.id,
        title: `Automation Executed: ${automation.title}`,
        message: `Condition "${automation.trigger}" fired -> "${automation.action}" completed successfully.`,
        type: 'task',
        is_read: false
      });

      setAutomations((prev) =>
        prev.map((a) => (a.id === automation.id ? { ...a, last_run: nowIso } : a))
      );
      toast.success(`Executed "${automation.title}"!`);
    } catch (err: any) {
      toast.error('Failed to execute automation');
    } finally {
      setRunningId(null);
    }
  };

  // 5. Delete Automation
  const handleDelete = async (id: string) => {
    if (!checkVerifiedAction('delete automation rules')) return;

    try {
      const { error } = await supabase.from('automations').delete().eq('id', id);
      if (error) throw error;

      setAutomations((prev) => prev.filter((a) => a.id !== id));
      toast.success('Automation deleted');
    } catch (err: any) {
      toast.error('Failed to delete automation');
    } finally {
      setOpenMenuId(null);
    }
  };

  // 6. Create New Automation Rule
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkVerifiedAction('publish new automation webhooks')) return;
    if (!newTitle.trim() || !newTrigger.trim() || !newAction.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: newTitle.trim(),
        trigger: newTrigger.trim(),
        action: newAction.trim(),
        platform: newPlatform,
        status: 'active',
        user_id: user?.id,
      };

      const { data, error } = await supabase
        .from('automations')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      toast.success('Automation created successfully!');
      setIsModalOpen(false);
      setNewTitle('');
      setNewTrigger('');
      setNewAction('');
      setNewPlatform('internal');
      if (data) setAutomations((prev) => [data as Automation, ...prev]);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create automation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatLastRun = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className={`p-2 rounded-2xl ${theme.bgSubtle} ${theme.textAccent} border ${theme.borderAccent}/30 shadow-sm`}>
              <Zap size={24} />
            </div>
            <span>Work Automations</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
            Define simple event-based rules to streamline delivery and eliminate repetitive tasks.
          </p>
        </div>

        <button
          onClick={() => {
            if (checkVerifiedAction('create new automations')) {
              setIsModalOpen(true);
            }
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl ${theme.btnPrimary} font-bold text-xs shadow-md transition-all active:scale-95`}
        >
          <Plus size={16} />
          <span>New Automation</span>
          {!isVerified && <Lock size={12} className="opacity-75 ml-0.5" />}
        </button>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 space-y-3">
          <Loader2 className={`animate-spin ${theme.textAccent}`} size={32} />
          <p className="text-xs text-gray-500 dark:text-gray-400">Loading automation rules...</p>
        </div>
      ) : automations.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#161b22] rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 shadow-sm">
          <Zap className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">No automations found</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
            Create your first workflow automation to streamline tasks and notifications.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {automations.map((a) => {
            const isActive = a.status === 'active';
            const isMenuOpen = openMenuId === a.id;

            return (
              <div
                key={a.id}
                className="bg-white dark:bg-[#161b22] rounded-3xl p-6 border border-gray-200 dark:border-gray-800/90 hover:border-gray-300 dark:hover:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="p-3.5 bg-gray-50 dark:bg-[#0d1117] border border-gray-100 dark:border-gray-800 rounded-2xl shrink-0">
                      {PLATFORM_ICONS[a.platform] || PLATFORM_ICONS.default}
                    </div>
                    
                    <div className="flex items-center gap-2 relative">
                      {/* Active/Pause Switch */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isActive}
                        onClick={() => handleToggleStatus(a.id, a.status)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isActive ? theme.toggleActive : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            isActive ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>

                      {/* Dropdown Menu Toggle */}
                      <div className="relative">
                        <button 
                          onClick={() => setOpenMenuId(isMenuOpen ? null : a.id)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-lg transition-colors"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-0 top-8 w-36 bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-20 py-1 text-xs animate-in fade-in zoom-in-95">
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                handleRunNow(a);
                              }}
                              className="w-full px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                            >
                              <Play size={13} className="text-emerald-500" /> Run Trigger
                            </button>
                            <button
                              onClick={() => handleDelete(a.id)}
                              className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 border-t border-gray-100 dark:border-gray-800"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1 mb-4">
                    {a.title}
                  </h3>

                  {/* Flow Sequence */}
                  <div className="space-y-2.5 relative">
                    <div className="absolute left-3.5 top-8 bottom-4 w-px bg-gray-200 dark:bg-gray-800" />

                    {/* Trigger Block */}
                    <div className="bg-gray-50 dark:bg-[#0d1117] border border-gray-100 dark:border-gray-800 rounded-2xl p-3 flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">If</span>
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {a.trigger}
                      </p>
                    </div>

                    {/* Action Block */}
                    <div className={`bg-white dark:bg-[#161b22] border rounded-2xl p-3 flex items-center gap-3 ${theme.borderAccent}/30 shadow-sm`}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.textAccent}`}>Then</span>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate">
                        {a.action}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Metrics & Run Trigger Button */}
                <div className="pt-5 mt-5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] font-medium text-gray-400">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1.5 ${isActive ? 'text-emerald-500' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                      <span>{isActive ? 'Active' : 'Paused'}</span>
                    </div>
                    <span>•</span>
                    <span>{formatLastRun(a.last_run)}</span>
                  </div>

                  <button
                    onClick={() => handleRunNow(a)}
                    disabled={runningId === a.id}
                    title={isVerified ? "Simulate trigger execution" : "Verification required to run triggers"}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#0d1117] dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white shadow-sm transition-all active:scale-95 disabled:opacity-50"
                  >
                    {runningId === a.id ? (
                      <Loader2 size={13} className="animate-spin text-emerald-500" />
                    ) : (
                      <Play size={13} className="fill-current text-gray-600 dark:text-gray-300" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Automation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-md p-6 md:p-7 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create Work Automation</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Set up an event listener to run automatic workspace tasks.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Rule Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Notify Slack on Deployment"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={`w-full bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white outline-none ${theme.ringAccent}`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Integration Platform</label>
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white outline-none cursor-pointer"
                >
                  <option value="internal">ProjectFlow Workspace</option>
                  <option value="github">GitHub</option>
                  <option value="slack">Slack</option>
                  <option value="email">Email Notification</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">IF (Trigger condition) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Code pushed to branch"
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  className={`w-full bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white outline-none ${theme.ringAccent}`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">THEN (Action to perform) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broadcast update to workspace team"
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className={`w-full bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white outline-none ${theme.ringAccent}`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newTitle.trim()}
                  className={`px-5 py-2 rounded-xl ${theme.btnPrimary} font-bold text-xs disabled:opacity-50 flex items-center gap-1.5 transition-all shadow-md active:scale-95`}
                >
                  {isSubmitting && <Loader2 size={13} className="animate-spin" />}
                  <span>Save Automation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}