import { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Loader2, ShieldAlert, Keyboard, LayoutGrid, Rows } from 'lucide-react';
import { ModernKanbanColumn } from './ModernKanbanColumn';
import { ModernTask } from './ModernTaskCard';
import { supabase } from '../../lib/supabaseClient';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { useOnboardingSandbox } from '../../context/OnboardingSandboxContext';
import TaskDetailModal from './TaskDetailModal';
import { toast } from 'sonner';

export interface ExtendedModernTask extends ModernTask {
  blocked_by?: string | null;
  blocker_title?: string | null;
  blocker_status?: string | null;
}

type ColumnType = 'todo' | 'inProgress' | 'review' | 'done';

const COLUMN_KEYS: ColumnType[] = ['todo', 'inProgress', 'review', 'done'];

interface ColumnData {
  todo: ExtendedModernTask[];
  inProgress: ExtendedModernTask[];
  review: ExtendedModernTask[];
  done: ExtendedModernTask[];
}

interface ModernKanbanBoardProps {
  projectId?: string;
}

export function ModernKanbanBoard({ projectId }: ModernKanbanBoardProps) {
  const theme = useAccentTheme();
  const { isSandboxActive, sandboxTasks, updateSandboxTaskStatus } = useOnboardingSandbox();

  const [loading, setLoading] = useState(true);
  const [density, setDensity] = useState<'comfort' | 'compact'>('comfort');
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);

  const [columns, setColumns] = useState<ColumnData>({
    todo: [],
    inProgress: [],
    review: [],
    done: [],
  });

  const [focusedColIndex, setFocusedColIndex] = useState<number>(0);
  const [focusedTaskIndex, setFocusedTaskIndex] = useState<number>(0);
  const [activeModalTaskId, setActiveModalTaskId] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (isSandboxActive) {
      const grouped: ColumnData = {
        todo: [],
        inProgress: [],
        review: [],
        done: [],
      };

      sandboxTasks.forEach((t) => {
        const hasTag = (tag: string) => t.tags.includes(tag);
        if (hasTag('inProgress') || hasTag('in_progress')) {
          grouped.inProgress.push(t);
        } else if (hasTag('review')) {
          grouped.review.push(t);
        } else if (hasTag('done')) {
          grouped.done.push(t);
        } else {
          grouped.todo.push(t);
        }
      });

      setColumns(grouped);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('tasks')
        .select('*, assigned_user:users(id, name, avatar), blocker:tasks!blocked_by(id, title, status)')
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const grouped: ColumnData = {
        todo: [],
        inProgress: [],
        review: [],
        done: [],
      };

      (data || []).forEach((t: any) => {
        const rawStatus = (t.status || 'todo') as string;
        const colKey: ColumnType =
          rawStatus === 'in_progress' || rawStatus === 'inProgress'
            ? 'inProgress'
            : rawStatus === 'review'
            ? 'review'
            : rawStatus === 'done'
            ? 'done'
            : 'todo';

        const taskItem: ExtendedModernTask = {
          id: t.id,
          title: t.title,
          description: t.description || '',
          priority: (t.priority?.toLowerCase() || 'medium') as any,
          assignees: t.assigned_user
            ? [{ name: t.assigned_user.name || 'User', avatar: t.assigned_user.avatar || '/pfp.jpg' }]
            : [],
          dueDate: t.due_date ? new Date(t.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No date',
          comments: t.comments_count || 0,
          attachments: 0,
          tags: t.tags || [t.priority || 'Task'],
          blocked_by: t.blocked_by || null,
          blocker_title: t.blocker?.title || null,
          blocker_status: t.blocker?.status || null,
        };

        if (grouped[colKey]) {
          grouped[colKey].push(taskItem);
        } else {
          grouped.todo.push(taskItem);
        }
      });

      setColumns(grouped);
    } catch (err: any) {
      console.error('Failed to load board tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();

    if (isSandboxActive) return;

    const channel = supabase
      .channel('kanban_realtime_stream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, isSandboxActive, sandboxTasks]);

  const handleDrop = async (taskId: string, targetColumn: ColumnType) => {
    if (isSandboxActive) {
      updateSandboxTaskStatus(taskId, targetColumn);
      toast.info('Card moved locally across safe sandbox');
      return;
    }

    let movingTask: ExtendedModernTask | null = null;
    let sourceColumn: ColumnType | null = null;

    (Object.entries(columns) as [ColumnType, ExtendedModernTask[]][]).forEach(([col, items]) => {
      const match = items.find((i: ExtendedModernTask) => i.id === taskId);
      if (match) {
        movingTask = match;
        sourceColumn = col;
      }
    });

    if (!movingTask || !sourceColumn || sourceColumn === targetColumn) return;

    const taskToCheck = movingTask as ExtendedModernTask;
    if (targetColumn === 'done' && taskToCheck.blocked_by) {
      if (taskToCheck.blocker_status !== 'done') {
        toast.error('Task Dependency Blocker', {
          description: `Cannot mark "${taskToCheck.title}" as Done until blocker "${taskToCheck.blocker_title || 'predecessor'}" is completed first.`,
        });
        return;
      }
    }

    setColumns((prev) => {
      const next = { ...prev };
      next[sourceColumn!] = next[sourceColumn!].filter((t) => t.id !== taskId);
      next[targetColumn] = [movingTask!, ...next[targetColumn]];
      return next;
    });

    try {
      const dbStatus = targetColumn === 'inProgress' ? 'in_progress' : targetColumn;
      const { error } = await supabase
        .from('tasks')
        .update({ status: dbStatus })
        .eq('id', taskId);

      if (error) throw error;
    } catch {
      toast.error('Failed to update task status');
      fetchTasks();
    }
  };

  const handlePriorityUpdate = async (taskId: string, newPriority: 'urgent' | 'high' | 'medium' | 'low') => {
    setColumns((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        const key = k as ColumnType;
        next[key] = next[key].map((t) => (t.id === taskId ? { ...t, priority: newPriority } : t));
      });
      return next;
    });

    if (!isSandboxActive) {
      await supabase.from('tasks').update({ priority: newPriority }).eq('id', taskId);
    }
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const activeColKey = COLUMN_KEYS[focusedColIndex] || 'todo';
      const currentTasks = columns[activeColKey] || [];

      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedTaskIndex((prev) => Math.min(currentTasks.length - 1, prev + 1));
      }

      if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedTaskIndex((prev) => Math.max(0, prev - 1));
      }

      if (e.key === 'l' || e.key === 'ArrowRight') {
        e.preventDefault();
        setFocusedColIndex((prev) => Math.min(COLUMN_KEYS.length - 1, prev + 1));
        setFocusedTaskIndex(0);
      }

      if (e.key === 'h' || e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedColIndex((prev) => Math.max(0, prev - 1));
        setFocusedTaskIndex(0);
      }

      if (e.key === ' ') {
        e.preventDefault();
        const targetedTask = currentTasks[focusedTaskIndex];
        if (targetedTask) {
          setActiveModalTaskId(targetedTask.id);
        }
      }
    },
    [focusedColIndex, focusedTaskIndex, columns]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-gray-400 space-y-3">
        <Loader2 size={30} className={`animate-spin ${theme.textAccent}`} />
        <p className="text-xs">Synchronizing Kanban board...</p>
      </div>
    );
  }

  return (
    <div data-tour="kanban-board" className="space-y-4">
      {/* Top Controls Toolbar with Density Toggle and Shortcuts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-gray-500 bg-white dark:bg-[#161b22] px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
        <div className="flex items-center gap-2.5">
          <Keyboard size={15} className={theme.textAccent} />
          <span>Triage Keys:</span>
          <span className="text-gray-800 dark:text-gray-200">
            <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-bold border border-gray-200 dark:border-gray-700">J</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-bold border border-gray-200 dark:border-gray-700">K</kbd> move
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-800 dark:text-gray-200">
            <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-bold border border-gray-200 dark:border-gray-700">H</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-bold border border-gray-200 dark:border-gray-700">L</kbd> column
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-800 dark:text-gray-200">
            <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-bold border border-gray-200 dark:border-gray-700">Space</kbd> inspect
          </span>
        </div>

        {/* Density View Switcher */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#0d1117] p-1 rounded-xl border border-gray-200 dark:border-gray-800 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setDensity('comfort')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              density === 'comfort'
                ? 'bg-white dark:bg-[#161b22] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
            title="Comfort card density"
          >
            <LayoutGrid size={13} />
            <span>Comfort</span>
          </button>
          <button
            type="button"
            onClick={() => setDensity('compact')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              density === 'compact'
                ? 'bg-white dark:bg-[#161b22] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
            title="Compact high density"
          >
            <Rows size={13} />
            <span>Compact</span>
          </button>
        </div>
      </div>

      {/* Sandbox Isolation Header Banner */}
      {isSandboxActive && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between text-xs text-amber-500 dark:text-amber-400">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="shrink-0" />
            <span>
              Safe Sandbox Active: Tasks shown are isolated mock drafts. Drag and test without affecting the team.
            </span>
          </div>
          <span className="text-[10px] font-bold font-mono uppercase bg-amber-500/20 px-2 py-0.5 rounded-lg shrink-0">
            Isolated
          </span>
        </div>
      )}

      {/* Horizontal Snap Scroll Container */}
      <DndProvider backend={HTML5Backend}>
        <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar snap-x snap-mandatory scroll-smooth">
          <ModernKanbanColumn
            title="To Do"
            tasks={columns.todo}
            color="bg-slate-400"
            density={density}
            hoveredTaskId={hoveredTaskId}
            onHoverTask={setHoveredTaskId}
            onDrop={(taskId) => handleDrop(taskId, 'todo')}
            onTaskClick={(taskId) => setActiveModalTaskId(taskId)}
            onStatusChange={(taskId, st) => handleDrop(taskId, st as ColumnType)}
            onPriorityChange={handlePriorityUpdate}
          />
          <ModernKanbanColumn
            title="In Progress"
            tasks={columns.inProgress}
            color="bg-blue-500"
            density={density}
            hoveredTaskId={hoveredTaskId}
            onHoverTask={setHoveredTaskId}
            onDrop={(taskId) => handleDrop(taskId, 'inProgress')}
            onTaskClick={(taskId) => setActiveModalTaskId(taskId)}
            onStatusChange={(taskId, st) => handleDrop(taskId, st as ColumnType)}
            onPriorityChange={handlePriorityUpdate}
          />
          <ModernKanbanColumn
            title="Review"
            tasks={columns.review}
            color="bg-amber-500"
            density={density}
            hoveredTaskId={hoveredTaskId}
            onHoverTask={setHoveredTaskId}
            onDrop={(taskId) => handleDrop(taskId, 'review')}
            onTaskClick={(taskId) => setActiveModalTaskId(taskId)}
            onStatusChange={(taskId, st) => handleDrop(taskId, st as ColumnType)}
            onPriorityChange={handlePriorityUpdate}
          />
          <ModernKanbanColumn
            title="Done"
            tasks={columns.done}
            color="bg-emerald-500"
            density={density}
            hoveredTaskId={hoveredTaskId}
            onHoverTask={setHoveredTaskId}
            onDrop={(taskId) => handleDrop(taskId, 'done')}
            onTaskClick={(taskId) => setActiveModalTaskId(taskId)}
            onStatusChange={(taskId, st) => handleDrop(taskId, st as ColumnType)}
            onPriorityChange={handlePriorityUpdate}
          />
        </div>
      </DndProvider>

      {/* Peek Detail Modal */}
      <TaskDetailModal
        taskId={activeModalTaskId}
        onClose={() => setActiveModalTaskId(null)}
        onUpdate={fetchTasks}
      />
    </div>
  );
}