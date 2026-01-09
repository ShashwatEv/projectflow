import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { KanbanColumn } from './KanbanColumn';
import { Task } from './TaskCard';
import { ListFilter, Plus } from 'lucide-react';

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Design new landing page',
    description: 'Create mockups for the updated homepage',
    priority: 'high',
    assignees: ['Sarah Chen', 'Mike Johnson'],
    dueDate: 'Jan 8',
    tags: ['Design', 'UI'],
  },
  {
    id: '2',
    title: 'User research interviews',
    description: 'Conduct 5 user interviews for feature validation',
    priority: 'medium',
    assignees: ['Emma Wilson'],
    dueDate: 'Jan 10',
    tags: ['Research'],
  },
  {
    id: '3',
    title: 'Update API documentation',
    description: 'Document new endpoints and authentication flow',
    priority: 'low',
    assignees: ['John Doe'],
    dueDate: 'Jan 12',
    tags: ['Documentation', 'Backend'],
  },
  {
    id: '4',
    title: 'Implement search feature',
    description: 'Add full-text search with filters',
    priority: 'high',
    assignees: ['Mike Johnson', 'John Doe'],
    dueDate: 'Jan 6',
    tags: ['Frontend', 'Backend'],
  },
  {
    id: '5',
    title: 'Fix responsive issues',
    description: 'Mobile layout bugs on dashboard',
    priority: 'medium',
    assignees: ['Sarah Chen'],
    dueDate: 'Jan 9',
    tags: ['Bug', 'Frontend'],
  },
  {
    id: '6',
    title: 'Performance optimization',
    description: 'Reduce initial load time by 30%',
    priority: 'high',
    assignees: ['Mike Johnson'],
    dueDate: 'Jan 15',
    tags: ['Performance'],
  },
  {
    id: '7',
    title: 'Setup CI/CD pipeline',
    description: 'Automate testing and deployment',
    priority: 'medium',
    assignees: ['John Doe'],
    dueDate: 'Jan 20',
    tags: ['DevOps'],
  },
];

type ColumnType = 'todo' | 'inProgress' | 'review' | 'done';

interface ColumnData {
  todo: Task[];
  inProgress: Task[];
  review: Task[];
  done: Task[];
}

export function KanbanBoard() {
  const [columns, setColumns] = useState<ColumnData>({
    todo: initialTasks.slice(0, 3),
    inProgress: initialTasks.slice(3, 5),
    review: initialTasks.slice(5, 6),
    done: initialTasks.slice(6),
  });

  const handleDrop = (taskId: string, targetColumn: ColumnType) => {
    setColumns((prevColumns) => {
      // Find which column the task is currently in
      let sourceColumn: ColumnType | null = null;
      let taskToMove: Task | null = null;

      for (const [columnName, tasks] of Object.entries(prevColumns) as [ColumnType, Task[]][]) {
        const task = tasks.find((t) => t.id === taskId);
        if (task) {
          sourceColumn = columnName;
          taskToMove = task;
          break;
        }
      }

      if (!sourceColumn || !taskToMove) return prevColumns;

      // Remove from source column and add to target column
      const newColumns = { ...prevColumns };
      newColumns[sourceColumn] = newColumns[sourceColumn].filter((t) => t.id !== taskId);
      newColumns[targetColumn] = [...newColumns[targetColumn], taskToMove];

      return newColumns;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Project Board</h2>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <ListFilter className="h-4 w-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              <Plus className="h-4 w-4" />
              New Task
            </button>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
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
