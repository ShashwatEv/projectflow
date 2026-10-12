import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sparkles,
  Loader2,
  Calendar,
  X,
  Pause,
  Play,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { triggerHaptic } from '../../lib/haptics';
import { toast } from 'sonner';

interface StandupTask {
  id: string;
  title: string;
  priority: string;
  status: string;
  project?: { name: string } | null;
}

export default function DailyStandupStories() {
  const { user } = useAuth();
  const theme = useAccentTheme();
  const navigate = useNavigate();

  const [activeStory, setActiveStory] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);

  const [deliveredTasks, setDeliveredTasks] = useState<StandupTask[]>([]);
  const [blockerTasks, setBlockerTasks] = useState<StandupTask[]>([]);

  const [yesterdayText, setYesterdayText] = useState('');
  const [todayText, setTodayText] = useState('');
  const [blockersText, setBlockersText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const totalStories = 4;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchStandupFeed() {
      setLoading(true);
      try {
        const { data: doneData } = await supabase
          .from('tasks')
          .select('id, title, priority, status, project:projects(name)')
          .eq('status', 'done')
          .order('created_at', { ascending: false })
          .limit(5);

        const { data: alertData } = await supabase
          .from('tasks')
          .select('id, title, priority, status, project:projects(name)')
          .in('priority', ['urgent', 'high'])
          .neq('status', 'done')
          .order('created_at', { ascending: false })
          .limit(5);

        const format = (list: any[]): StandupTask[] =>
          (list || []).map((item) => ({
            id: item.id,
            title: item.title,
            priority: item.priority || 'medium',
            status: item.status || 'todo',
            project: Array.isArray(item.project) ? item.project[0] || null : item.project || null,
          }));

        setDeliveredTasks(format(doneData || []));
        setBlockerTasks(format(alertData || []));
      } catch {
        toast.error('Failed to load standup telemetry');
      } finally {
        setLoading(false);
      }
    }

    fetchStandupFeed();
  }, []);

  useEffect(() => {
    if (loading || isPaused || activeStory === 3) return;

    timerRef.current = setTimeout(() => {
      setActiveStory((prev) => (prev < totalStories - 1 ? prev + 1 : prev));
    }, 6000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeStory, isPaused, loading]);

  const handleNext = () => {
    triggerHaptic('tap');
    if (activeStory < totalStories - 1) {
      setActiveStory((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    triggerHaptic('tap');
    if (activeStory > 0) {
      setActiveStory((prev) => prev - 1);
    }
  };

  const handlePublishStandup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!yesterdayText.trim() && !todayText.trim())) return;

    setSubmitting(true);
    triggerHaptic('tap');

    const formattedContent = [
      `Daily Standup Update • ${user.name || 'Team Member'}`,
      `Yesterday: ${yesterdayText.trim() || 'Wrapped pending tasks'}`,
      `Today: ${todayText.trim() || 'Continuing sprint deliverables'}`,
      `Blockers: ${blockersText.trim() || 'None'}`,
    ].join('\n');

    try {
      const { error } = await supabase.from('messages').insert({
        room_id: 'room_1',
        user_id: user.id,
        content: formattedContent,
      });

      if (error) throw error;

      triggerHaptic('success');
      toast.success('Standup posted to team channel');
      navigate('/messages/room_1');
    } catch {
      triggerHaptic('error');
      toast.error('Failed to post standup');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#080b12] text-gray-900 dark:text-white p-4 select-none overflow-hidden relative transition-colors duration-200">
      {/* top progress indicators */}
      <div className="flex items-center gap-1.5 pt-1 pb-3 shrink-0">
        {Array.from({ length: totalStories }).map((_, idx) => (
          <div
            key={idx}
            className="flex-1 h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden relative"
          >
            <div
              className={`h-full ${theme.progressBar} rounded-full transition-all ${
                idx < activeStory
                  ? 'w-full'
                  : idx === activeStory && !isPaused && activeStory !== 3
                  ? 'w-full transition-[width] duration-[6000ms] ease-linear'
                  : idx === activeStory
                  ? 'w-full'
                  : 'w-0'
              }`}
            />
          </div>
        ))}
      </div>

      {/* header controls */}
      <div className="flex items-center justify-between pb-3 shrink-0">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('tap');
            navigate('/tasks');
          }}
          className="p-2 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-xs transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-gray-600 dark:text-gray-400 bg-white dark:bg-white/5 px-2.5 py-1 rounded-full border border-gray-200 dark:border-white/5 shadow-xs">
            Story {activeStory + 1} of {totalStories}
          </span>
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-xs transition-colors"
          >
            {isPaused ? <Play size={13} /> : <Pause size={13} />}
          </button>
        </div>
      </div>

      {/* story card stage */}
      <div className="flex-1 flex flex-col justify-between py-2 relative overflow-hidden">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
            <Loader2 size={24} className={`animate-spin ${theme.textAccent}`} />
            <span className="text-xs">Compiling daily standup feed...</span>
          </div>
        ) : (
          <>
            {/* story 1: sprint velocity summary */}
            {activeStory === 0 && (
              <div className="flex-1 flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-[#101626] border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-2xl animate-in fade-in duration-200">
                <div>
                  <div className={`flex items-center gap-2 ${theme.textAccent} text-xs font-bold uppercase tracking-wider mb-2`}>
                    <Sparkles size={16} />
                    <span>Sprint Pulse</span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
                    Workspace Overview
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    Automated standup report aggregating workspace deployments, sprint completions, and attention items over the last 24 hours.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 py-6">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#090d18] border border-gray-100 dark:border-white/5 flex flex-col justify-between">
                    <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">Shipped</span>
                    <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                      {deliveredTasks.length}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">Completed items</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#090d18] border border-gray-100 dark:border-white/5 flex flex-col justify-between">
                    <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">Blockers</span>
                    <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">
                      {blockerTasks.length}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">Urgent items</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 flex items-center justify-between text-xs text-gray-700 dark:text-gray-300 font-mono">
                  <span>Sync Cycle</span>
                  <span className={`${theme.textAccent} font-bold`}>Today</span>
                </div>
              </div>
            )}

            {/* story 2: completed sprint deliverables */}
            {activeStory === 1 && (
              <div className="flex-1 flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-[#101626] border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-2xl animate-in fade-in duration-200">
                <div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <CheckCircle2 size={16} />
                    <span>Sprint Deliveries</span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
                    Shipped Items
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Tasks marked done across active repository boards.
                  </p>
                </div>

                <div className="space-y-2.5 my-auto">
                  {deliveredTasks.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 text-center text-xs text-gray-400">
                      No delivered cards recorded in this cycle.
                    </div>
                  ) : (
                    deliveredTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#090d18] border border-gray-200 dark:border-white/5 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{t.title}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                            {t.project?.name ?? 'Assigned deliverable'}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                          Done
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono text-center">
                  Telemetry verified
                </span>
              </div>
            )}

            {/* story 3: critical blockers */}
            {activeStory === 2 && (
              <div className="flex-1 flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-[#101626] border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-2xl animate-in fade-in duration-200">
                <div>
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <AlertTriangle size={16} />
                    <span>Attention Needed</span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
                    High Priority Items
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Issues flagged as urgent or high priority requiring review.
                  </p>
                </div>

                <div className="space-y-2.5 my-auto">
                  {blockerTasks.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 text-center text-xs text-gray-400">
                      Zero high priority blockers flagged. Clean sprint velocity.
                    </div>
                  ) : (
                    blockerTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#090d18] border border-gray-200 dark:border-white/5 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{t.title}</p>
                          <p className="text-[10px] text-rose-600 dark:text-rose-400 font-mono mt-0.5 uppercase font-bold">
                            {t.priority} priority
                          </p>
                        </div>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono shrink-0">
                          {t.project?.name ?? 'Backlog'}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono text-center">
                  Review queue
                </span>
              </div>
            )}

            {/* story 4: interactive async submission */}
            {activeStory === 3 && (
              <div className="flex-1 flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-[#101626] border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-2xl overflow-y-auto custom-scrollbar animate-in fade-in duration-200">
                <div>
                  <div className={`flex items-center gap-2 ${theme.textAccent} text-xs font-bold uppercase tracking-wider mb-1`}>
                    <Calendar size={16} />
                    <span>Async Standup</span>
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                    Share Your Update
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Publish your 3 point status directly into the general team chat.
                  </p>
                </div>

                <form onSubmit={handlePublishStandup} className="space-y-3 my-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                      Shipped yesterday
                    </label>
                    <input
                      type="text"
                      value={yesterdayText}
                      onChange={(e) => setYesterdayText(e.target.value)}
                      placeholder="e.g. Fixed navigation drawer bug"
                      className={`w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#080b12] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white outline-none ${theme.ringAccent}`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                      Shipping today
                    </label>
                    <input
                      type="text"
                      value={todayText}
                      onChange={(e) => setTodayText(e.target.value)}
                      placeholder="e.g. Completing Supabase migration"
                      className={`w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#080b12] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white outline-none ${theme.ringAccent}`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                      Blockers
                    </label>
                    <input
                      type="text"
                      value={blockersText}
                      onChange={(e) => setBlockersText(e.target.value)}
                      placeholder="e.g. None or waiting on review"
                      className={`w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#080b12] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white outline-none ${theme.ringAccent}`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || (!yesterdayText.trim() && !todayText.trim())}
                    className={`w-full py-3 rounded-2xl ${theme.btnPrimary} text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-40`}
                  >
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    <span>Post Update to General</span>
                  </button>
                </form>

                <span className="text-[10px] text-gray-400 dark:text-gray-500 text-center block">
                  Broadcasts to team channel
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* bottom navigation bar */}
      <div className="flex items-center justify-between pt-2 shrink-0">
        <button
          type="button"
          onClick={handlePrev}
          disabled={activeStory === 0}
          className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-20 active:scale-95 transition-transform shadow-xs"
        >
          <ChevronLeft size={14} />
          <span>Previous</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={activeStory === totalStories - 1}
          className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-20 active:scale-95 transition-transform shadow-xs"
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}