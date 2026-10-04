import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Loader2 } from 'lucide-react';
import { ModernKanbanColumn } from './ModernKanbanColumn';
import { ModernTask } from './ModernTaskCard';
import { supabase } from '../../lib/supabaseClient';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { toast } from 'sonner';

type ColumnType = 'todo' | 'inProgress' | 'review' | 'done';

interface ColumnData {
  todo: ModernTask[];
  inProgress: ModernTask[];
  review: ModernTask[];
  done: ModernTask[];
}

interface ModernKanbanBoardProps {
  projectId?: string;
}

export function ModernKanbanBoard({ projectId }: ModernKanbanBoardProps) {
  const theme = useAccentTheme();
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState<ColumnData>({
    todo: [],
    inProgress: [],
    review: [],
    done: [],
  });

  const fetchTasks = async () => {
    try {
      let query = supabase
        .from('tasks')
        .select('*, assigned_user:users(id, name, avatar)')
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
        // Normalize status names to match column keys
        const colKey: ColumnType =
          rawStatus === 'in_progress' || rawStatus === 'inProgress'
            ? 'inProgress'
            : rawStatus === 'review'
            ? 'review'
            : rawStatus === 'done'
            ? 'done'
            : 'todo';

        const taskItem: ModernTask = {
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
  }, [projectId]);

  const handleDrop = async (taskId: string, targetColumn: ColumnType) => {
    // 1. Optimistic UI update
    setColumns((prevColumns) => {
      let sourceColumn: ColumnType | null = null;
      let taskToMove: ModernTask | null = null;

      for (const [columnName, tasks] of Object.entries(prevColumns)) {
        const task = tasks.find((t: ModernTask) => t.id === taskId);
        if (task) {
          sourceColumn = columnName as ColumnType;
          taskToMove = task;
          break;
        }
      }

      if (!sourceColumn || !taskToMove || sourceColumn === targetColumn) {
        return prevColumns;
      }

      const next = { ...prevColumns };
      next[sourceColumn] = next[sourceColumn].filter((t) => t.id !== taskId);
      next[targetColumn] = [taskToMove, ...next[targetColumn]];
      return next;
    });

    // 2. Persist to Supabase
    try {
      const dbStatus =
        targetColumn === 'inProgress'
          ? 'in_progress'
          : targetColumn;

      const { error } = await supabase
        .from('tasks')
        .update({ status: dbStatus })
        .eq('id', taskId);

      if (error) throw error;
    } catch (err: any) {
      toast.error('Failed to update task status');
      fetchTasks(); // Rollback on network failure
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
  );
}