import { useDrop } from 'react-dnd';
import { Plus, Ellipsis } from 'lucide-react';
import { ModernTaskCard, ModernTask } from './ModernTaskCard';

interface ModernKanbanColumnProps {
  title: string;
  tasks: ModernTask[];
  color: string;
  onDrop: (taskId: string) => void;
}

export function ModernKanbanColumn({ title, tasks, color, onDrop }: ModernKanbanColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'MODERN_TASK',
    drop: (item: { id: string }) => onDrop(item.id),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return drop(
    <div className="flex w-80 flex-shrink-0 flex-col">
      {/* Column Header */}
      <div className="mb-4 flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${color}`}></div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className="flex h-6 min-w-[24px] items-center justify-center rounded-lg bg-gray-100 px-2 text-xs font-semibold text-gray-600">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button className="rounded-lg p-1.5 transition-all hover:bg-gray-100">
            <Plus className="h-4 w-4 text-gray-500" />
          </button>
          <button className="rounded-lg p-1.5 transition-all hover:bg-gray-100">
            <Ellipsis className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Column Content */}
      <div
        
        className={`flex-1 space-y-4 rounded-2xl bg-gray-50/80 p-4 transition-all ${
          isOver ? 'bg-violet-50 ring-2 ring-violet-300' : ''
        }`}
      >
        {tasks.map((task) => (
          <ModernTaskCard key={task.id} task={task} />
        ))}
        
        {tasks.length === 0 && (
          <div className="flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white/50">
            <p className="text-sm text-gray-400">No tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}