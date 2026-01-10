import { useState, useEffect } from 'react';
import { X, Send, User, Clock, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: { name: string; avatar: string };
}

interface TaskDetailModalProps {
  taskId: string | null;
  onClose: () => void;
  onUpdate: () => void; // Refresh Kanban after edit
}

export default function TaskDetailModal({ taskId, onClose, onUpdate }: TaskDetailModalProps) {
  const { user } = useAuth();
  const [task, setTask] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  if (!taskId) return null;

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    setLoading(true);
    // 1. Fetch Task Info
    const { data: taskData } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (taskData) {
      setTask(taskData);
      setDescription(taskData.description || '');
    }

    // 2. Fetch Comments
    const { data: commentData } = await supabase
      .from('comments')
      .select('*, user:users(name, avatar)')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (commentData) setComments(commentData);
    setLoading(false);
  };

  const saveDescription = async () => {
    await supabase.from('tasks').update({ description }).eq('id', taskId);
    onUpdate(); // Notify parent
  };

  const postComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    const { error } = await supabase.from('comments').insert({
      task_id: taskId,
      user_id: user.id,
      content: newComment
    });

    if (!error) {
      setNewComment('');
      fetchTaskDetails(); // Refresh comments
    }
  };

  const deleteTask = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      await supabase.from('tasks').delete().eq('id', taskId);
      onUpdate();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start bg-gray-50 dark:bg-gray-900/50">
          {loading ? (
             <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{task.title}</h2>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <span className={`px-2 py-0.5 rounded uppercase font-bold ${
                  task.priority === 'high' ? 'bg-red-100 text-red-600' : 
                  task.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 
                  'bg-blue-100 text-blue-600'
                }`}>
                  {task.priority}
                </span>
                <span>• In {task.status}</span>
              </div>
            </div>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Description Section */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              Description
            </h3>
            <textarea
              className="w-full min-h-[100px] p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none dark:text-gray-200"
              placeholder="Add a more detailed description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={saveDescription} // Auto-save on click away
            />
            <p className="text-xs text-gray-400 mt-1">Changes are saved automatically when you click outside.</p>
          </section>

          {/* Comments Section */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              Activity & Comments
            </h3>
            
            <div className="space-y-4 mb-6">
              {comments.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No comments yet.</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
                      {comment.user?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-r-xl rounded-bl-xl text-sm text-gray-700 dark:text-gray-200">
                        <span className="font-bold text-gray-900 dark:text-white mr-2">{comment.user?.name}</span>
                        {comment.content}
                      </div>
                      <span className="text-[10px] text-gray-400 ml-1 mt-1 block">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <form onSubmit={postComment} className="flex gap-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-900 dark:text-white"
              />
              <button disabled={!newComment.trim()} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                <Send size={18} />
              </button>
            </form>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
          <button 
            onClick={deleteTask}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 px-4 py-2 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 size={16} /> Delete Task
          </button>
        </div>

      </div>
    </div>
  );
}