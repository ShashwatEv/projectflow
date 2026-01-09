import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ModernKanbanColumn } from './ModernKanbanColumn';
import { ModernTask } from './ModernTaskCard';

const initialTasks: ModernTask[] = [
  {
    id: '1',
    title: 'Redesign Dashboard UI',
    description: 'Update the main dashboard with new design system',
    priority: 'high',
    assignees: [
      { name: 'Sarah', avatar: '' },
      { name: 'Mike', avatar: '' },
    ],
    dueDate: 'Jan 12',
    comments: 5,
    attachments: 3,
    tags: ['Design', 'UI/UX'],
  },
  {
    id: '2',
    title: 'Implement Authentication',
    description: 'Add OAuth2.0 and JWT token support',
    priority: 'urgent',
    assignees: [
      { name: 'John', avatar: '' },
    ],
    dueDate: 'Jan 8',
    comments: 8,
    attachments: 2,
    tags: ['Backend', 'Security'],
  },
  {
    id: '3',
    title: 'Database Migration',
    description: 'Migrate from PostgreSQL to distributed database',
    priority: 'medium',
    assignees: [
      { name: 'Emma', avatar: '' },
      { name: 'Chris', avatar: '' },
    ],
    dueDate: 'Jan 15',
    comments: 3,
    attachments: 1,
    tags: ['Backend', 'DevOps'],
  },
  {
    id: '4',
    title: 'Mobile App Testing',
    description: 'Complete QA testing for iOS and Android builds',
    priority: 'high',
    assignees: [
      { name: 'Lisa', avatar: '' },
      { name: 'Tom', avatar: '' },
      { name: 'Jake', avatar: '' },
    ],
    dueDate: 'Jan 10',
    comments: 12,
    attachments: 5,
    tags: ['QA', 'Mobile'],
  },
  {
    id: '5',
    title: 'API Documentation',
    description: 'Write comprehensive API docs with examples',
    priority: 'low',
    assignees: [
      { name: 'Alex', avatar: '' },
    ],
    dueDate: 'Jan 18',
    comments: 2,
    attachments: 0,
    tags: ['Documentation'],
  },
  {
    id: '6',
    title: 'Performance Optimization',
    description: 'Reduce page load time and improve Core Web Vitals',
    priority: 'high',
    assignees: [
      { name: 'Sarah', avatar: '' },
      { name: 'Mike', avatar: '' },
    ],
    dueDate: 'Jan 14',
    comments: 7,
    attachments: 4,
    tags: ['Frontend', 'Performance'],
  },
  {
    id: '7',
    title: 'Code Review Sprint 3',
    description: 'Review all PRs from Sprint 3 before deployment',
    priority: 'medium',
    assignees: [
      { name: 'John', avatar: '' },
      { name: 'Emma', avatar: '' },
    ],
    dueDate: 'Jan 9',
    comments: 15,
    attachments: 0,
    tags: ['Review'],
  },
  {
    id: '8',
    title: 'Deploy to Production',
    description: 'Final deployment with monitoring setup',
    priority: 'urgent',
    assignees: [
      { name: 'Chris', avatar: '' },
    ],
    dueDate: 'Jan 20',
    comments: 4,
    attachments: 2,
    tags: ['DevOps', 'Deployment'],
  },
  {
    id: '9',
    title: 'User Feedback Analysis',
    description: 'Analyze user feedback from beta testing',
    priority: 'medium',
    assignees: [
      { name: 'Lisa', avatar: '' },
    ],
    dueDate: 'Jan 16',
    comments: 6,
    attachments: 1,
    tags: ['Research'],
  },
  {
    id: '10',
    title: 'Fix Critical Bugs',
    description: 'Address high-priority bugs reported by QA',
    priority: 'urgent',
    assignees: [
      { name: 'Mike', avatar: '' },
      { name: 'John', avatar: '' },
    ],
    dueDate: 'Jan 7',
    comments: 10,
    attachments: 3,
    tags: ['Bug Fix', 'Critical'],
  },
];

type ColumnType = 'todo' | 'inProgress' | 'review' | 'done';

interface ColumnData {
  todo: ModernTask[];
  inProgress: ModernTask[];
  review: ModernTask[];
  done: ModernTask[];
}

export function ModernKanbanBoard() {
  const [columns, setColumns] = useState<ColumnData>({
    todo: initialTasks.slice(0, 3),
    inProgress: initialTasks.slice(3, 6),
    review: initialTasks.slice(6, 8),
    done: initialTasks.slice(8, 10),
  });

  const handleDrop = (taskId: string, targetColumn: ColumnType) => {
    setColumns((prevColumns) => {
      let sourceColumn: ColumnType | null = null;
      let taskToMove: ModernTask | null = null;

      // Find the task and its current column
      for (const [columnName, tasks] of Object.entries(prevColumns)) {
        const task = tasks.find((t: ModernTask) => t.id === taskId);
        if (task) {
          sourceColumn = columnName as ColumnType;
          taskToMove = task;
          break;
        }
      }

      if (!sourceColumn || !taskToMove) return prevColumns;

      // Move task to new column
      const newColumns = { ...prevColumns };
      newColumns[sourceColumn] = newColumns[sourceColumn].filter((t) => t.id !== taskId);
      newColumns[targetColumn] = [...newColumns[targetColumn], taskToMove];

      return newColumns;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex gap-6 overflow-x-auto pb-6">
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