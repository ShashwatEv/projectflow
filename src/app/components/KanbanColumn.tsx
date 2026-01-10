import { useDrop } from 'react-dnd';
import { TaskCard, Task } from './TaskCard';

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  count: number;
  color: string;
  onDrop: (taskId: string) => void;
  onTaskClick?: (id: string) => void; // <--- This was added earlier
}

export function KanbanColumn({ title, tasks, count, color, onDrop, onTaskClick }: KanbanColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: (item: { id: string }) => onDrop(item.id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop as any} // <--- FIXED: Added 'as any'
      className={`flex h-full w-80 min-w-[320px] flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 transition-colors ${
        isOver ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${color}`} />
          <h3 className="font-semibold text-gray-700 dark:text-gray-200">{title}</h3>
          <span className="rounded-full bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300">
            {count}
          </span>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {tasks.map((task, index) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            index={index} 
            onClick={() => onTaskClick && onTaskClick(task.id)}
          />
        ))}
        {tasks.length === 0 && (
            <div className="h-24 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 text-xs font-medium">
                Drop items here
            </div>
        )}
      </div>
    </div>
  );
}