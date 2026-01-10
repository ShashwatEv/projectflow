import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { KanbanColumn } from './KanbanColumn';
import { Task } from './TaskCard';
import { ListFilter, Plus, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient'; // <--- Import Supabase

// Define column keys to match DB 'status' values
type ColumnType = 'todo' | 'inProgress' | 'review' | 'done';

interface ColumnData {
  todo: Task[];
  inProgress: Task[];
  review: Task[];
  done: Task[];
}

export function KanbanBoard() {
  const [columns, setColumns] = useState<ColumnData>({
    todo: [],
    inProgress: [],
    review: [],
    done: [],
  });
  const [loading, setLoading] = useState(true);

  // 1. Fetch Tasks on Mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase.from('tasks').select('*');
      
      if (error) throw error;

      if (data) {
        // Group tasks by status
        const newColumns: ColumnData = {
          todo: data.filter(t => t.status === 'todo' || !t.status),
          inProgress: data.filter(t => t.status === 'inProgress'),
          review: data.filter(t => t.status === 'review'),
          done: data.filter(t => t.status === 'done'),
        };
        // Map DB fields to Task interface if needed (Supabase returns snake_case, but our interface might be camelCase)
        // Since we created the table with 'due_date' but interface likely expects 'dueDate', let's map it:
        const mapTask = (t: any): Task => ({
             ...t,
             dueDate: t.due_date || t.dueDate // Handle both casing
        });

        setColumns({
            todo: newColumns.todo.map(mapTask),
            inProgress: newColumns.inProgress.map(mapTask),
            review: newColumns.review.map(mapTask),
            done: newColumns.done.map(mapTask),
        });
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (taskId: string, targetColumn: ColumnType) => {
    // 1. Optimistic Update (Update UI immediately)
    setColumns((prevColumns) => {
      let sourceColumn: ColumnType | null = null;
      let taskToMove: Task | null = null;

      // Find the task
      for (const [columnName, tasks] of Object.entries(prevColumns) as [ColumnType, Task[]][]) {
        const task = tasks.find((t) => t.id === taskId);
        if (task) {
          sourceColumn = columnName;
          taskToMove = task;
          break;
        }
      }

      if (!sourceColumn || !taskToMove || sourceColumn === targetColumn) return prevColumns;

      // Move the task
      const newColumns = { ...prevColumns };
      newColumns[sourceColumn] = newColumns[sourceColumn].filter((t) => t.id !== taskId);
      newColumns[targetColumn] = [...newColumns[targetColumn], { ...taskToMove, status: targetColumn }];

      return newColumns;
    });

    // 2. Update Database
    try {
        const { error } = await supabase
            .from('tasks')
            .update({ status: targetColumn })
            .eq('id', taskId);

        if (error) {
            console.error('Error updating task status:', error);
            // Optional: Revert UI if DB fails (omitted for simplicity)
        }
    } catch (err) {
        console.error(err);
    }
  };

  if (loading) {
      return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600" /></div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col gap-4 h-full">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Project Board</h2>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <ListFilter className="h-4 w-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm">
              <Plus className="h-4 w-4" />
              New Task
            </button>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 h-full">
          <KanbanColumn
            title="To Do"
            tasks={columns.todo}
            count={columns.todo.length}
            color="bg-gray-400"
            onDrop={(taskId) => handleDrop(taskId, 'todo')}
          />
          <KanbanColumn
            title="In Progress"
            tasks={columns.inProgress}
            count={columns.inProgress.length}
            color="bg-blue-500"
            onDrop={(taskId) => handleDrop(taskId, 'inProgress')}
          />
          <KanbanColumn
            title="Review"
            tasks={columns.review}
            count={columns.review.length}
            color="bg-yellow-500"
            onDrop={(taskId) => handleDrop(taskId, 'review')}
          />
          <KanbanColumn
            title="Done"
            tasks={columns.done}
            count={columns.done.length}
            color="bg-green-500"
            onDrop={(taskId) => handleDrop(taskId, 'done')}
          />
        </div>
      </div>
    </DndProvider>
  );
}