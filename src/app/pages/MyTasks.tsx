import { useState, useEffect } from 'react';
import {
  CheckCircle2, Circle, Clock, Trash2, Plus,
  ArrowUpDown, ChevronLeft, ChevronRight, X,
  LayoutGrid, List, Loader2, ArrowRight, FolderKanban
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
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
      onClick={onClick}
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

export default function MyTasks() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [newTaskInput, setNewTaskInput] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');

  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [tags] = useState([
    { name: 'Review', color: 'bg-purple-500' },
    { name: 'Docs', color: 'bg-blue-500' },
    { name: 'Bug', color: 'bg-red-500' },
    { name: 'Meeting', color: 'bg-emerald-500' },
  ]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, project:projects(name)')
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
    fetchTasks();

    const channel = supabase
      .channel('my_tasks_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Calendar Helpers
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  };

  // --- TASK HANDLERS ---
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;

    const title = newTaskInput.trim();

    try {
      const newTask = {
        title,
        status: 'todo' as const,
        priority: newTaskPriority,
        due_date: selectedDate ? selectedDate.toISOString() : null,
        assigned_to: user?.id || null,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask)
        .select('*, project:projects(name)')
        .single();

      if (error) throw error;
      if (data) {
        setTasks(prev => [data as Task, ...prev]);
        toast.success('Task created successfully');
        setNewTaskInput('');
      }
    } catch (err: any) {
      toast.error('Failed to create task');
      fetchTasks();
      setNewTaskInput('');
    }
  };

  const toggleTaskComplete = async (taskId: string, isCurrentlyDone: boolean) => {
    const newStatus: Task['status'] = isCurrentlyDone ? 'todo' : 'done';
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
      if (error) throw error;
      toast.success(isCurrentlyDone ? 'Task marked as pending' : 'Task completed! 🎉');
    } catch (err) {
      toast.error('Failed to update task');
      fetchTasks();
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
      if (error) throw error;
      toast.success(`Moved to ${COLUMNS.find(c => c.id === newStatus)?.label}`);
    } catch (err) {
      toast.error('Failed to update status');
      fetchTasks();
    }
  };

  const toggleTaskSelection = (id: string) => {
    setSelectedTasks(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const deleteSelected = async () => {
    if (!window.confirm(`Delete ${selectedTasks.length} selected tasks?`)) return;
    const toDelete = [...selectedTasks];
    setSelectedTasks([]);
    setTasks(prev => prev.filter(t => !toDelete.includes(t.id)));

    try {
      const { error } = await supabase.from('tasks').delete().in('id', toDelete);
      if (error) throw error;
      toast.success('Selected tasks deleted');
    } catch (err) {
      toast.error('Failed to delete tasks');
      fetchTasks();
    }
  };

  const markSelectedComplete = async () => {
    const toComplete = [...selectedTasks];
    setSelectedTasks([]);
    setTasks(prev => prev.map(t => toComplete.includes(t.id) ? { ...t, status: 'done' } : t));

    try {
      const { error } = await supabase.from('tasks').update({ status: 'done' }).in('id', toComplete);
      if (error) throw error;
      toast.success('Selected tasks completed');
    } catch (err) {
      toast.error('Failed to update tasks');
      fetchTasks();
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'high': return 'text-red-500 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900';
      case 'medium': return 'text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900';
      default: return 'text-blue-500 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900';
    }
  };

  // Filter Tasks
  const processedTasks = tasks
    .filter(t => {
      if (filter === 'pending') return t.status !== 'done';
      if (filter === 'completed') return t.status === 'done';
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        return (priorityScore[b.priority] || 1) - (priorityScore[a.priority] || 1);
      }
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      return 0;
    });

  // Next status progression helper
  const getNextStatus = (current: Task['status']): Task['status'] | null => {
    switch (current) {
      case 'todo': return 'inProgress';
      case 'inProgress': return 'review';
      case 'review': return 'done';
      case 'done': return null;
      default: return null;
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return "text-red-500";
      case 'medium': return "text-orange-500";
      case 'low': return "text-blue-500";
      default: return "text-gray-300 dark:text-gray-600";
    }
  };

  return (
    <div className="flex h-full">
      {/* MAIN TASKS WORKSPACE */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col h-full relative custom-scrollbar">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">My Tasks</h1>
            {selectedDate ? (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1.5 cursor-pointer font-medium hover:underline" onClick={() => setSelectedDate(null)}>
                Filtered for {selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} <X size={13} />
              </p>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Track and complete your personal & project deliverables.</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* View Switcher */}
            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mr-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="List View"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('board')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'board' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Board View"
              >
                <LayoutGrid size={16} />
              </button>
            </div>

            <button
              onClick={() => setSortBy(sortBy === 'date' ? 'priority' : 'date')}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowUpDown size={13} />
              Sort: {sortBy === 'date' ? 'Due Date' : 'Priority'}
            </button>

            <FilterBtn label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
            <FilterBtn label="Pending" active={filter === 'pending'} onClick={() => setFilter('pending')} />
            <FilterBtn label="Done" active={filter === 'completed'} onClick={() => setFilter('completed')} />
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
            placeholder="Add a new task..."
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 rounded-xl shadow-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-all"
          />
        </form>

        {/* Tasks View: Loading State */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <Loader2 className="animate-spin text-indigo-600" size={36} />
          </div>
        ) : viewMode === 'list' ? (
          /* --- LIST VIEW --- */
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1 mb-16">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {processedTasks.map((task) => {
                const isDone = task.status === 'done';
                const isSelected = selectedTasks.includes(task.id);

                return (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-4 transition-colors group ${
                      isSelected ? 'bg-indigo-50/60 dark:bg-indigo-950/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'
                    }`}
                    onClick={() => toggleTaskSelection(task.id)}
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
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
                        onClick={(e) => { e.stopPropagation(); toggleTaskComplete(task.id, isDone); }}
                        className={`shrink-0 transition-transform active:scale-90 ${isDone ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600 hover:text-indigo-500'}`}
                      >
                        {isDone ? <CheckCircle2 size={22} className="fill-emerald-50 dark:fill-emerald-950/40" /> : <Circle size={22} />}
                      </button>

                      <div className="min-w-0">
                        <h3 className={`font-semibold text-sm text-gray-900 dark:text-white truncate transition-all ${isDone ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                          {task.title}
                        </h3>
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

                    <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>

                      {task.due_date && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                          <Clock size={12} />
                          <span>{new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                      )}

                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task.id, e.target.value as Task['status'])}
                        className="text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg px-2 py-1 outline-none border border-transparent focus:border-indigo-500"
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
                <div className="py-16 text-center text-gray-400 text-xs">
                  No tasks matching your current filter.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* --- BOARD VIEW --- */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 flex-1 mb-16 items-start">
            {COLUMNS.map(col => {
              const colTasks = processedTasks.filter(t => t.status === col.id);
              return (
                <div key={col.id} className="bg-gray-100/70 dark:bg-gray-800/40 rounded-2xl border border-gray-200 dark:border-gray-700/70 p-3.5 flex flex-col min-h-[450px]">
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
                      return (
                        <div key={task.id} className="bg-white dark:bg-gray-800 rounded-xl p-3.5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityBadge(task.priority)}`}>
                              {task.priority}
                            </span>
                            {task.project?.name && (
                              <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 truncate max-w-[100px]">
                                {task.project.name}
                              </span>
                            )}
                          </div>

                          <h4 className="font-semibold text-xs text-gray-900 dark:text-white leading-snug mb-2">
                            {task.title}
                          </h4>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700/60 text-[11px]">
                            {task.due_date ? (
                              <span className="text-gray-400 flex items-center gap-1 text-[10px]">
                                <Clock size={11} />
                                {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
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
                        Empty
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
            <button onClick={() => setSelectedTasks([])} className="p-1 text-gray-400 hover:text-white rounded-full">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* MINI CALENDAR SIDEBAR */}
      <div className="w-72 border-l border-gray-200 dark:border-gray-800 p-5 hidden xl:flex flex-col bg-white dark:bg-gray-800/40">
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-sm text-gray-900 dark:text-white">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <div className="flex gap-1">
            <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 text-center text-[10px] font-bold text-gray-400 uppercase mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map((_, i) => (
            <div key={`empty-${i}`} className="h-7 w-7" />
          ))}

          {Array.from({ length: getDaysInMonth(currentMonth) }).map((_, i) => {
            const day = i + 1;
            const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const isToday = isSameDay(dateObj, new Date());
            const isSelected = selectedDate && isSameDay(dateObj, selectedDate);

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : dateObj)}
                className={`h-7 w-7 rounded-full text-xs font-medium flex items-center justify-center transition-all ${
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
              <span>Total Tasks</span>
              <span className="font-bold text-gray-900 dark:text-white">{tasks.length}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Completed</span>
              <span className="font-bold text-emerald-600">{tasks.filter(t => t.status === 'done').length}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>In Progress</span>
              <span className="font-bold text-indigo-600">{tasks.filter(t => t.status === 'inProgress').length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}