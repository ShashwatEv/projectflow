import { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  Trash2,
  FolderKanban,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { triggerHaptic } from '../../lib/haptics';
import { toast } from 'sonner';

interface TaskDetailModalProps {
  taskId: string | null;
  onClose: () => void;
  onUpdate: () => void;
}

interface TaskRecord {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'inProgress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  project?: { name: string };
  assigned_to?: string;
}

export default function TaskDetailModal({
  taskId,
  onClose,
  onUpdate,
}: TaskDetailModalProps) {
  const [task, setTask] = useState<TaskRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskRecord['status']>('todo');
  const [priority, setPriority] = useState<TaskRecord['priority']>('medium');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (!taskId) {
      setTask(null);
      return;
    }

    const loadTask = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*, project:projects(name)')
          .eq('id', taskId)
          .single();

        if (error) throw error;
        if (data) {
          setTask(data);
          setTitle(data.title || '');
          setDescription(data.description || '');
          setStatus(data.status || 'todo');
          setPriority(data.priority || 'medium');
          setDueDate(data.due_date ? data.due_date.split('T')[0] : '');
        }
      } catch {
        toast.error('Failed to load task details');
        onClose();
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [taskId]);

  if (!taskId) return null;

  const handleSave = async () => {
    if (!taskId || !title.trim()) return;
    setSaving(true);
    triggerHaptic('tap');

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: title.trim(),
          description: description.trim(),
          status,
          priority,
          due_date: dueDate ? new Date(dueDate).toISOString() : null,
        })
        .eq('id', taskId);

      if (error) throw error;

      triggerHaptic('success');
      toast.success('Task updated');
      onUpdate();
      onClose();
    } catch {
      triggerHaptic('error');
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!taskId) return;
    triggerHaptic('warning');

    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;

      toast.success('Task deleted');
      onUpdate();
      onClose();
    } catch {
      triggerHaptic('error');
      toast.error('Failed to delete task');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={() => {
          triggerHaptic('tap');
          onClose();
        }}
      />

      <div className="relative z-10 w-full md:max-w-xl bg-white dark:bg-[#161b22] border-t md:border border-gray-200 dark:border-gray-800 rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] md:max-h-[85vh] animate-in slide-in-from-bottom-8 md:zoom-in-95 duration-200">
        {/* Mobile top grab handle */}
        <div className="flex md:hidden justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
        </div>

        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 truncate">
            <FolderKanban size={14} className="text-indigo-500 shrink-0" />
            <span className="truncate">{task?.project?.name ?? 'Assigned Task'}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('tap');
              onClose();
            }}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 touch-scroll-smooth">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400 text-xs">
              <Loader2 size={20} className="animate-spin text-indigo-500" />
              <span>Fetching details...</span>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add context, acceptance criteria or steps..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskRecord['status'])}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white outline-none focus:border-indigo-500"
                  >
                    <option value="todo">To Do</option>
                    <option value="inProgress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskRecord['priority'])}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white outline-none focus:border-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Due Date
                </label>
                <div className="relative">
                  <Calendar
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal actions footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 bg-gray-50 dark:bg-[#12161f]">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('tap');
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving || !title.trim()}
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <CheckCircle2 size={13} />
              )}
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}