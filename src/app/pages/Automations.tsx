import { useState, useEffect } from 'react';
import {
  Zap,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Loader2,
  ArrowRight,
  Power,
  Shield,
  Play,
  CheckCircle2,
  Mail,
  Github,
  Slack,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { isSuperAdmin } from '../../lib/constants';
import { triggerHaptic } from '../../lib/haptics';
import { toast } from 'sonner';

interface AutomationRule {
  id: string;
  name?: string;
  title?: string;
  trigger_type?: string;
  trigger?: string;
  trigger_config?: Record<string, any>;
  action_type?: string;
  action?: string;
  action_config?: Record<string, any>;
  is_active?: boolean;
  status?: 'active' | 'paused' | string;
  platform?: string;
  last_run?: string | null;
  project_id?: string | null;
  created_at?: string;
}

export default function Automations() {
  const { user } = useAuth();
  const theme = useAccentTheme();

  const [automations, setAutomations] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState('task_created');
  const [actionType, setActionType] = useState('notify_team');
  const [platform, setPlatform] = useState('internal');

  const isAdmin = isSuperAdmin(user?.email, user?.role);

  // Helper getters to normalize both database schemas (name/title, trigger_type/trigger, is_active/status)
  const getRuleName = (r?: any): string => {
    if (!r) return 'Untitled Automation';
    if (typeof r.name === 'string' && r.name.trim()) return r.name;
    if (typeof r.title === 'string' && r.title.trim()) return r.title;
    return 'Untitled Automation';
  };

  const getRuleTrigger = (r?: any): string => {
    if (!r) return 'task_created';
    if (typeof r.trigger_type === 'string' && r.trigger_type.trim()) return r.trigger_type;
    if (typeof r.trigger === 'string' && r.trigger.trim()) return r.trigger;
    if (r.trigger && typeof r.trigger.type === 'string') return r.trigger.type;
    return 'task_created';
  };

  const getRuleAction = (r?: any): string => {
    if (!r) return 'notify_team';
    if (typeof r.action_type === 'string' && r.action_type.trim()) return r.action_type;
    if (typeof r.action === 'string' && r.action.trim()) return r.action;
    if (r.action && typeof r.action.type === 'string') return r.action.type;
    return 'notify_team';
  };

  const getRuleActive = (r?: any): boolean => {
    if (!r) return false;
    if (typeof r.is_active === 'boolean') return r.is_active;
    if (typeof r.status === 'string') return r.status === 'active';
    return false;
  };

  const fetchAutomations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('automations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error && error.code !== '42P01') throw error;
      setAutomations((data as AutomationRule[]) || []);
    } catch {
      toast.error('Failed to load automations');
    } finally {
      setLoading(false);
    }
  };

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
  }, []);

  const handleToggleActive = async (rule: AutomationRule) => {
    triggerHaptic('tap');
    const updatedStatus = !getRuleActive(rule);

    setAutomations((prev) =>
      prev.map((item) =>
        item.id === rule.id
          ? {
              ...item,
              is_active: updatedStatus,
              status: updatedStatus ? 'active' : 'paused',
            }
          : item
      )
    );

    try {
      // Try updating status and is_active
      const { error } = await supabase
        .from('automations')
        .update({
          status: updatedStatus ? 'active' : 'paused',
          ...(rule.is_active !== undefined ? { is_active: updatedStatus } : {}),
        })
        .eq('id', rule.id);

      if (error) {
        // Fallback: try status column only
        await supabase
          .from('automations')
          .update({ status: updatedStatus ? 'active' : 'paused' })
          .eq('id', rule.id);
      }
      toast.success(updatedStatus ? 'Automation enabled' : 'Automation paused');
    } catch {
      toast.error('Failed to update status');
      fetchAutomations();
    }
  };

  const handleRunNow = async (rule: AutomationRule) => {
    triggerHaptic('tap');
    setRunningId(rule.id);
    const nowIso = new Date().toISOString();
    const ruleTitle = getRuleName(rule);
    const triggerLabel = (getRuleTrigger(rule) || 'task_created').replace(/_/g, ' ');
    const actionLabel = (getRuleAction(rule) || 'notify_team').replace(/_/g, ' ');

    try {
      // 1. Update last_run timestamp
      await supabase
        .from('automations')
        .update({ last_run: nowIso })
        .eq('id', rule.id);

      // 2. Dispatch in-app notification
      if (user?.id) {
        await supabase.from('notifications').insert({
          user_id: user.id,
          title: `Automation Executed: ${ruleTitle}`,
          message: `Trigger "${triggerLabel}" dispatched "${actionLabel}" successfully.`,
          type: 'task',
          is_read: false,
        });
      }

      setAutomations((prev) =>
        prev.map((item) => (item.id === rule.id ? { ...item, last_run: nowIso } : item))
      );

      toast.success(`Executed "${ruleTitle}" successfully!`);
    } catch {
      toast.error('Failed to trigger automation simulation');
    } finally {
      setRunningId(null);
    }
  };

  const handleDelete = async (id: string) => {
    triggerHaptic('warning');
    try {
      const { error } = await supabase.from('automations').delete().eq('id', id);
      if (error) throw error;
      setAutomations((prev) => prev.filter((item) => item.id !== id));
      toast.success('Automation rule deleted');
    } catch {
      toast.error('Failed to delete automation rule');
    }
  };

  const handleCreateAutomation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    triggerHaptic('tap');

    try {
      // Standard schema insert (title, trigger, action, status, platform)
      const { data, error } = await supabase
        .from('automations')
        .insert({
          title: name.trim(),
          trigger: triggerType,
          action: actionType,
          status: 'active',
          platform: platform,
        })
        .select()
        .single();

      if (error) {
        // Fallback: newer schema with (name, trigger_type, action_type, is_active)
        const fallbackRes = await supabase
          .from('automations')
          .insert({
            name: name.trim(),
            trigger_type: triggerType,
            action_type: actionType,
            is_active: true,
            platform: platform,
            created_by: user?.id || null,
          })
          .select()
          .single();

        if (fallbackRes.error) throw error;
        setAutomations((prev) => [fallbackRes.data as AutomationRule, ...prev]);
      } else {
        setAutomations((prev) => [data as AutomationRule, ...prev]);
      }

      setShowCreateModal(false);
      setName('');
      toast.success('Automation created successfully');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create automation');
    } finally {
      setCreating(false);
    }
  };

  const getPlatformIcon = (plat?: string) => {
    switch (plat?.toLowerCase()) {
      case 'github':
        return <Github size={14} className="text-gray-900 dark:text-gray-100" />;
      case 'slack':
        return <Slack size={14} className="text-pink-500" />;
      case 'email':
        return <Mail size={14} className="text-blue-500" />;
      default:
        return <CheckCircle2 size={14} className="text-emerald-500" />;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Workspace Automations
            </h1>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                <Shield size={10} />
                admin mode
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Trigger webhooks, team updates, and pipeline actions automatically across project boards.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('tap');
            setShowCreateModal(true);
          }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white ${theme.btnPrimary} shadow-sm active:scale-95 transition-all cursor-pointer`}
        >
          <Plus size={15} />
          <span>New Automation</span>
        </button>
      </div>

      {/* Create Automation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles size={16} className={theme.textAccent} />
                Create Workflow Automation
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-xs cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAutomation} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Rule Name *
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Notify General channel when high priority task created"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white outline-none ${theme.ringAccent}`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Integration Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white outline-none ${theme.ringAccent} cursor-pointer`}
                >
                  <option value="internal">ProjectFlow Workspace</option>
                  <option value="github">GitHub</option>
                  <option value="slack">Slack</option>
                  <option value="email">Email Notification</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                    When this happens (IF)
                  </label>
                  <select
                    value={triggerType}
                    onChange={(e) => setTriggerType(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white outline-none ${theme.ringAccent} cursor-pointer`}
                  >
                    <option value="task_created">Task is created</option>
                    <option value="task_completed">Task is moved to done</option>
                    <option value="priority_escalated">Priority marked urgent</option>
                    <option value="sprint_started">Sprint cycle started</option>
                    <option value="code_pushed">Code committed or pushed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                    Then perform action (THEN)
                  </label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white outline-none ${theme.ringAccent} cursor-pointer`}
                  >
                    <option value="notify_team">Send message to team chat</option>
                    <option value="assign_lead">Assign to project owner</option>
                    <option value="webhook_post">Dispatch external webhook</option>
                    <option value="create_audit_log">Record audit event</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !name.trim()}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white ${theme.btnPrimary} flex items-center gap-2 shadow-sm disabled:opacity-40 cursor-pointer active:scale-95 transition-all`}
                >
                  {creating && <Loader2 size={13} className="animate-spin" />}
                  <span>Save Automation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rules List or Empty State */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center text-gray-400 gap-2">
          <Loader2 size={24} className={`animate-spin ${theme.textAccent}`} />
          <span className="text-xs">Loading automation rules...</span>
        </div>
      ) : automations.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111726]/40 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Zap size={22} />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">No automations configured</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
            Create automated rules to connect sprint status updates, team channel posts, and audit triggers.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {automations.map((rule) => {
            if (!rule) return null;
            const ruleTitle = getRuleName(rule);
            const triggerText = (getRuleTrigger(rule) || 'task_created').replace(/_/g, ' ');
            const actionText = (getRuleAction(rule) || 'notify_team').replace(/_/g, ' ');
            const isActive = getRuleActive(rule);
            const isRunning = runningId === rule.id;

            return (
              <div
                key={rule.id}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-gray-300 dark:hover:border-gray-700"
              >
                <div className="min-w-0 space-y-2 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shrink-0">
                      {getPlatformIcon(rule.platform)}
                    </div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {ruleTitle}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {isActive ? 'Active' : 'Paused'}
                    </span>
                    {rule.last_run && (
                      <span className="text-[10px] text-gray-400 flex items-center gap-1 font-mono">
                        <Clock size={10} />
                        last run: {new Date(rule.last_run).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Visual IF -> THEN Pipeline */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/80 px-2.5 py-1 rounded-xl border border-gray-200 dark:border-gray-700 font-mono text-xs">
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                        IF:
                      </span>
                      <span className="capitalize">{triggerText}</span>
                    </span>
                    <ArrowRight size={12} className="text-gray-400 shrink-0" />
                    <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/80 px-2.5 py-1 rounded-xl border border-gray-200 dark:border-gray-700 font-mono text-xs">
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                        THEN:
                      </span>
                      <span className="capitalize">{actionText}</span>
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
                  {/* Simulate / Run Trigger Button */}
                  <button
                    type="button"
                    onClick={() => handleRunNow(rule)}
                    disabled={isRunning}
                    className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    title="Simulate rule execution"
                  >
                    {isRunning ? (
                      <Loader2 size={13} className="animate-spin text-emerald-500" />
                    ) : (
                      <Play size={13} className="text-emerald-500 fill-emerald-500" />
                    )}
                    <span className="hidden sm:inline">Run</span>
                  </button>

                  {/* Enable / Pause Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(rule)}
                    className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isActive
                        ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                    title={isActive ? 'Pause automation' : 'Enable automation'}
                  >
                    <Power size={13} />
                    <span>{isActive ? 'Active' : 'Paused'}</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(rule.id)}
                    className="p-2 rounded-xl text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-transparent hover:border-rose-200 dark:hover:border-rose-800 transition-colors cursor-pointer"
                    title="Delete rule"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
