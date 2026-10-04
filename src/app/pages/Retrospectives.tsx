import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Plus, ThumbsUp, MessageSquare, 
  Clock, CheckCircle2, AlertTriangle, 
  Loader2, Send, Trash2, Target, 
  BarChart3, RefreshCw, Lock, ShieldCheck, ArrowRight
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const SUPER_ADMIN_EMAIL = 'shashwatop69@gmail.com';

interface RetroItem {
  id: string;
  retrospective_id?: string;
  user_id: string;
  column_type: 'went_well' | 'to_improve' | 'action_item';
  content: string;
  upvotes: number;
  created_at: string;
  user?: {
    name: string;
    avatar: string;
  };
}

interface ProductivityStats {
  completedTasks: number;
  totalHoursLogged: number;
  highPriorityCleared: number;
  velocityScore: number;
}

export default function Retrospectives() {
  const navigate = useNavigate();
  const theme = useAccentTheme();
  const { user } = useAuth();

  const isSuperAdmin = user?.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase();
  const isVerified = Boolean(user?.is_verified || isSuperAdmin);
  const is2FaEnabled = Boolean(user?.is_2fa_enabled || isSuperAdmin);
  const canAccessVelocity = isVerified && is2FaEnabled;

  const [items, setItems] = useState<RetroItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProductivityStats>({
    completedTasks: 0,
    totalHoursLogged: 0,
    highPriorityCleared: 0,
    velocityScore: 0,
  });

  const [activeColumn, setActiveColumn] = useState<'went_well' | 'to_improve' | 'action_item' | null>(null);
  const [newContent, setNewContent] = useState('');
  const [submittingCard, setSubmittingCard] = useState(false);

  const fetchRetroData = async () => {
    try {
      const { data: retroData } = await supabase
        .from('retrospective_items')
        .select('*, user:users(name, avatar)')
        .order('upvotes', { ascending: false });

      if (retroData) {
        setItems(retroData as RetroItem[]);
      }

      const [tasksRes, timesheetsRes] = await Promise.all([
        supabase.from('tasks').select('*'),
        supabase.from('timesheets').select('*'),
      ]);

      const tasks = tasksRes.data || [];
      const timesheets = timesheetsRes.data || [];

      const doneTasks = tasks.filter((t: any) => t.status === 'done');
      const urgentDone = doneTasks.filter((t: any) => t.priority === 'high' || t.priority === 'urgent');
      const totalHours = timesheets.reduce((acc: number, curr: any) => acc + (Number(curr.hours) || 0), 0);
      const velocity = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0;

      setStats({
        completedTasks: doneTasks.length,
        totalHoursLogged: Math.round(totalHours * 10) / 10,
        highPriorityCleared: urgentDone.length,
        velocityScore: velocity,
      });
    } catch (err) {
      console.error('Error fetching retrospective board:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRetroData();

    const channel = supabase
      .channel('retro_board_realtime_stream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'retrospective_items' }, () => fetchRetroData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timesheets' }, () => fetchRetroData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => fetchRetroData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddItem = async (col: 'went_well' | 'to_improve' | 'action_item') => {
    if (!newContent.trim() || !user) return;
    setSubmittingCard(true);

    try {
      const { error } = await supabase.from('retrospective_items').insert({
        column_type: col,
        content: newContent.trim(),
        user_id: user.id,
        upvotes: 0,
      });

      if (error) throw error;

      setNewContent('');
      setActiveColumn(null);
      toast.success('Retrospective note shared with team!');
      fetchRetroData();
    } catch {
      toast.error('Failed to publish note');
    } finally {
      setSubmittingCard(false);
    }
  };

  const handleUpvote = async (item: RetroItem) => {
    const nextVotes = item.upvotes + 1;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, upvotes: nextVotes } : i)));

    try {
      const { error } = await supabase
        .from('retrospective_items')
        .update({ upvotes: nextVotes })
        .eq('id', item.id);

      if (error) throw error;
    } catch {
      fetchRetroData();
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase.from('retrospective_items').delete().eq('id', id);
      if (error) throw error;
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success('Retrospective note removed');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const columns = [
    {
      key: 'went_well',
      title: 'What Went Well',
      tag: 'Wins & Velocity',
      color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
      badge: 'bg-emerald-500/20 text-emerald-400',
    },
    {
      key: 'to_improve',
      title: 'What Could Be Improved',
      tag: 'Friction & Blockers',
      color: 'border-amber-500/30 bg-amber-500/10 text-amber-500',
      badge: 'bg-amber-500/20 text-amber-400',
    },
    {
      key: 'action_item',
      title: 'Action Items & Next Steps',
      tag: 'Commitments',
      color: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-500',
      badge: 'bg-indigo-500/20 text-indigo-400',
    },
  ] as const;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-2xl ${theme.bgSubtle} ${theme.textAccent} border ${theme.borderAccent}/30 shadow-sm`}>
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Team Retrospectives
              </h1>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Reflect on current sprint outcomes, vote on operational blockers, and assign action items.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation to Advanced Velocity Suite */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (canAccessVelocity) {
                navigate('/retrospectives/velocity');
              } else {
                toast.error('Identity Verification & 2FA Required', {
                  description: 'Detailed code cadence and GitHub telemetry require a verified account and active 2FA.',
                  action: {
                    label: 'Settings',
                    onClick: () => navigate('/settings'),
                  },
                });
              }
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl ${
              canAccessVelocity 
                ? `${theme.btnPrimary} text-white shadow-md` 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
            } font-bold text-xs transition-all active:scale-95`}
          >
            {canAccessVelocity ? <BarChart3 size={15} /> : <Lock size={14} />}
            <span>Team Velocity & GitHub Telemetry</span>
            <ArrowRight size={13} className="ml-0.5" />
          </button>

          <button
            onClick={fetchRetroData}
            title="Refresh"
            className="p-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-[#161b22] dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 transition-colors shadow-xs"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Beginner Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#161b22] p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Tasks Completed</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.completedTasks} items</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#161b22] p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Hours Logged</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.totalHoursLogged} hrs</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#161b22] p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500">
            <Target size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Sprint Throughput</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.velocityScore}%</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#161b22] p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">High-Priority Cleared</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.highPriorityCleared} resolved</p>
          </div>
        </div>
      </div>

      {/* Retrospective 3-Column Board */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 space-y-3">
          <Loader2 className={`animate-spin ${theme.textAccent}`} size={32} />
          <p className="text-xs text-gray-400">Loading team retrospective board...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {columns.map((col) => {
            const colItems = items.filter((i) => i.column_type === col.key);

            return (
              <div
                key={col.key}
                className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800/80 mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-xl border ${col.color}`}>
                        <MessageSquare size={14} />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
                          {col.title}
                        </h3>
                        <p className="text-[10px] text-gray-400">{col.tag}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg ${col.badge}`}>
                      {colItems.length}
                    </span>
                  </div>

                  {activeColumn === col.key ? (
                    <div className="mb-4 bg-gray-50 dark:bg-[#0d1117] p-3 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2 animate-in fade-in">
                      <textarea
                        autoFocus
                        rows={2}
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder={`Add ${col.title.toLowerCase()} note...`}
                        className="w-full bg-transparent text-xs text-gray-900 dark:text-white outline-none resize-none"
                      />
                      <div className="flex justify-end gap-2 pt-1 border-t border-gray-200 dark:border-gray-800">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveColumn(null);
                            setNewContent('');
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-gray-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={submittingCard || !newContent.trim()}
                          onClick={() => handleAddItem(col.key)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-xl ${theme.btnPrimary} font-bold text-[11px] text-white disabled:opacity-50 transition-all`}
                        >
                          {submittingCard ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveColumn(col.key);
                        setNewContent('');
                      }}
                      className="w-full mb-4 py-2 px-3 border border-dashed border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 rounded-2xl text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus size={14} />
                      <span>Add Note</span>
                    </button>
                  )}

                  <div className="space-y-3">
                    {colItems.length === 0 ? (
                      <div className="text-center py-10 text-gray-400 text-xs italic">
                        No notes posted in this section yet.
                      </div>
                    ) : (
                      colItems.map((item) => (
                        <div
                          key={item.id}
                          className="bg-gray-50 dark:bg-[#0d1117] border border-gray-200/90 dark:border-gray-800/90 rounded-2xl p-4 space-y-3 hover:border-gray-300 dark:hover:border-gray-700 transition-all group"
                        >
                          <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed font-sans">
                            {item.content}
                          </p>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 dark:border-gray-800/60">
                            <div className="flex items-center gap-2">
                              <img
                                src={item.user?.avatar || '/pfp.jpg'}
                                alt=""
                                className="w-5 h-5 rounded-full object-cover border border-gray-300 dark:border-gray-700"
                              />
                              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 truncate max-w-[100px]">
                                {item.user?.name || 'Teammate'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {user?.id === item.user_id && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-1 text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Delete note"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleUpvote(item)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 transition-colors active:scale-95 shadow-xs"
                                title="Upvote note"
                              >
                                <ThumbsUp size={12} className={theme.textAccent} />
                                <span>{item.upvotes}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}