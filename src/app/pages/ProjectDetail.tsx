import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, FolderKanban, Calendar, CheckSquare, Plus, 
  MoreHorizontal, Loader2, Clock, CheckCircle2, AlertCircle, 
  Trash2, Edit3, User, Users, ChevronRight, LayoutGrid, List,
  ArrowRight, Shield
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  due_date?: string;
  created_at?: string;
  owner_id?: string;
  progress?: number;
}

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'inProgress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at?: string;
  project_id?: string;
  assigned_to?: string;
  user?: { id: string; name: string; avatar: string };
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

const COLUMNS: { id: TaskItem['status']; label: string; color: string; bg: string; dot: string }[] = [
  { id: 'todo', label: 'To Do', color: 'text-gray-700 dark:text-gray-300', bg: 'bg-gray-100 dark:bg-gray-800/60', dot: 'bg-gray-400' },
  { id: 'inProgress', label: 'In Progress', color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-50/70 dark:bg-indigo-950/30', dot: 'bg-indigo-500' },
  { id: 'review', label: 'Review', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50/70 dark:bg-amber-950/30', dot: 'bg-amber-500' },
  { id: 'done', label: 'Done', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50/70 dark:bg-emerald-950/30', dot: 'bg-emerald-500' },
];

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [taskModalDefaultStatus, setTaskModalDefaultStatus] = useState<TaskItem['status']>('todo');

  // New Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskStatus, setNewTaskStatus] = useState<TaskItem['status']>('todo');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [savingTask, setSavingTask] = useState(false);

  // Edit Project Form State
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [editDueDate, setEditDueDate] = useState('');
  const [savingProject, setSavingProject] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProjectData();
      fetchTeamMembers();
    }
  }, [id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      // 1. Fetch Project Info
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (projectError) {
        toast.error('Project not found');
        navigate('/projects');
        return;
      }

      setProject(projectData);
      setEditName(projectData.name || '');
      setEditDescription(projectData.description || '');
      setEditStatus(projectData.status || 'active');
      setEditDueDate(projectData.due_date ? projectData.due_date.split('T')[0] : '');

      // 2. Fetch Project Tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*, user:users(id, name, avatar)')
        .eq('project_id', id)
        .order('created_at', { ascending: false });

      if (tasksError) {
        console.warn('Could not query tasks by project_id, falling back to all tasks:', tasksError.message);
        setTasks([]);
      } else if (tasksData) {
        setTasks(tasksData);
      }
    } catch (err: any) {
      console.error('Error fetching project:', err);
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase.from('users').select('id, name, email, avatar, role');
      if (data && !error) setTeamMembers(data);
    } catch (err) {
      console.error('Error fetching team members:', err);
    }
  };

  // Progress Calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Task Status Update Handler
  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskItem['status']) => {
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;
      toast.success(`Task moved to ${COLUMNS.find(c => c.id === newStatus)?.label}`);
    } catch (err: any) {
      toast.error('Failed to update task status');
      fetchProjectData();
    }
  };

  // Delete Task Handler
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete task');
      fetchProjectData();
    }
  };

  // Create Task Handler
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !id) return;
    setSavingTask(true);

    try {
      const newTaskPayload: any = {
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim(),
        status: newTaskStatus,
        priority: newTaskPriority,
        project_id: id,
        due_date: newTaskDueDate || null,
        assigned_to: newTaskAssignee || currentUser?.id || null,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert(newTaskPayload)
        .select('*, user:users(id, name, avatar)')
        .single();

      if (error) throw error;

      if (data) {
        setTasks(prev => [data, ...prev]);
      } else {
        fetchProjectData();
      }

      toast.success('Task created successfully!');
      setIsTaskModalOpen(false);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskPriority('medium');
      setNewTaskDueDate('');
      setNewTaskAssignee('');
    } catch (err: any) {
      console.error('Error creating task:', err);
      toast.error(err.message || 'Failed to create task');
    } finally {
      setSavingTask(false);
    }
  };

  // Update Project Handler
  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !editName.trim()) return;
    setSavingProject(true);

    try {
      const updates = {
        name: editName.trim(),
        description: editDescription.trim(),
        status: editStatus,
        due_date: editDueDate || null,
        progress: progressPercent
      };

      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', project.id);

      if (error) throw error;

      setProject(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Project updated successfully');
      setIsEditProjectOpen(false);
    } catch (err: any) {
      toast.error('Failed to update project');
    } finally {
      setSavingProject(false);
    }
  };

  // Delete Project Handler
  const handleDeleteProject = async () => {
    if (!project) return;
    if (!confirm(`Are you sure you want to delete project "${project.name}"? This cannot be undone.`)) return;

    try {
      const { error } = await supabase.from('projects').delete().eq('id', project.id);
      if (error) throw error;
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err: any) {
      toast.error('Failed to delete project');
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'medium':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200';
      case 'planning':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200';
    }
  };

  const getNextStatus = (current: TaskItem['status']): TaskItem['status'] | null => {
    switch (current) {
      case 'todo': return 'inProgress';
      case 'inProgress': return 'review';
      case 'review': return 'done';
      case 'done': return null;
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-indigo-600" size={36} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-4">Project not found</p>
        <Link to="/projects" className="text-indigo-600 hover:underline inline-flex items-center gap-1">
          <ArrowLeft size={16} /> Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/projects" className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors">
            <ArrowLeft size={14} /> Projects
          </Link>
          <ChevronRight size={14} className="opacity-40" />
          <span className="font-semibold text-gray-900 dark:text-white truncate max-w-xs">{project.name}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditProjectOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/60 border border-gray-200 dark:border-gray-700 rounded-xl transition-colors shadow-sm"
          >
            <Edit3 size={15} /> Edit
          </button>
          <button
            onClick={handleDeleteProject}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/20 border border-gray-200 dark:border-gray-700 rounded-xl transition-colors shadow-sm"
          >
            <Trash2 size={15} /> Delete
          </button>
          <button
            onClick={() => {
              setTaskModalDefaultStatus('todo');
              setNewTaskStatus('todo');
              setIsTaskModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Plus size={16} /> Add Task
          </button>
        </div>
      </div>

      {/* Project Overview Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
                <FolderKanban size={24} />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight truncate">
                {project.name}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusBadge(project.status)}`}>
                {project.status}
              </span>
            </div>
            {project.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
                {project.description}
              </p>
            )}
          </div>

          {/* Key Metrics */}
          <div className="flex flex-wrap items-center gap-6 lg:border-l lg:border-gray-200 dark:lg:border-gray-700 lg:pl-6">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Progress</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{progressPercent}%</span>
                <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Tasks Done</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {completedTasks} <span className="text-xs font-normal text-gray-400">/ {totalTasks}</span>
              </p>
            </div>

            {project.due_date && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Target Date</p>
                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-800 dark:text-gray-200 mt-2">
                  <Calendar size={14} className="text-indigo-500" />
                  {new Date(project.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Switcher & Toolbar */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900/60 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('board')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'board'
                ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <LayoutGrid size={14} /> Board
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <List size={14} /> List
          </button>
        </div>

        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Showing <span className="font-bold text-gray-900 dark:text-white">{tasks.length}</span> project tasks
        </div>
      </div>

      {/* --- KANBAN BOARD VIEW --- */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id);

            return (
              <div 
                key={col.id} 
                className="bg-gray-50/80 dark:bg-gray-800/40 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 p-4 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                    <h3 className={`font-bold text-sm ${col.color}`}>{col.label}</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setTaskModalDefaultStatus(col.id);
                      setNewTaskStatus(col.id);
                      setIsTaskModalOpen(true);
                    }}
                    className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-white dark:hover:bg-gray-700 transition-colors"
                    title={`Add task to ${col.label}`}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Column Tasks List */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {colTasks.map(task => {
                    const nextStatus = getNextStatus(task.status);

                    return (
                      <div
                        key={task.id}
                        className="group bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500/50 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityBadge(task.priority)}`}>
                            {task.priority}
                          </span>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                            title="Delete task"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white leading-snug mb-1.5">
                          {task.title}
                        </h4>

                        {task.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs">
                          {task.due_date ? (
                            <span className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                              <Clock size={12} />
                              {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          ) : (
                            <span className="text-[11px] text-gray-400">No deadline</span>
                          )}

                          {nextStatus && (
                            <button
                              onClick={() => handleUpdateTaskStatus(task.id, nextStatus)}
                              className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline"
                              title={`Advance to ${COLUMNS.find(c => c.id === nextStatus)?.label}`}
                            >
                              Advance <ArrowRight size={11} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div className="py-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                      No tasks in {col.label}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- LIST VIEW --- */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs font-semibold border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3.5">Task</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Priority</th>
                <th className="px-6 py-3.5">Due Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {tasks.map(task => (
                <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-sm text-gray-900 dark:text-white">{task.title}</div>
                    {task.description && <div className="text-xs text-gray-500 line-clamp-1">{task.description}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as TaskItem['status'])}
                      className="text-xs font-medium bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1 text-gray-800 dark:text-gray-200 outline-none"
                    >
                      {COLUMNS.map(col => (
                        <option key={col.id} value={col.id}>{col.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide border ${getPriorityBadge(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600 dark:text-gray-300">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {tasks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No tasks created yet. Click "+ Add Task" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* --- ADD TASK MODAL --- */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Add Task to {project.name}</h3>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Task Title *</label>
                <input
                  required
                  autoFocus
                  type="text"
                  placeholder="e.g. Implement Navigation Drawer"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Task details and acceptance criteria..."
                  value={newTaskDescription}
                  onChange={e => setNewTaskDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Initial Status</label>
                  <select
                    value={newTaskStatus}
                    onChange={e => setNewTaskStatus(e.target.value as TaskItem['status'])}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none"
                  >
                    <option value="todo">To Do</option>
                    <option value="inProgress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={e => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={e => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Assignee</label>
                  <select
                    value={newTaskAssignee}
                    onChange={e => setNewTaskAssignee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none"
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTask || !newTaskTitle.trim()}
                  className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {savingTask && <Loader2 size={15} className="animate-spin" />}
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT PROJECT MODAL --- */}
      {isEditProjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Edit Project</h3>
              <button onClick={() => setIsEditProjectOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleUpdateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Project Name *</label>
                <input
                  required
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="planning">Planning</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={e => setEditDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsEditProjectOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProject || !editName.trim()}
                  className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {savingProject && <Loader2 size={15} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

