import { Calendar, MoreHorizontal } from 'lucide-react';

// ✅ Updated Interface to include 'status'
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags?: string[];
  assignees?: string[];
  status?: 'todo' | 'inProgress' | 'review' | 'done'; // <--- Added this line
}

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group">
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">{task.title}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{task.description}</p>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex -space-x-2">
          {task.assignees && task.assignees.map((assignee, i) => (
             <div key={i} className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 border-2 border-white dark:border-gray-800 flex items-center justify-center text-[10px] font-bold text-indigo-700 dark:text-indigo-300" title={assignee}>
                {assignee.charAt(0)}
             </div>
          ))}
        </div>
        
        {task.dueDate && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar size={12} />
                <span>{task.dueDate}</span>
            </div>
        )}
      </div>
    </div>
  );
}