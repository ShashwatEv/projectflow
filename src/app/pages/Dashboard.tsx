import { useEffect, useState, type ReactNode } from 'react';
import {
  Users, FolderKanban, CheckSquare, Activity,
  ArrowUpRight, ArrowDownRight, PlusCircle, CheckCircle2, UserPlus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import CreateProjectModal from '../components/CreateProjectModal';
import AddMemberModal from '../components/AddMemberModal';

interface ActivityItem {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    activeProjects: 0,
    newProjectsThisWeek: 0,
    totalUsers: 0,
    onlineUsers: 0,
    totalTasks: 0,
    newTasksThisWeek: 0,
    completedTasks: 0,
    completionRate: 0,
  });

  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      // Date baseline for week-over-week trends (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, created_at, status');
      if (projectsError) throw projectsError;

      const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
      const newProjectsThisWeek = projects?.filter(p => new Date(p.created_at) >= oneWeekAgo).length || 0;

      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, status');
      if (usersError) throw usersError;

      const totalUsers = users?.length || 0;
      const onlineUsers = users?.filter(u => u.status === 'online').length || 0;

      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, status, created_at');
      if (tasksError) throw tasksError;

      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter(t => t.status === 'done').length || 0;
      const newTasksThisWeek = tasks?.filter(t => new Date(t.created_at) >= oneWeekAgo).length || 0;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      setStats({
        activeProjects,
        newProjectsThisWeek,
        totalUsers,
        onlineUsers,
        totalTasks,
        newTasksThisWeek,
        completedTasks,
        completionRate,
      });

      const { data: recentTasks, error: recentTasksError } = await supabase
        .from('tasks')
        .select('id, title, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      if (recentTasksError) throw recentTasksError;

      if (recentTasks) {
        setRecentActivity(
          recentTasks.map(t => ({
            id: t.id,
            title: t.title,
            status: t.status,
            created_at: t.created_at,
          }))
        );
      }
      setLoadError(null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoadError('Dashboard data could not be refreshed. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen to real-time changes on tasks and projects to keep counts live
    const channel = supabase
      .channel('dashboard_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Welcome back! Here's what's happening across your workspace.
        </p>
      </div>

      {loadError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"
        >
          <span>{loadError}</span>
          <button
            type="button"
            onClick={fetchData}
            className="rounded-lg px-3 py-1.5 font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/40"
          >
            Retry
          </button>
        </div>
      )}

      {/* Real Dynamic Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Projects"
          value={loading ? '...' : stats.activeProjects}
          to="/projects"
          icon={<FolderKanban className="text-indigo-600 dark:text-indigo-400" size={22} />}
          trend={stats.newProjectsThisWeek > 0 ? `+${stats.newProjectsThisWeek} this wk` : 'No new this wk'}
          trendUp={stats.newProjectsThisWeek > 0}
        />

        <StatCard
          title="Team Members"
          value={loading ? '...' : stats.totalUsers}
          to="/team"
          icon={<Users className="text-emerald-600 dark:text-emerald-400" size={22} />}
          trend={`${stats.onlineUsers} online`}
          trendUp={stats.onlineUsers > 0}
        />

        <StatCard
          title="Total Tasks"
          value={loading ? '...' : stats.totalTasks}
          to="/tasks"
          icon={<CheckSquare className="text-blue-600 dark:text-blue-400" size={22} />}
          trend={stats.newTasksThisWeek > 0 ? `+${stats.newTasksThisWeek} this wk` : '0 new'}
          trendUp={stats.newTasksThisWeek > 0}
        />

        <StatCard
          title="Completion Rate"
          value={loading ? '...' : `${stats.completionRate}%`}
          to="/tasks"
          icon={<Activity className="text-purple-600 dark:text-purple-400" size={22} />}
          trend={`${stats.completedTasks}/${stats.totalTasks} done`}
          trendUp={stats.completionRate >= 50}
        />
      </div>

      {/* Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real Activity Stream */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Recently Created Tasks</h3>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700/60 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                <p>No tasks yet. Create your first task to get started.</p>
                <Link
                  to="/tasks"
                  className="mt-3 inline-flex min-h-10 items-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
                >
                  Open My Tasks
                </Link>
              </div>
            ) : (
              <div className="space-y-3.5">
                {recentActivity.map(item => (
                  <div key={item.id} className="flex items-center gap-3.5 text-sm group cursor-default">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        item.status === 'done'
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40'
                          : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40'
                      }`}
                    >
                      {item.status === 'done' ? <CheckCircle2 size={15} /> : <PlusCircle size={15} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 dark:text-white font-medium truncate">
                        Task created:{' '}
                        <span className="text-gray-600 dark:text-gray-300 font-normal">{item.title}</span>
                      </p>
                      <p className="text-[11px] text-gray-400 capitalize">
                        Current status: {item.status} • Created {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl text-white shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xl mb-2">Ready to ship?</h3>
            <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
              Create a new project workspace or allocate tasks to streamline delivery across your team.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="bg-white text-indigo-600 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:bg-gray-50 transition-colors"
            >
              + New Project
            </button>
            <button
              onClick={() => setIsAddMemberModalOpen(true)}
              className="bg-indigo-500/50 hover:bg-indigo-500/70 border border-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-bold backdrop-blur-sm transition-colors flex items-center gap-1.5"
            >
              <UserPlus size={14} />
              <span>Invite Team</span>
            </button>
          </div>
        </div>
      </div>

      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onProjectCreated={fetchData}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onMemberAdded={fetchData}
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend: string;
  trendUp: boolean;
  to: string;
}

function StatCard({ title, value, icon, trend, trendUp, to }: StatCardProps) {
  return (
    <Link
      to={to}
      aria-label={`${title}: ${value}. Open related page`}
      className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
    >
    <div className="h-full bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          {icon}
        </div>
        <div
          className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
            trendUp
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'
          }`}
        >
          {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          <span>{trend}</span>
        </div>
      </div>
      <h3 className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
    </Link>
  );
}