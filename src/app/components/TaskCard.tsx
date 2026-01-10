import { useDrag } from 'react-dnd'; 
import { Calendar, MoreHorizontal } from 'lucide-react';

export interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  status?: string;
}

interface TaskCardProps {
  task: Task;
  index: number;
  onClick?: () => void;
}

export function TaskCard({ task, index, onClick }: TaskCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const priorityColor = {
    low: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    medium: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    high: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
  };

  return (
    <div
      ref={drag as any} // <--- FIXED: Added 'as any'
      onClick={onClick}
      className={`p-3 mb-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer group ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            priorityColor[task.priority] || priorityColor.low
          }`}
        >
          {task.priority.toUpperCase()}
        </span>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 line-clamp-2 leading-relaxed">
        {task.title}
      </h4>

      {task.dueDate && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
          <Calendar size={12} />
          {new Date(task.dueDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}