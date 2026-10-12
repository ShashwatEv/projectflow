import { useState, useRef } from 'react';
import { Check, Trash2, Calendar, MessageSquare } from 'lucide-react';
import { triggerHaptic } from '../../lib/haptics';

interface SwipeableTaskItemProps {
  task: {
    id: string;
    title: string;
    status: string;
    priority: string;
    due_date?: string;
    comments_count?: number;
  };
  onToggleDone: (taskId: string, isDone: boolean) => void;
  onDelete: (taskId: string) => void;
  onClick: () => void;
}

export default function SwipeableTaskItem({
  task,
  onToggleDone,
  onDelete,
  onClick,
}: SwipeableTaskItemProps) {
  const [offsetX, setOffsetX] = useState(0);
  const startXRef = useRef(0);
  const isSwipingRef = useRef(false);

  const isDone = task.status === 'done';

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      startXRef.current = touch.clientX;
      isSwipingRef.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwipingRef.current) return;
    const touch = e.touches[0];
    if (!touch) return;

    const diff = touch.clientX - startXRef.current;
    if (Math.abs(diff) > 8) {
      setOffsetX(Math.max(-110, Math.min(110, diff)));
    }
  };

  const handleTouchEnd = () => {
    isSwipingRef.current = false;
    if (offsetX > 70) {
      triggerHaptic('success');
      onToggleDone(task.id, !isDone);
    } else if (offsetX < -70) {
      triggerHaptic('warning');
      onDelete(task.id);
    }
    setOffsetX(0);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl select-none">
      <div
        className={`absolute inset-0 flex items-center justify-between px-6 transition-colors ${
          offsetX > 0
            ? 'bg-emerald-600/90 text-white'
            : offsetX < 0
            ? 'bg-rose-600/90 text-white'
            : 'bg-transparent'
        }`}
      >
        <div className="flex items-center gap-2 font-bold text-xs">
          <Check size={18} />
          <span>{isDone ? 'Mark To Do' : 'Complete'}</span>
        </div>
        <div className="flex items-center gap-2 font-bold text-xs">
          <span>Delete</span>
          <Trash2 size={18} />
        </div>
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={onClick}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isSwipingRef.current ? 'none' : 'transform 0.2s ease-out',
        }}
        className={`relative bg-white dark:bg-[#161b22] border border-gray-200/80 dark:border-gray-800 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-xs ${
          isDone ? 'opacity-60' : 'opacity-100'
        }`}
      >
        <div className="flex items-center gap-3 truncate">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic('tap');
              onToggleDone(task.id, !isDone);
            }}
            className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
              isDone
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-gray-300 dark:border-gray-700 bg-transparent'
            }`}
          >
            {isDone && <Check size={13} />}
          </button>

          <div className="truncate">
            <h4
              className={`text-xs font-semibold text-gray-900 dark:text-gray-100 truncate ${
                isDone ? 'line-through text-gray-400 dark:text-gray-500' : ''
              }`}
            >
              {task.title}
            </h4>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-mono">
              <span className="uppercase font-bold text-indigo-500 dark:text-indigo-400">
                {task.priority}
              </span>
              {task.due_date && (
                <span className="flex items-center gap-1 text-gray-500">
                  <Calendar size={10} />
                  <span>{new Date(task.due_date).toLocaleDateString()}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {task.comments_count ? (
          <div className="flex items-center gap-1 text-[11px] text-gray-400 font-mono shrink-0">
            <MessageSquare size={12} />
            <span>{task.comments_count}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}