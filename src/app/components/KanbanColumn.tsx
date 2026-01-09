import { useDrop } from 'react-dnd';
import { Plus } from 'lucide-react';
import { TaskCard, Task } from './TaskCard';

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  count: number;
  color: string;
  onDrop: (taskId: string) => void;
}

export function KanbanColumn({ title, tasks, count, color, onDrop }: KanbanColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: (item: { id: string }) => onDrop(item.id),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return drop(
    <div
      
      className={`flex min-w-80 flex-col rounded-xl border-2 bg-gray-50 ${
        isOver ? 'border-indigo-400 bg-indigo-50' : 'border-transparent'
      }`}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${color}`}></div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
            {count}
          </span>
        </div>
        <button className="rounded-lg p-1.5 hover:bg-gray-200">
          <Plus className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4 pt-0">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
