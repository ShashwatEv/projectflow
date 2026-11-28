import { useState, useEffect, useCallback, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Loader2, ShieldAlert, Keyboard, LayoutGrid, Rows, Plus, X } from 'lucide-react';
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
type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

const COLUMN_KEYS: ColumnType[] = ['todo', 'inProgress', 'review', 'done'];

const COLUMN_LABELS: Record<ColumnType, string> = {
  todo: 'To Do',
  inProgress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

interface ColumnData {
  todo: ExtendedModernTask[];
  inProgress: ExtendedModernTask[];
  review: ExtendedModernTask[];
  done: ExtendedModernTask[];
}

interface ModernKanbanBoardProps {
  projectId?: string;
}

interface RawTaskRow {
  id: string;
  title: string;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  due_date?: string | null;
  comments_count?: number | null;
  tags?: string[] | null;
  project_id?: string | null;
  blocked_by?: string | null;
  assigned_user?: { id?: string; name?: string | null; avatar?: string | null } | null;
  blocker?: { id?: string; title?: string | null; status?: string | null } | null;
}

function normalizePriority(raw: unknown): TaskPriority {
  if (typeof raw !== 'string') return 'medium';
  const lower = raw.toLowerCase();
  if (lower === 'urgent' || lower === 'high' || lower === 'medium' || lower === 'low') {
    return lower;
  }
  return 'medium';
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

  const [quickAddColumn, setQuickAddColumn] = useState<ColumnType | null>(null);
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const [quickAddPriority, setQuickAddPriority] = useState<TaskPriority>('medium');
  const [creatingTask, setCreatingTask] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchTasks = useCallback(async () => {
    if (isSandboxActive) {
      const grouped: ColumnData = {
        todo: [],
        inProgress: [],
        review: [],
        done: [],
      };

      sandboxTasks.forEach((t) => {
        const taskWithProject: ExtendedModernTask = {
          ...t,
          projectId: t.projectId || projectId,
        };
        const hasTag = (tag: string) => t.tags.includes(tag);
        if (hasTag('inProgress') || hasTag('in_progress')) {
          grouped.inProgress.push(taskWithProject);
        } else if (hasTag('review')) {
          grouped.review.push(taskWithProject);
        } else if (hasTag('done')) {
          grouped.done.push(taskWithProject);
        } else {
          grouped.todo.push(taskWithProject);
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

      ((data || []) as RawTaskRow[]).forEach((t) => {
        const rawStatus = t.status || 'todo';
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
          priority: normalizePriority(t.priority),
          assignees: t.assigned_user
            ? [
                {
                  name: t.assigned_user.name || 'User',
                  avatar: t.assigned_user.avatar || '/pfp.jpg',
                },
              ]
            : [],
          dueDate: t.due_date
            ? new Date(t.due_date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })
            : 'No date',
          comments: t.comments_count || 0,
          attachments: 0,
          tags: t.tags && t.tags.length > 0 ? t.tags : [t.priority || 'Task'],
          projectId: t.project_id || projectId,
          blocked_by: t.blocked_by || null,
          blocker_title: t.blocker?.title || null,
          blocker_status: t.blocker?.status || null,
        };

        grouped[colKey].push(taskItem);
      });

      setColumns(grouped);
    } catch (err: unknown) {
      console.error('Failed to load board tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [isSandboxActive, projectId, sandboxTasks]);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (isSandboxActive) return;

    const scheduleRefresh = () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        void fetchTasks();
      }, 150);
    };

    const channelName = `kanban_realtime_stream_${projectId || 'all'}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          ...(projectId ? { filter: `project_id=eq.${projectId}` } : {}),
        },
        scheduleRefresh
      )
      .subscribe();

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      void supabase.removeChannel(channel);
    };
  }, [fetchTasks, isSandboxActive, projectId]);

  const handleOpenQuickAdd = (col: ColumnType) => {
    setQuickAddColumn(col);
    setQuickAddTitle('');
    setQuickAddPriority('medium');
  };

  const handleQuickCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = quickAddTitle.trim();
    if (!cleanTitle || !quickAddColumn || creatingTask) return;

    const dbStatus = quickAddColumn === 'inProgress' ? 'in_progress' : quickAddColumn;
    setCreatingTask(true);

    try {
      if (isSandboxActive) {
        toast.info(`Draft "${cleanTitle}" noted for ${COLUMN_LABELS[quickAddColumn]} in Safe Sandbox.`);
        setQuickAddTitle('');
        setQuickAddColumn(null);
        return;
      }

      const { error } = await supabase.from('tasks').insert({
        title: cleanTitle,
        status: dbStatus,
        priority: quickAddPriority,
        ...(projectId ? { project_id: projectId } : {}),
      });

      if (error) throw error;

      setQuickAddTitle('');
      setQuickAddColumn(null);
      toast.success(`Added to ${COLUMN_LABELS[quickAddColumn]}`);
      await fetchTasks();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create task';
      toast.error(message);
    } finally {
      setCreatingTask(false);
    }
  };

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
          description: `Cannot mark "${taskToCheck.title}" as Done until blocker "${
            taskToCheck.blocker_title || 'predecessor'
          }" is completed first.`,
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
      const { error } = await supabase.from('tasks').update({ status: dbStatus }).eq('id', taskId);

      if (error) throw error;
    } catch {
      toast.error('Failed to update task status');
      void fetchTasks();
    }
  };

  const handlePriorityUpdate = async (taskId: string, newPriority: TaskPriority) => {
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
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'Escape' && quickAddColumn) {
        e.preventDefault();
        setQuickAddColumn(null);
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
    [focusedColIndex, focusedTaskIndex, columns, quickAddColumn]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 py-24 text-gray-400">
        <Loader2 size={30} className={`animate-spin ${theme.textAccent}`} />
        <p className="text-xs">Synchronizing Kanban board...</p>
      </div>
    );
  }

  const totalTasks =
    columns.todo.length +
    columns.inProgress.length +
    columns.review.length +
    columns.done.length;

  return (
    <div data-tour="kanban-board" className="space-y-4">
      {/* Top Controls Toolbar with Density Toggle, Total Count, and Shortcuts */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 font-mono text-xs text-gray-500 shadow-xs dark:border-gray-800 dark:bg-[#161b22] sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2.5">
          <Keyboard size={15} className={theme.textAccent} />
          <span className="rounded-md bg-gray-100 px-2 py-0.5 font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
            {totalTasks} {totalTasks === 1 ? 'card' : 'cards'}
          </span>
          <span className="text-gray-300 dark:text-gray-700">|</span>
          <span className="text-gray-800 dark:text-gray-200">
            <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-bold dark:border-gray-700 dark:bg-gray-800">
              J
            </kbd>{' '}
            /{' '}
            <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-bold dark:border-gray-700 dark:bg-gray-800">
              K
            </kbd>{' '}
            move
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-800 dark:text-gray-200">
            <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-bold dark:border-gray-700 dark:bg-gray-800">
              H
            </kbd>{' '}
            /{' '}
            <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-bold dark:border-gray-700 dark:bg-gray-800">
              L
            </kbd>{' '}
            column
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-800 dark:text-gray-200">
            <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-bold dark:border-gray-700 dark:bg-gray-800">
              Space
            </kbd>{' '}
            inspect
          </span>
        </div>

        {/* Density View Switcher */}
        <div className="flex items-center gap-1 self-end rounded-xl border border-gray-200 bg-gray-100 p-1 dark:border-gray-800 dark:bg-[#0d1117] sm:self-auto">
          <button
            type="button"
            onClick={() => setDensity('comfort')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              density === 'comfort'
                ? 'bg-white text-gray-900 shadow-xs dark:bg-[#161b22] dark:text-white'
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
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              density === 'compact'
                ? 'bg-white text-gray-900 shadow-xs dark:bg-[#161b22] dark:text-white'
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
        <div className="flex items-center justify-between rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-500 dark:text-amber-400">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="shrink-0" />
            <span>
              Safe Sandbox Active: Tasks shown are isolated mock drafts. Drag and test without affecting the team.
            </span>
          </div>
          <span className="shrink-0 rounded-lg bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-bold uppercase">
            Isolated
          </span>
        </div>
      )}

      {/* Horizontal Snap Scroll Container */}
      <DndProvider backend={HTML5Backend}>
        <div className="custom-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-6">
          <ModernKanbanColumn
            title="To Do"
            tasks={columns.todo}
            color="bg-slate-400"
            density={density}
            hoveredTaskId={hoveredTaskId}
            onHoverTask={setHoveredTaskId}
            onAddTask={() => handleOpenQuickAdd('todo')}
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
            onAddTask={() => handleOpenQuickAdd('inProgress')}
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
            onAddTask={() => handleOpenQuickAdd('review')}
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
            onAddTask={() => handleOpenQuickAdd('done')}
            onDrop={(taskId) => handleDrop(taskId, 'done')}
            onTaskClick={(taskId) => setActiveModalTaskId(taskId)}
            onStatusChange={(taskId, st) => handleDrop(taskId, st as ColumnType)}
            onPriorityChange={handlePriorityUpdate}
          />
        </div>
      </DndProvider>

      {/* Quick Add Task Modal */}
      {quickAddColumn && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => {
            if (!creatingTask) setQuickAddColumn(null);
          }}
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-add-modal-title"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => void handleQuickCreateTask(e)}
            className="w-full max-w-md space-y-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150 dark:border-gray-800 dark:bg-[#161b22]"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${theme.bgSubtle} ${theme.textAccent}`}>
                  <Plus size={14} />
                </span>
                <h3 id="quick-add-modal-title" className="text-sm font-bold text-gray-900 dark:text-white">
                  Add Task to {COLUMN_LABELS[quickAddColumn]}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickAddColumn(null)}
                disabled={creatingTask}
                aria-label="Close quick add modal"
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5 px-5">
              <div>
                <label
                  htmlFor="quick-task-title"
                  className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Task Title
                </label>
                <input
                  id="quick-task-title"
                  autoFocus
                  required
                  value={quickAddTitle}
                  onChange={(e) => setQuickAddTitle(e.target.value)}
                  placeholder="e.g. Refine Kanban drag & drop states"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 outline-none transition-colors focus:border-indigo-500 dark:border-gray-700 dark:bg-[#0d1117] dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="quick-task-priority"
                  className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Priority
                </label>
                <select
                  id="quick-task-priority"
                  value={quickAddPriority}
                  onChange={(e) => setQuickAddPriority(normalizePriority(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-medium text-gray-900 outline-none transition-colors focus:border-indigo-500 dark:border-gray-700 dark:bg-[#0d1117] dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/70 px-5 py-3.5 dark:border-gray-800 dark:bg-[#0d1117]/60">
              <span className="font-mono text-[10px] text-gray-400">Press Esc to cancel</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuickAddColumn(null)}
                  disabled={creatingTask}
                  className="rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-200/70 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!quickAddTitle.trim() || creatingTask}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition-all disabled:opacity-50 ${theme.btnPrimary}`}
                >
                  {creatingTask && <Loader2 size={13} className="animate-spin" />}
                  <span>{creatingTask ? 'Adding...' : 'Add Task'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Peek Detail Modal */}
      <TaskDetailModal
        taskId={activeModalTaskId}
        onClose={() => setActiveModalTaskId(null)}
        onUpdate={() => void fetchTasks()}
      />
    </div>
  );
}