import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  RotateCcw,
  Clock,
  FolderKanban,
  Flame,
  Calendar,
  Sparkles,
  Inbox,
  ArrowRight,
  ArrowUp,
  Loader2,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { triggerHaptic } from '../../lib/haptics';
import { toast } from 'sonner';

interface TriageTask {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  project?: { name: string } | null;
  created_at?: string;
  due_date?: string;
}

export default function MobileTriageDeck() {
  const { user } = useAuth();
  const theme = useAccentTheme();
  const navigate = useNavigate();

  const [deck, setDeck] = useState<TriageTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [exitingDirection, setExitingDirection] = useState<'left' | 'right' | 'up' | null>(null);

  const touchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const fetchTriagePool = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, description, priority, created_at, due_date, project:projects(name)')
        .neq('status', 'done')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formatted: TriageTask[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        priority: item.priority || 'medium',
        created_at: item.created_at,
        due_date: item.due_date,
        project: Array.isArray(item.project) ? item.project[0] || null : item.project || null,
      }));

      setDeck(formatted);
    } catch {
      toast.error('Failed to load triage cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTriagePool();
  }, []);

  const handleAction = async (task: TriageTask, direction: 'left' | 'right' | 'up') => {
    setExitingDirection(direction);
    triggerHaptic(direction === 'right' ? 'success' : direction === 'up' ? 'tap' : 'warning');

    setTimeout(async () => {
      setDeck((prev) => prev.filter((t) => t.id !== task.id));
      setDragOffset({ x: 0, y: 0 });
      setExitingDirection(null);

      try {
        if (direction === 'right') {
          await supabase
            .from('tasks')
            .update({ assigned_to: user?.id, status: 'inProgress' })
            .eq('id', task.id);
          toast.success('Claimed to In Progress');
        } else if (direction === 'left') {
          await supabase
            .from('tasks')
            .update({ status: 'todo' })
            .eq('id', task.id);
          toast.info('Deferred to backlog');
        } else if (direction === 'up') {
          await supabase
            .from('tasks')
            .update({ status: 'done' })
            .eq('id', task.id);
          toast.success('Marked done');
        }
      } catch {
        toast.error('Failed to update task state');
      }
    }, 220);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch || deck.length === 0) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    if (!touch) return;

    const diffX = touch.clientX - touchStartRef.current.x;
    const diffY = touch.clientY - touchStartRef.current.y;
    setDragOffset({ x: diffX, y: diffY });

    if (Math.abs(diffX) > 90 || diffY < -80) {
      triggerHaptic('tap');
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || deck.length === 0) return;
    setIsDragging(false);

    const activeTask = deck[0];
    if (!activeTask) return;

    if (dragOffset.x > 110) {
      handleAction(activeTask, 'right');
    } else if (dragOffset.x < -110) {
      handleAction(activeTask, 'left');
    } else if (dragOffset.y < -95 && Math.abs(dragOffset.x) < 70) {
      handleAction(activeTask, 'up');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const activeTask = deck[0];
  const nextTask = deck[1];

  const getRotation = () => {
    return dragOffset.x * 0.08;
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'urgent':
      case 'high':
        return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30';
      case 'medium':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30';
      default:
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#080c14] text-gray-900 dark:text-white p-4 select-none touch-none overflow-hidden transition-colors duration-200">
      {/* top app bar */}
      <div className="flex items-center justify-between pt-1 pb-3 shrink-0">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('tap');
            navigate('/tasks');
          }}
          className="p-2 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-xs transition-colors"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300">
          <Sparkles size={14} className={theme.textAccent} />
          <span>Sprint Triage Deck</span>
        </div>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('tap');
            fetchTriagePool();
          }}
          className="p-2 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-xs transition-colors"
          title="Refresh deck"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* gesture hint instructions */}
      <div className="flex items-center justify-around py-2 px-3 rounded-2xl bg-white dark:bg-[#111726] border border-gray-200 dark:border-white/5 text-[10px] font-mono text-gray-600 dark:text-gray-400 shadow-xs shrink-0">
        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
          <ArrowLeft size={12} /> Left: Defer
        </span>
        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
          <ArrowUp size={12} /> Up: Done
        </span>
        <span className={`flex items-center gap-1 ${theme.textAccent} font-semibold`}>
          Right: Claim <ArrowRight size={12} />
        </span>
      </div>

      {/* card deck container */}
      <div className="flex-1 flex items-center justify-center relative my-3">
        {loading ? (
          <div className="flex flex-col items-center gap-2 text-gray-400 text-xs">
            <Loader2 size={24} className={`animate-spin ${theme.textAccent}`} />
            <span>Loading triage deck...</span>
          </div>
        ) : !activeTask ? (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 dark:text-gray-500 shadow-xs">
              <Inbox size={26} />
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-200">Inbox Zero Reached</h3>
            <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
              All pending tasks in the current batch have been triaged.
            </p>
            <button
              type="button"
              onClick={fetchTriagePool}
              className={`px-4 py-2 ${theme.btnPrimary} text-white rounded-xl text-xs font-bold shadow-md`}
            >
              Reload Queue
            </button>
          </div>
        ) : (
          <div className="relative w-full max-w-sm h-[400px]">
            {/* background secondary card */}
            {nextTask && (
              <div className="absolute inset-0 bg-gray-100 dark:bg-[#121828] border border-gray-200 dark:border-white/5 rounded-3xl p-5 shadow-sm scale-95 translate-y-3 opacity-60 pointer-events-none flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Next in line
                  </span>
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
                    {nextTask.title}
                  </h4>
                </div>
                <div className="text-[11px] text-gray-400 dark:text-gray-500 font-mono">
                  {nextTask.project?.name ?? 'Inbox'}
                </div>
              </div>
            )}

            {/* active interactive swipe card */}
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{
                transform: exitingDirection
                  ? exitingDirection === 'right'
                    ? 'translateX(400px) rotate(24deg)'
                    : exitingDirection === 'left'
                    ? 'translateX(-400px) rotate(-24deg)'
                    : 'translateY(-400px)'
                  : `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${getRotation()}deg)`,
                transition: isDragging ? 'none' : 'transform 0.22s ease-out',
              }}
              className="absolute inset-0 bg-white dark:bg-[#161d30] border border-gray-200/90 dark:border-white/10 rounded-3xl p-6 shadow-xl dark:shadow-2xl flex flex-col justify-between cursor-grab active:cursor-grabbing overflow-hidden transition-colors"
            >
              {/* action indicator badges */}
              {dragOffset.x > 45 && (
                <div className={`absolute top-5 right-5 ${theme.btnPrimary} text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-lg animate-in fade-in`}>
                  Claim
                </div>
              )}
              {dragOffset.x < -45 && (
                <div className="absolute top-5 left-5 bg-amber-500 text-slate-950 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-lg animate-in fade-in">
                  Defer
                </div>
              )}
              {dragOffset.y < -45 && Math.abs(dragOffset.x) < 40 && (
                <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-lg animate-in fade-in">
                  Complete
                </div>
              )}

              {/* card header */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getPriorityBadge(
                      activeTask.priority
                    )}`}
                  >
                    {activeTask.priority}
                  </span>
                  <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <FolderKanban size={12} />
                    {activeTask.project?.name ?? 'Inbox'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug mb-2">
                  {activeTask.title}
                </h3>

                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-5">
                  {activeTask.description || 'No additional description provided for this work item.'}
                </p>
              </div>

              {/* card footer */}
              <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                {activeTask.due_date ? (
                  <span className="flex items-center gap-1">
                    <Calendar size={12} className="text-gray-400" />
                    {new Date(activeTask.due_date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-gray-400" />
                    No target date
                  </span>
                )}
                <span className="text-[10px] text-gray-400">
                  {deck.length} remaining
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* bottom fallback touch triggers */}
      {activeTask && (
        <div className="grid grid-cols-3 gap-2.5 pt-1 pb-2 shrink-0">
          <button
            type="button"
            onClick={() => handleAction(activeTask, 'left')}
            className="py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-xs"
          >
            <Clock size={14} />
            <span>Defer</span>
          </button>
          <button
            type="button"
            onClick={() => handleAction(activeTask, 'up')}
            className="py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-xs"
          >
            <Check size={14} />
            <span>Done</span>
          </button>
          <button
            type="button"
            onClick={() => handleAction(activeTask, 'right')}
            className={`py-3 rounded-2xl ${theme.bgSubtle} border ${theme.borderAccent}/30 ${theme.textAccent} font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-xs`}
          >
            <Flame size={14} />
            <span>Claim</span>
          </button>
        </div>
      )}
    </div>
  );
}