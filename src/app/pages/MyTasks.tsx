import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Circle, Clock, Trash2, Plus,
  ArrowUpDown, ChevronLeft, ChevronRight, X,
  LayoutGrid, List, ArrowRight, FolderKanban,
  ShieldAlert, UserCheck, User, PanelRightClose, PanelRightOpen
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { triggerHaptic } from '../../lib/haptics';
import PullToRefresh from '../components/PullToRefresh';
import TaskSkeleton from '../components/TaskSkeleton';
import TaskDetailModal from '../components/TaskDetailModal';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'inProgress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at?: string;
  project_id?: string;
  project?: { name: string };
  assigned_to?: string;
  assignee?: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
}

const COLUMNS: { id: Task['status']; label: string; dot: string; color: string }[] = [
  { id: 'todo', label: 'To Do', dot: 'bg-gray-400', color: 'text-gray-700 dark:text-gray-300' },
  { id: 'inProgress', label: 'In Progress', dot: 'bg-indigo-500', color: 'text-indigo-700 dark:text-indigo-400' },
  { id: 'review', label: 'Review', dot: 'bg-amber-500', color: 'text-amber-700 dark:text-amber-400' },
  { id: 'done', label: 'Done', dot: 'bg-emerald-500', color: 'text-emerald-700 dark:text-emerald-400' },
];

function FilterBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={() => {
        triggerHaptic('tap');
        onClick();
      }}
      aria-pressed={active}
      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
        active
          ? 'bg-indigo-600 text-white shadow-sm'
          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}

const priorityScore: Record<string, number> = { high: 3, medium: 2, low: 1 };

function parseDueDate(value: string) {
  return new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);
}

function getDueLabel(value: string, now = new Date()) {
  const dueDate = parseDueDate(value);
  if (Number.isNaN(dueDate.getTime())) return null;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const daysUntilDue = Math.round((dueDay.getTime() - today.getTime()) / 86_400_000);

  if (daysUntilDue < 0) return { text: 'Overdue', className: 'text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/40' };
  if (daysUntilDue === 0) return { text: 'Due today', className: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/40' };
  if (daysUntilDue === 1) return { text: 'Due tomorrow', className: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/40' };
  if (daysUntilDue <= 3) return { text: `Due in ${daysUntilDue} days`, className: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/40' };
  return null;
}

export default function MyTasks() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasRole, setHasRole] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string>('');

  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [newTaskInput, setNewTaskInput] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');

  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeModalTaskId, setActiveModalTaskId] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(true);

  useEffect(() => {
    async function verifyUserRole() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error || !data?.role || data.role.trim() === '' || data.role.toLowerCase() === 'unassigned') {
          setHasRole(false);
        } else {
          setHasRole(true);
          setUserRole(data.role);
        }
      } catch {
        setHasRole(false);
      }
    }

    verifyUserRole();
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, project:projects(name), assignee:users(id, name, avatar, role)')
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setTasks(data as Task[]);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchTasks();

    const channel = supabase
      .channel(`my_tasks_${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `assigned_to=eq.${user.id}` },
        () => fetchTasks()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const changeMonth = (offset: number) => {
    triggerHaptic('tap');
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim() || !user) return;

    const title = newTaskInput.trim();
    setNewTaskInput('');
    triggerHaptic('tap');

    const tempId = `temp_${Date.now()}`;
    const optimisticTask: Task = {
      id: tempId,
      title,
      status: 'todo',
      priority: 'medium',
      due_date: selectedDate ? selectedDate.toISOString() : undefined,
      assigned_to: user.id,
      created_at: new Date().toISOString(),
    };

    setTasks(prev => [optimisticTask, ...prev]);

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title,
          status: 'todo',
          priority: 'medium',
          due_date: selectedDate ? selectedDate.toISOString() : null,
          assigned_to: user.id,
        })
        .select('*, project:projects(name), assignee:users(id, name, avatar, role)')
        .single();

      if (error) throw error;
      if (data) {
        setTasks(prev => prev.map(t => t.id === tempId ? (data as Task) : t));
        toast.success('Task created successfully');
        triggerHaptic('success');
      }
    } catch {
      setTasks(prev => prev.filter(t => t.id !== tempId));
      toast.error('Failed to create task');
    }
  };

  const toggleTaskComplete = async (taskId: string, isCurrentlyDone: boolean) => {
    const previousTasks = [...tasks];
    const newStatus: Task['status'] = isCurrentlyDone ? 'todo' : 'done';

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    triggerHaptic(isCurrentlyDone ? 'tap' : 'success');

    try {
      const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
      if (error) throw error;
      toast.success(isCurrentlyDone ? 'Task marked as pending' : 'Task completed');
    } catch {
      setTasks(previousTasks);
      toast.error('Failed to update task');
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: Task['status']) => {
    const previousTasks = [...tasks];
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    triggerHaptic('tap');

    try {
      const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
      if (error) throw error;
      toast.success(`Moved to ${COLUMNS.find(c => c.id === newStatus)?.label}`);
    } catch {
      setTasks(previousTasks);
      toast.error('Failed to update status');
    }
  };

  const toggleTaskSelection = (id: string) => {
    triggerHaptic('tap');
    setSelectedTasks(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const deleteSelected = async () => {
    if (!window.confirm(`Delete ${selectedTasks.length} selected tasks?`)) return;
    triggerHaptic('warning');
    const toDelete = [...selectedTasks];
    const previousTasks = [...tasks];

    setSelectedTasks([]);
    setTasks(prev => prev.filter(t => !toDelete.includes(t.id)));

    try {
      const { error } = await supabase.from('tasks').delete().in('id', toDelete);
      if (error) throw error;
      toast.success('Selected tasks deleted');
    } catch {
      setTasks(previousTasks);
      toast.error('Failed to delete tasks');
    }
  };

  const markSelectedComplete = async () => {
    triggerHaptic('success');
    const toComplete = [...selectedTasks];
    const previousTasks = [...tasks];

    setSelectedTasks([]);
    setTasks(prev => prev.map(t => toComplete.includes(t.id) ? { ...t, status: 'done' } : t));

    try {
      const { error } = await supabase.from('tasks').update({ status: 'done' }).in('id', toComplete);
      if (error) throw error;
      toast.success('Selected tasks completed');
    } catch {
      setTasks(previousTasks);
      toast.error('Failed to update tasks');
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'high': return 'text-red-500 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900';
      case 'medium': return 'text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900';
      default: return 'text-blue-500 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900';
    }
  };

  const processedTasks = tasks
    .filter(t => {
      if (selectedDate && (!t.due_date || !isSameDay(parseDueDate(t.due_date), selectedDate))) {
        return false;
      }
      if (filter === 'pending') return t.status !== 'done';
      if (filter === 'completed') return t.status === 'done';
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityDifference = (priorityScore[b.priority] || 1) - (priorityScore[a.priority] || 1);
        if (priorityDifference) return priorityDifference;
      }
      if (!a.due_date) return b.due_date ? 1 : 0;
      if (!b.due_date) return -1;
      return parseDueDate(a.due_date).getTime() - parseDueDate(b.due_date).getTime();
    });

  const getNextStatus = (current: Task['status']): Task['status'] | null => {
    switch (current) {
      case 'todo': return 'inProgress';
      case 'inProgress': return 'review';
      case 'review': return 'done';
      case 'done': return null;
      default: return null;
    }
  };

  const pendingCount = tasks.filter(t => t.status !== 'done').length;
  const completedCount = tasks.filter(t => t.status === 'done').length;

  return (
    <PullToRefresh onRefresh={fetchTasks}>
      <div className="flex h-full">
        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto flex flex-col h-full relative custom-scrollbar">
          {hasRole === false && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
              <span className="flex items-center gap-2">
                <ShieldAlert size={15} className="shrink-0" />
                Your role is not configured. You can still manage tasks; add a role to complete your profile.
              </span>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="inline-flex items-center gap-1 font-bold underline underline-offset-2"
              >
                <UserCheck size={14} /> Complete profile
              </button>
            </div>
          )}

          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">My Tasks</h1>
                {userRole && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    {userRole}
                  </span>
                )}
              </div>
              {selectedDate ? (
                <button
                  type="button"
                  aria-label="Clear due date filter"
                  className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1.5 font-medium hover:underline"
                  onClick={() => {
                    triggerHaptic('tap');
                    setSelectedDate(null);
                  }}
                >
                  Filtered for {selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} <X size={13} />
                </button>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Showing deliverables assigned to your account. Tap any item to inspect details.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-1 bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mr-2">
                <button
                  onClick={() => {
                    triggerHaptic('tap');
                    setViewMode('list');
                  }}
                  aria-label="List view"
                  aria-pressed={viewMode === 'list'}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => {
                    triggerHaptic('tap');
                    setViewMode('board');
                  }}
                  aria-label="Board view"
                  aria-pressed={viewMode === 'board'}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'board' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <LayoutGrid size={16} />
                </button>
              </div>

              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setSortBy(sortBy === 'date' ? 'priority' : 'date');
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowUpDown size={13} />
                Sort: {sortBy === 'date' ? 'Due Date' : 'Priority'}
              </button>

              <FilterBtn label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
              <FilterBtn label="Pending" active={filter === 'pending'} onClick={() => setFilter('pending')} />
              <FilterBtn label="Done" active={filter === 'completed'} onClick={() => setFilter('completed')} />
              <button
                type="button"
                onClick={() => setIsCalendarOpen(open => !open)}
                aria-label={isCalendarOpen ? 'Hide task calendar' : 'Show task calendar'}
                aria-expanded={isCalendarOpen}
                className="hidden xl:inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {isCalendarOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
                {isCalendarOpen ? 'Hide calendar' : 'Show calendar'}
              </button>
            </div>
          </div>

          {/* Quick Add Task Input */}
          <form onSubmit={addTask} className="mb-6 relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Plus className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            </div>
            <input
              type="text"
              value={newTaskInput}
              onChange={(e) => setNewTaskInput(e.target.value)}
              aria-label="New task title"
              placeholder="Add a new task assigned to you..."
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 rounded-xl shadow-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-all text-sm"
            />
          </form>

          {/* SKELETON LOADER STATE */}
          {loading ? (
            <TaskSkeleton />
          ) : viewMode === 'list' ? (
            /* LIST VIEW */
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1 mb-16">
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {processedTasks.map((task) => {
                  const isDone = task.status === 'done';
                  const isSelected = selectedTasks.includes(task.id);
                  const isMine = task.assigned_to === user?.id;
                  const dueLabel = !isDone && task.due_date ? getDueLabel(task.due_date) : null;

                  return (
                    <div
                      key={task.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 transition-colors group cursor-pointer ${
                        isSelected ? 'bg-indigo-50/60 dark:bg-indigo-950/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'
                      }`}
                      onClick={() => {
                        triggerHaptic('tap');
                        setActiveModalTaskId(task.id);
                      }}
                    >
                      <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-2">
                        <div onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleTaskSelection(task.id)}
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            toggleTaskComplete(task.id, isDone); 
                          }}
                          className={`shrink-0 transition-transform active:scale-90 ${isDone ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600 hover:text-indigo-500'}`}
                        >
                          {isDone ? <CheckCircle2 size={22} className="fill-emerald-50 dark:fill-emerald-950/40" /> : <Circle size={22} />}
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`font-semibold text-sm text-gray-900 dark:text-white truncate transition-all ${isDone ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                              {task.title}
                            </h3>

                            {isMine ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> You
                              </span>
                            ) : task.assignee?.name ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 shrink-0">
                                <User size={10} /> {task.assignee.name}
                              </span>
                            ) : null}
                          </div>

                          <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                            {task.project?.name ? (
                              <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                                <FolderKanban size={11} /> {task.project.name}
                              </span>
                            ) : (
                              <span>Inbox</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-7 sm:pl-0" onClick={(e) => e.stopPropagation()}>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityBadge(task.priority)}`}>
                          {task.priority}
                        </span>

                        {task.due_date && (
                          <div className="flex items-center gap-1.5">
                            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                              <Clock size={12} />
                              <span>{parseDueDate(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            </span>
                            {dueLabel && (
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${dueLabel.className}`}>
                                {dueLabel.text}
                              </span>
                            )}
                          </div>
                        )}

                        <select
                          aria-label={`Status for ${task.title}`}
                          value={task.status}
                          onChange={(e) => handleUpdateStatus(task.id, e.target.value as Task['status'])}
                          className="text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg px-2 py-1 outline-none border border-transparent focus:border-indigo-500 cursor-pointer"
                        >
                          {COLUMNS.map(col => (
                            <option key={col.id} value={col.id}>{col.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}

                {processedTasks.length === 0 && (
                  <div className="py-16 flex flex-col items-center gap-3 text-center text-gray-500 dark:text-gray-400 text-xs">
                    <span>No tasks match these filters.</span>
                    {(selectedDate || filter !== 'all') && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDate(null);
                          setFilter('all');
                        }}
                        className="rounded-lg px-3 py-1.5 font-semibold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* BOARD VIEW WITH HTML5 DRAG AND DROP */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 flex-1 mb-16 items-start">
              {COLUMNS.map(col => {
                const colTasks = processedTasks.filter(t => t.status === col.id);
                return (
                  <div
                    key={col.id}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const taskId = e.dataTransfer.getData('text/plain');
                      if (taskId) {
                        handleUpdateStatus(taskId, col.id);
                      }
                    }}
                    className="bg-gray-100/70 dark:bg-gray-800/40 rounded-2xl border border-gray-200 dark:border-gray-700/70 p-3.5 flex flex-col min-h-[450px] transition-colors hover:border-indigo-500/40"
                  >
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                        <span className={`font-bold text-xs ${col.color}`}>{col.label}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          {colTasks.length}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2.5 flex-1 overflow-y-auto pr-0.5">
                      {colTasks.map(task => {
                        const next = getNextStatus(task.status);
                        const dueLabel = task.status !== 'done' && task.due_date
                          ? getDueLabel(task.due_date)
                          : null;
                        return (
                          <div
                            key={task.id}
                            draggable
                            onClick={() => {
                              triggerHaptic('tap');
                              setActiveModalTaskId(task.id);
                            }}
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', task.id);
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-3.5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing hover:-translate-y-0.5"
                          >
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityBadge(task.priority)}`}>
                                {task.priority}
                              </span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                                You
                              </span>
                            </div>

                            <h4 className="font-semibold text-xs text-gray-900 dark:text-white leading-snug mb-2">
                              {task.title}
                            </h4>

                            <div 
                              className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700/60 text-[11px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {task.due_date ? (
                                <span className="text-gray-400 flex items-center gap-1 text-[10px]">
                                  <Clock size={11} />
                                  {parseDueDate(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                  {dueLabel && (
                                    <span className={`ml-1 rounded-full px-1.5 py-0.5 font-semibold ${dueLabel.className}`}>
                                      {dueLabel.text}
                                    </span>
                                  )}
                                </span>
                              ) : <span className="text-gray-400 text-[10px]">—</span>}

                              {next && (
                                <button
                                  onClick={() => handleUpdateStatus(task.id, next)}
                                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                                >
                                  Advance <ArrowRight size={10} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {colTasks.length === 0 && (
                        <div className="py-8 text-center text-gray-400 text-[11px] border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                          Drop tasks here
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* BULK ACTIONS BAR */}
          {selectedTasks.length > 0 && (
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-4 duration-200 z-30">
              <span className="font-medium text-xs text-gray-300">{selectedTasks.length} selected</span>
              <div className="h-4 w-px bg-gray-700"></div>
              <button onClick={markSelectedComplete} className="text-xs font-semibold hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Mark Complete
              </button>
              <button onClick={deleteSelected} className="text-xs font-semibold hover:text-red-400 transition-colors flex items-center gap-1.5">
                <Trash2 size={14} /> Delete
              </button>
              <button 
                onClick={() => {
                  triggerHaptic('tap');
                  setSelectedTasks([]);
                }} 
                className="p-1 text-gray-400 hover:text-white rounded-full"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* MINI CALENDAR AND RIGHT OVERVIEW */}
        {isCalendarOpen && (
        <div className="w-72 border-l border-gray-200 dark:border-gray-800 p-5 hidden xl:flex flex-col bg-white dark:bg-gray-800/40">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-sm text-gray-900 dark:text-white">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <div className="flex gap-1">
              <button type="button" aria-label="Previous month" onClick={() => changeMonth(-1)} className="min-h-9 min-w-9 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500">
                <ChevronLeft size={16} />
              </button>
              <button type="button" aria-label="Next month" onClick={() => changeMonth(1)} className="min-h-9 min-w-9 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-gray-400 uppercase mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map((_, i) => (
              <div key={`empty-${i}`} className="h-9 w-full max-w-9 justify-self-center" />
            ))}

            {Array.from({ length: getDaysInMonth(currentMonth) }).map((_, i) => {
              const day = i + 1;
              const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              const isToday = isSameDay(dateObj, new Date());
              const isSelected = selectedDate && isSameDay(dateObj, selectedDate);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    triggerHaptic('tap');
                    setSelectedDate(isSelected ? null : dateObj);
                  }}
                  aria-label={`${dateObj.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}${isToday ? ', today' : ''}`}
                  aria-pressed={Boolean(isSelected)}
                  className={`h-9 w-full max-w-9 justify-self-center rounded-full text-xs font-medium flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold'
                      : isToday
                        ? 'border border-indigo-600 text-indigo-600 font-bold'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Task Overview</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Active Pending</span>
                <span className="font-bold text-indigo-600">{pendingCount}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Completed</span>
                <span className="font-bold text-emerald-600">{completedCount}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300 pt-2 border-t border-gray-100 dark:border-gray-700">
                <span>Total Assigned</span>
                <span className="font-bold text-gray-900 dark:text-white">{tasks.length}</span>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* MOBILE SLIDE-UP BOTTOM SHEET */}
        <TaskDetailModal
          taskId={activeModalTaskId}
          onClose={() => setActiveModalTaskId(null)}
          onUpdate={fetchTasks}
        />
      </div>
    </PullToRefresh>
  );
}