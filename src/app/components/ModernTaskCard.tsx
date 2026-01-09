import { useDrag } from 'react-dnd';
import { Calendar, MessageSquare, Paperclip, Ellipsis } from 'lucide-react';

export interface ModernTask {
  id: string;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignees: Array<{ name: string; avatar: string }>;
  dueDate: string;
  comments: number;
  attachments: number;
  tags: string[];
}

interface ModernTaskCardProps {
  task: ModernTask;
}

const priorityStyles = {
  urgent: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
  high: 'bg-orange-100 text-orange-700 ring-1 ring-orange-200',
  medium: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
  low: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200',
};

export function ModernTaskCard({ task }: ModernTaskCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'MODERN_TASK',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return drag(
    <div
      className={`group cursor-move rounded-2xl bg-white p-5 shadow-sm transition-all hover:shadow-xl hover:shadow-gray-200/50 ${
        isDragging ? 'opacity-40 rotate-2 scale-105' : 'opacity-100'
      }`}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h4 className="mb-1.5 font-semibold text-gray-900 leading-snug">{task.title}</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{task.description}</p>
        </div>
        <button className="rounded-lg p-1.5 opacity-0 transition-all hover:bg-gray-100 group-hover:opacity-100">
          <Ellipsis className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Assignees */}
        <div className="flex -space-x-2">
          {task.assignees.map((assignee, idx) => (
            <div
              key={idx}
              className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 ring-2 ring-white"
              title={assignee.name}
            ></div>
          ))}
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-3">
          <span
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
              priorityStyles[task.priority]
            }`}
          >
            {task.priority}
          </span>
          
          <div className="flex items-center gap-3 text-gray-400">
            {task.comments > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{task.comments}</span>
              </div>
            )}
            {task.attachments > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{task.attachments}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-gray-500">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{task.dueDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
