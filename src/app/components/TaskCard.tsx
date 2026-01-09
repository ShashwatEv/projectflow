import { useDrag } from 'react-dnd';
import { GripVertical, Clock, Ellipsis } from 'lucide-react';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  assignees: string[];
  dueDate: string;
  tags: string[];
}

interface TaskCardProps {
  task: Task;
}

const priorityColors = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

export function TaskCard({ task }: TaskCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={(instance) => (drag as any)(instance)}
      className={`group cursor-move rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-start gap-2">
          <GripVertical className="mt-0.5 h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{task.title}</h4>
            <p className="mt-1 text-sm text-gray-600">{task.description}</p>
          </div>
        </div>
        <button className="rounded p-1 hover:bg-gray-100">
          <Ellipsis className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {task.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {task.assignees.map((assignee, index) => (
            <div
              key={index}
              className="h-7 w-7 rounded-full border-2 border-white bg-gradient-to-br from-indigo-400 to-purple-500"
              title={assignee}
            ></div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              priorityColors[task.priority]
            }`}
          >
            {task.priority}
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="h-3.5 w-3.5" />
            <span>{task.dueDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
