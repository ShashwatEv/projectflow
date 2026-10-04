import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Loader2, ShieldAlert, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { ModernKanbanColumn } from './ModernKanbanColumn';
import { ModernTask } from './ModernTaskCard';
import { supabase } from '../../lib/supabaseClient';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { useOnboardingSandbox } from '../../context/OnboardingSandboxContext';
import { toast } from 'sonner';

export interface ExtendedModernTask extends ModernTask {
  blocked_by?: string | null;
  blocker_title?: string | null;
  blocker_status?: string | null;
}

type ColumnType = 'todo' | 'inProgress' | 'review' | 'done';

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
  const [columns, setColumns] = useState<ColumnData>({
    todo: [],
    inProgress: [],
    review: [],
    done: [],
  });

  // 1. Fetch live or sandbox tasks with dependency joins
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
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, isSandboxActive, sandboxTasks]);

  const handleDrop = async (taskId: string, targetColumn: ColumnType) => {
    // A. Handle Safe Sandbox Drag & Drop
    if (isSandboxActive) {
      updateSandboxTaskStatus(taskId, targetColumn);
      toast.info('Card moved locally (Safe Sandbox Mode)');
      return;
    }

    // Find the task across all columns to evaluate dependency gates
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

    // Dependency Guard: Prevent moving to 'done' if blocker is unfinished
    const taskToCheck = movingTask as ExtendedModernTask;
    if (targetColumn === 'done' && taskToCheck.blocked_by) {
      if (taskToCheck.blocker_status !== 'done') {
        toast.error('Task Dependency Blocker', {
          description: `Cannot mark "${taskToCheck.title}" as Done until blocker "${taskToCheck.blocker_title || 'predecessor'}" is completed first.`,
        });
        return;
      }
    }

    // Optimistic UI Reorder
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
      {/* Sandbox Isolation Header Banner */}
      {isSandboxActive && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between text-xs text-amber-400 animate-in fade-in">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="shrink-0" />
            <span>
              <strong>Safe Sandbox Active:</strong> Tasks shown here are isolated mock drafts. Drag and test without affecting the team.
            </span>
          </div>
          <span className="text-[10px] font-bold font-mono uppercase bg-amber-500/20 px-2 py-0.5 rounded-lg shrink-0">
            Isolated
          </span>
        </div>
      )}

      <DndProvider backend={HTML5Backend}>
        <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar">
          <ModernKanbanColumn
            title="To Do"
            tasks={columns.todo}
            color="bg-slate-400"
            onDrop={(taskId) => handleDrop(taskId, 'todo')}
          />
          <ModernKanbanColumn
            title="In Progress"
            tasks={columns.inProgress}
            color="bg-blue-500"
            onDrop={(taskId) => handleDrop(taskId, 'inProgress')}
          />
          <ModernKanbanColumn
            title="Review"
            tasks={columns.review}
            color="bg-amber-500"
            onDrop={(taskId) => handleDrop(taskId, 'review')}
          />
          <ModernKanbanColumn
            title="Done"
            tasks={columns.done}
            color="bg-emerald-500"
            onDrop={(taskId) => handleDrop(taskId, 'done')}
          />
        </div>
      </DndProvider>
    </div>
  );
}