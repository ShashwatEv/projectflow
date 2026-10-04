import { useState, useEffect } from 'react';
import { Play, Pause, Clock, CheckCircle2, Square } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { toast } from 'sonner';

interface TaskTimerData {
  id: string;
  title: string;
  startedAt: string;
}

export default function HeaderTaskTimer() {
  const { user } = useAuth();
  const theme = useAccentTheme();

  const [activeTask, setActiveTask] = useState<TaskTimerData | null>(null);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadActiveTimer = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('active_timers')
        .select('*, tasks(id, title)')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data && data.tasks) {
        setActiveTask({
          id: data.task_id,
          title: data.tasks.title,
          startedAt: data.started_at,
        });
        const diff = Math.floor(
          (new Date().getTime() - new Date(data.started_at).getTime()) / 1000
        );
        setElapsedSec(diff > 0 ? diff : 0);
      } else {
        setActiveTask(null);
        setElapsedSec(0);
      }
    } catch {
      // Table or entry not found; fail silently
    }
  };

  useEffect(() => {
    loadActiveTimer();

    // 1. Listen for local window event triggers when tasks start
    window.addEventListener('active-timer-started', loadActiveTimer);

    // 2. Real-time subscription to active_timers table
    const channel = supabase
      .channel(`active_timers_realtime_${user?.id || 'guest'}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'active_timers' },
        () => {
          loadActiveTimer();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('active-timer-started', loadActiveTimer);
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Clock increment interval
  useEffect(() => {
    if (!activeTask) return;
    const interval = setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTask]);

  const stopAndLogTime = async () => {
    if (!user?.id || !activeTask || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const hoursLogged = parseFloat((elapsedSec / 3600).toFixed(2));

      // Remove active session
      await supabase.from('active_timers').delete().eq('user_id', user.id);

      // Save to timesheets
      if (hoursLogged > 0.005) {
        await supabase.from('timesheets').insert({
          user_id: user.id,
          task_id: activeTask.id,
          hours: Math.max(0.1, hoursLogged),
          description: `Logged via Live Header Timer on "${activeTask.title}"`,
          date: new Date().toISOString().split('T')[0],
        });
        toast.success(`Logged ${Math.max(0.1, hoursLogged)} hrs to Timesheets!`);
      } else {
        toast.info('Session stopped (under 30s, discarded).');
      }

      setActiveTask(null);
      setElapsedSec(0);
    } catch {
      toast.error('Failed to save timesheet entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Only render in the header when a timer is actively running
  if (!activeTask) return null;

  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 font-mono text-xs shadow-xs animate-in fade-in duration-200">
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
      <span className="truncate max-w-[130px] font-sans font-semibold text-white">
        {activeTask.title}
      </span>
      <span className="font-bold shrink-0">{formatTime(elapsedSec)}</span>
      <button
        type="button"
        disabled={isSubmitting}
        onClick={stopAndLogTime}
        className="p-1 hover:bg-emerald-500/20 rounded text-emerald-300 transition-colors disabled:opacity-50"
        title="Stop & Log to Timesheets"
      >
        <CheckCircle2 size={15} />
      </button>
    </div>
  );
}