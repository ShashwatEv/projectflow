import { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  CheckCircle2,
  Trash2,
  FolderKanban,
  Loader2,
  MessageSquare,
  AtSign,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { triggerHaptic } from '../../lib/haptics';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

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

interface TaskComment {
  id: string;
  user_id: string;
  content: string;
  mentioned_user_ids: string[];
  created_at: string;
  author_name: string;
  author_avatar?: string;
}

interface MentionableUser {
  id: string;
  name: string;
}

export default function TaskDetailModal({
  taskId,
  onClose,
  onUpdate,
}: TaskDetailModalProps) {
  const { user } = useAuth();
  const [task, setTask] = useState<TaskRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskRecord['status']>('todo');
  const [priority, setPriority] = useState<TaskRecord['priority']>('medium');
  const [dueDate, setDueDate] = useState('');
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const [mentionableUsers, setMentionableUsers] = useState<MentionableUser[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSaving, setCommentSaving] = useState(false);

  const loadComments = async (id: string) => {
    setCommentsLoading(true);
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .select('id, user_id, content, mentioned_user_ids, created_at')
        .eq('task_id', id)
        .order('created_at', { ascending: true });
      if (error) throw error;

      const userIds = [...new Set((data || []).map((comment) => comment.user_id))];
      const { data: authors, error: authorsError } = userIds.length
        ? await supabase.from('user_profiles').select('id, name, avatar').in('id', userIds)
        : { data: [], error: null };
      if (authorsError) throw authorsError;
      const authorById = new Map((authors || []).map((author) => [author.id, author]));

      setComments(
        (data || []).map((comment) => {
          const author = authorById.get(comment.user_id);
          return {
            ...comment,
            mentioned_user_ids: comment.mentioned_user_ids || [],
            author_name: author?.name || 'Workspace member',
            author_avatar: author?.avatar || undefined,
          };
        })
      );
    } catch (error) {
      console.error('Failed to load task comments:', error);
      toast.error('Could not load task comments');
    } finally {
      setCommentsLoading(false);
    }
  };

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
    loadComments(taskId);
  }, [taskId]);

  useEffect(() => {
    let active = true;
    supabase
      .from('user_profiles')
      .select('id, name')
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load users for task mentions:', error);
          return;
        }
        if (active) setMentionableUsers(data || []);
      });
    return () => {
      active = false;
    };
  }, []);

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

  const handleAddComment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!taskId || !user || !commentText.trim()) return;

    setCommentSaving(true);
    const content = commentText.trim();
    try {
      const { error } = await supabase.from('task_comments').insert({
        task_id: taskId,
        user_id: user.id,
        content,
        mentioned_user_ids: mentionedUserIds,
      });
      if (error) throw error;

      setCommentText('');
      setMentionedUserIds([]);
      await loadComments(taskId);
      onUpdate();
      triggerHaptic('success');

      const mentionRecipients = mentionedUserIds.filter((id) => id !== user.id);
      const commentRecipient = task?.assigned_to && task.assigned_to !== user.id && !mentionRecipients.includes(task.assigned_to)
        ? task.assigned_to
        : null;
      const preferenceIds = [...new Set([...mentionRecipients, ...(commentRecipient ? [commentRecipient] : [])])];
      if (preferenceIds.length) {
        const { data: notificationPrefs, error: preferencesError } = await supabase
          .from('user_notification_preferences')
          .select('user_id, mentions, new_comments')
          .in('user_id', preferenceIds);
        if (preferencesError) {
          console.error('Could not check mention notification preferences:', preferencesError);
          toast.warning('Comment posted, but notification preferences could not be checked.');
          return;
        }

        const preferencesByUser = new Map((notificationPrefs || []).map((preference) => [preference.user_id, preference]));
        const notificationRows = [
          ...mentionRecipients
            .filter((id) => preferencesByUser.get(id)?.mentions !== false)
            .map((userId) => ({
              user_id: userId,
              title: 'You were mentioned in a task',
              message: `${user.name || 'A teammate'} mentioned you on “${task?.title || 'a task'}”.`,
              type: 'task',
              is_read: false,
            })),
          ...(commentRecipient && preferencesByUser.get(commentRecipient)?.new_comments !== false
            ? [{
                user_id: commentRecipient,
                title: 'New comment on your task',
                message: `${user.name || 'A teammate'} commented on “${task?.title || 'a task'}”.`,
                type: 'task',
                is_read: false,
              }]
            : []),
        ];
        if (notificationRows.length) {
          const { error: notificationError } = await supabase.from('notifications').insert(
            notificationRows
          );
          if (notificationError) {
            console.error('Failed to send task mention notifications:', notificationError);
            toast.warning('Comment posted, but mention notifications could not be sent.');
            return;
          }
        }
      }

      toast.success('Comment added');
    } catch (error) {
      console.error('Failed to add task comment:', error);
      toast.error('Failed to add comment. Apply the collaboration database migration if needed.');
    } finally {
      setCommentSaving(false);
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

              <section className="border-t border-gray-100 pt-4 dark:border-gray-800" aria-labelledby="task-comments-heading">
                <div className="mb-3 flex items-center justify-between">
                  <h3 id="task-comments-heading" className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                    <MessageSquare size={15} className="text-indigo-500" />
                    Discussion
                    <span className="text-xs font-medium text-gray-400">{comments.length}</span>
                  </h3>
                </div>

                <div className="mb-4 max-h-52 space-y-3 overflow-y-auto pr-1">
                  {commentsLoading ? (
                    <p className="text-xs text-gray-400">Loading comments…</p>
                  ) : comments.length ? (
                    comments.map((comment) => (
                      <article key={comment.id} className="rounded-xl border border-gray-100 bg-gray-50/80 p-3 dark:border-gray-800 dark:bg-gray-900/60">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{comment.author_name}</span>
                          <time className="shrink-0 text-[10px] text-gray-400" dateTime={comment.created_at}>
                            {new Date(comment.created_at).toLocaleString()}
                          </time>
                        </div>
                        <p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-gray-600 dark:text-gray-300">{comment.content}</p>
                      </article>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400">No comments yet. Start the task discussion.</p>
                  )}
                </div>

                <form onSubmit={handleAddComment} className="space-y-2">
                  <textarea
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    rows={2}
                    maxLength={4000}
                    aria-label="Write a task comment"
                    placeholder="Write a comment…"
                    className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="flex min-w-0 items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <AtSign size={13} />
                      <span className="sr-only">Mention a teammate</span>
                      <select
                        value=""
                        aria-label="Mention a teammate"
                        onChange={(event) => {
                          const id = event.target.value;
                          if (id && !mentionedUserIds.includes(id)) {
                            setMentionedUserIds((current) => [...current, id]);
                          }
                        }}
                        className="max-w-40 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
                      >
                        <option value="">Mention teammate</option>
                        {mentionableUsers
                          .filter((member) => member.id !== user?.id && !mentionedUserIds.includes(member.id))
                          .map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                      </select>
                    </label>
                    <button
                      type="submit"
                      disabled={commentSaving || !commentText.trim()}
                      className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {commentSaving ? 'Posting…' : 'Post comment'}
                    </button>
                  </div>
                  {mentionedUserIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {mentionedUserIds.map((id) => {
                        const member = mentionableUsers.find((candidate) => candidate.id === id);
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setMentionedUserIds((current) => current.filter((value) => value !== id))}
                            aria-label={`Remove mention for ${member?.name || 'teammate'}`}
                            className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                          >
                            @{member?.name || 'teammate'} ×
                          </button>
                        );
                      })}
                    </div>
                  )}
                </form>
              </section>
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