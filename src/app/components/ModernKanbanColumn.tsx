import { useDrop } from 'react-dnd';
import { Plus, Ellipsis } from 'lucide-react';
import { ModernTaskCard, ModernTask } from './ModernTaskCard';

interface ModernKanbanColumnProps {
  title: string;
  tasks: ModernTask[];
  color: string;
  density?: 'comfort' | 'compact';
  hoveredTaskId?: string | null;
  onHoverTask?: (taskId: string | null) => void;
  onAddTask?: () => void;
  onDrop: (taskId: string) => void;
  onTaskClick?: (taskId: string) => void;
  onStatusChange?: (taskId: string, newStatus: string) => void;
  onPriorityChange?: (taskId: string, newPriority: 'urgent' | 'high' | 'medium' | 'low') => void;
}

export function ModernKanbanColumn({
  title,
  tasks,
  color,
  density = 'comfort',
  hoveredTaskId,
  onHoverTask,
  onAddTask,
  onDrop,
  onTaskClick,
  onStatusChange,
  onPriorityChange,
}: ModernKanbanColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'MODERN_TASK',
    drop: (item: { id: string }) => onDrop(item.id),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return drop(
    <div className="flex w-80 shrink-0 flex-col snap-center">
      {/* Column Header */}
      <div className="mb-3 flex items-center justify-between rounded-2xl border border-gray-200/80 bg-white px-4 py-3 shadow-xs dark:border-gray-800 dark:bg-[#161b22]">
        <div className="flex items-center gap-2.5">
          <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-lg bg-gray-100 px-1.5 font-mono text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddTask?.();
            }}
            aria-label={`Add task to ${title}`}
            title={`Add task to ${title}`}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <Plus size={16} />
          </button>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            aria-label={`${title} column options`}
            title={`${title} column options`}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <Ellipsis size={16} />
          </button>
        </div>
      </div>

      {/* Column Task List */}
      <div
        className={`flex-1 space-y-3 rounded-2xl bg-gray-50/60 p-3 transition-colors dark:bg-[#0d1117]/60 ${
          isOver ? 'bg-indigo-50/50 ring-2 ring-indigo-500/40 dark:bg-indigo-950/20' : ''
        }`}
      >
        {tasks.map((task) => {
          const isTaskHovered = hoveredTaskId === task.id;
          const isRelatedToHovered =
            hoveredTaskId &&
            (task.blocked_by === hoveredTaskId ||
              tasks.some((t) => t.id === hoveredTaskId && t.blocked_by === task.id));
          const shouldDim = hoveredTaskId !== null && !isTaskHovered && !isRelatedToHovered;
          const shouldHighlight = Boolean(isTaskHovered || isRelatedToHovered);

          return (
            <ModernTaskCard
              key={task.id}
              task={task}
              density={density}
              isDimmed={shouldDim}
              isHighlighted={shouldHighlight}
              onHover={onHoverTask}
              onStatusChange={onStatusChange}
              onPriorityChange={onPriorityChange}
              onClick={() => onTaskClick && onTaskClick(task.id)}
            />
          );
        })}

        {tasks.length === 0 && (
          <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-gray-200 text-xs text-gray-400 dark:border-gray-800">
            No cards in this stage
          </div>
        )}
      </div>
    </div>
  );
}