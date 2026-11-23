import { useState, useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import {
  Calendar,
  MessageSquare,
  Paperclip,
  Ellipsis,
  GitBranch,
  Copy,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import AvatarWithFrame, { type AvatarFrameId } from './AvatarWithFrame';

export interface TaskAssignee {
  name: string;
  avatar: string;
  frame?: AvatarFrameId;
}

export interface ModernTask {
  id: string;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignees: TaskAssignee[];
  dueDate: string;
  comments: number;
  attachments: number;
  tags: string[];
  blocked_by?: string | null;
  blocker_title?: string | null;
  blocker_status?: string | null;
}

interface ModernTaskCardProps {
  task: ModernTask;
  density?: 'comfort' | 'compact';
  isDimmed?: boolean;
  isHighlighted?: boolean;
  onHover?: (taskId: string | null) => void;
  onStatusChange?: (taskId: string, newStatus: string) => void;
  onPriorityChange?: (taskId: string, newPriority: 'urgent' | 'high' | 'medium' | 'low') => void;
  onClick?: () => void;
}

const priorityLeftAccents = {
  urgent: 'border-l-4 border-l-rose-500',
  high: 'border-l-4 border-l-orange-500',
  medium: 'border-l-4 border-l-blue-500',
  low: 'border-l-4 border-l-slate-400',
};

const priorityStyles = {
  urgent:
    'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 ring-1 ring-rose-200 dark:ring-rose-800/40',
  high:
    'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 ring-1 ring-orange-200 dark:ring-orange-800/40',
  medium:
    'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800/40',
  low:
    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 ring-1 ring-gray-200 dark:ring-gray-700',
};

export function ModernTaskCard({
  task,
  density = 'comfort',
  isDimmed = false,
  isHighlighted = false,
  onHover,
  onStatusChange,
  onPriorityChange,
  onClick,
}: ModernTaskCardProps) {
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'MODERN_TASK',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenuPos(null);
      }
    };
    if (contextMenuPos) {
      window.addEventListener('mousedown', handleOutsideClick);
      window.addEventListener('scroll', () => setContextMenuPos(null), true);
    }
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [contextMenuPos]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  const copyBranchName = (e: React.MouseEvent) => {
    e.stopPropagation();
    const branch = `feat/task-${task.id.slice(0, 6)}-${task.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}`;
    navigator.clipboard.writeText(branch);
    toast.success('Git branch name copied to clipboard');
    setContextMenuPos(null);
  };

  const copyTaskLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/tasks?id=${task.id}`);
    toast.success('Task link copied to clipboard');
    setContextMenuPos(null);
  };

  const handleCyclePriority = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cycle: Record<ModernTask['priority'], ModernTask['priority']> = {
      low: 'medium',
      medium: 'high',
      high: 'urgent',
      urgent: 'low',
    };
    const nextPriority = cycle[task.priority];
    if (onPriorityChange) {
      onPriorityChange(task.id, nextPriority);
      toast.success(`Priority set to ${nextPriority}`);
    }
    setContextMenuPos(null);
  };

  return drag(
    <div
      onClick={onClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => onHover && onHover(task.id)}
      onMouseLeave={() => onHover && onHover(null)}
      className={`group cursor-pointer rounded-2xl border border-gray-200/80 bg-white shadow-xs transition-all duration-200 select-none relative dark:border-gray-800/80 dark:bg-[#161b22] ${
        priorityLeftAccents[task.priority]
      } ${
        isDragging
          ? 'opacity-30 scale-95 rotate-1'
          : 'opacity-100 hover:border-indigo-500/40 hover:shadow-xl'
      } ${isDimmed ? 'opacity-30 filter grayscale' : ''} ${
        isHighlighted ? 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20' : ''
      } ${density === 'compact' ? 'p-3' : 'p-4 sm:p-5'}`}
    >
      {/* Dependency Blocker Indicator */}
      {task.blocked_by && task.blocker_status !== 'done' && (
        <div className="mb-2 flex w-fit items-center gap-1.5 rounded-md bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-500 dark:text-amber-400">
          <ShieldAlert size={12} className="shrink-0" />
          <span className="max-w-[200px] truncate">
            Blocked by {task.blocker_title || 'predecessor'}
          </span>
        </div>
      )}

      {/* Header and Title */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4
          className={`font-semibold leading-snug text-gray-900 line-clamp-2 dark:text-gray-100 ${
            density === 'compact' ? 'text-xs' : 'text-sm'
          }`}
        >
          {task.title}
        </h4>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setContextMenuPos({ x: e.clientX, y: e.clientY });
          }}
          aria-label={`Task actions for ${task.title}`}
          title="Task actions"
          className="shrink-0 rounded-lg p-1 text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 group-hover:opacity-100 dark:hover:bg-gray-800"
        >
          <Ellipsis size={15} />
        </button>
      </div>

      {/* Description in Comfort Mode Only */}
      {density === 'comfort' && task.description && (
        <p className="mb-3 text-xs leading-relaxed text-gray-500 line-clamp-2 dark:text-gray-400">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags.length > 0 && density === 'comfort' && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-1 text-xs">
        {/* Assignees */}
        <div className="flex -space-x-1.5 items-center">
          {task.assignees.length > 0 ? (
            task.assignees.map((assignee, idx) => (
              <div
                key={`${assignee.name}-${idx}`}
                title={assignee.name}
                className="rounded-full ring-2 ring-white dark:ring-[#161b22]"
              >
                <AvatarWithFrame
                  src={assignee.avatar || '/pfp.jpg'}
                  alt={assignee.name}
                  shape="circle"
                  frame={assignee.frame || 'blue-sparkles'}
                  size={24}
                />
              </div>
            ))
          ) : (
            <span className="font-mono text-[10px] text-gray-400">Unassigned</span>
          )}
        </div>

        {/* Priority Badge and Meta Counters */}
        <div className="flex items-center gap-2.5">
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              priorityStyles[task.priority]
            }`}
          >
            {task.priority}
          </span>

          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            {task.comments > 0 && (
              <span className="flex items-center gap-0.5">
                <MessageSquare size={12} />
                <span>{task.comments}</span>
              </span>
            )}
            {task.attachments > 0 && (
              <span className="flex items-center gap-0.5">
                <Paperclip size={12} />
                <span>{task.attachments}</span>
              </span>
            )}
            {task.dueDate && task.dueDate !== 'No date' && (
              <span className="flex items-center gap-0.5 text-gray-500 dark:text-gray-400">
                <Calendar size={12} />
                <span>{task.dueDate}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Custom Context Menu */}
      {contextMenuPos && (
        <div
          ref={contextMenuRef}
          style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
          className="fixed z-50 w-52 space-y-1 rounded-2xl border border-gray-200 bg-white p-1.5 text-xs text-gray-700 shadow-2xl animate-in fade-in zoom-in-95 duration-100 dark:border-gray-700/80 dark:bg-[#1c2128] dark:text-gray-200"
        >
          <div className="border-b border-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase text-gray-400 dark:border-gray-800">
            Quick Triage
          </div>

          <button
            type="button"
            onClick={handleCyclePriority}
            className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40"
          >
            <span>Cycle Priority</span>
            <span className="font-mono text-[10px] font-bold uppercase text-gray-400">
              {task.priority}
            </span>
          </button>

          <button
            type="button"
            onClick={copyBranchName}
            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40"
          >
            <GitBranch size={13} className="text-gray-400" />
            <span>Copy Git Branch</span>
          </button>

          <button
            type="button"
            onClick={copyTaskLink}
            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40"
          >
            <Copy size={13} className="text-gray-400" />
            <span>Copy Task Link</span>
          </button>

          {onStatusChange && (
            <div className="space-y-0.5 border-t border-gray-100 pt-1 dark:border-gray-800">
              <span className="block px-2.5 py-0.5 text-[10px] font-bold uppercase text-gray-400">
                Move Column
              </span>
              {(['todo', 'in_progress', 'review', 'done'] as const).map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(task.id, col);
                    setContextMenuPos(null);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1 text-[11px] capitalize transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span>{col.replace('_', ' ')}</span>
                  <ArrowRight size={11} className="text-gray-400" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}