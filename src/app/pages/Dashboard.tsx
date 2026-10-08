import { useEffect, useState } from 'react';
import {
  Users, FolderKanban, CheckSquare, Activity,
  ArrowUpRight, ArrowDownRight, PlusCircle, CheckCircle2, Loader2, UserPlus
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import CreateProjectModal from '../components/CreateProjectModal';
import AddMemberModal from '../components/AddMemberModal';

interface ActivityItem {
  id: string;
  title: string;
  status: string;
  created_at: string;
  type: 'task';
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
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
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Date baseline for week-over-week trends (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const oneWeekAgoIso = oneWeekAgo.toISOString();

      // 1. Projects Query: Total & Created This Week
      const { data: projects } = await supabase
        .from('projects')
        .select('id, created_at, status');

      const totalProjects = projects?.length || 0;
      const newProjectsThisWeek = projects?.filter(p => new Date(p.created_at) >= oneWeekAgo).length || 0;

      // 2. Users Query: Total & Active/Online Status
      const { data: users } = await supabase
        .from('users')
        .select('id, status');

      const totalUsers = users?.length || 0;
      const onlineUsers = users?.filter(u => u.status === 'online').length || 0;

      // 3. Tasks Query: Total, Completed, & Created This Week
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, status, created_at');

      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter(t => t.status === 'done').length || 0;
      const newTasksThisWeek = tasks?.filter(t => new Date(t.created_at) >= oneWeekAgo).length || 0;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      setStats({
        totalProjects,
        newProjectsThisWeek,
        totalUsers,
        onlineUsers,
        totalTasks,
        newTasksThisWeek,
        completedTasks,
        completionRate,
      });

      // 4. Fetch Recent Activity (Last 5 tasks)
      const { data: recentTasks } = await supabase
        .from('tasks')
        .select('id, title, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentTasks) {
        setRecentActivity(
          recentTasks.map(t => ({
            id: t.id,
            title: t.title,
            status: t.status,
            created_at: t.created_at,
            type: 'task',
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

      {/* Real Dynamic Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Projects"
          value={loading ? '...' : stats.totalProjects}
          icon={<FolderKanban className="text-indigo-600 dark:text-indigo-400" size={22} />}
          trend={stats.newProjectsThisWeek > 0 ? `+${stats.newProjectsThisWeek} this wk` : 'Stable'}
          trendUp={stats.newProjectsThisWeek > 0}
        />

        <StatCard
          title="Team Members"
          value={loading ? '...' : stats.totalUsers}
          icon={<Users className="text-emerald-600 dark:text-emerald-400" size={22} />}
          trend={stats.onlineUsers > 0 ? `${stats.onlineUsers} online` : `${stats.totalUsers} active`}
          trendUp={stats.onlineUsers > 0}
        />

        <StatCard
          title="Total Tasks"
          value={loading ? '...' : stats.totalTasks}
          icon={<CheckSquare className="text-blue-600 dark:text-blue-400" size={22} />}
          trend={stats.newTasksThisWeek > 0 ? `+${stats.newTasksThisWeek} this wk` : '0 new'}
          trendUp={stats.newTasksThisWeek > 0}
        />

        <StatCard
          title="Completion Rate"
          value={loading ? '...' : `${stats.completionRate}%`}
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
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700/60 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">
                No recent activity recorded yet.
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
                        {item.status === 'done' ? 'Completed task:' : 'Active task:'}{' '}
                        <span className="text-gray-600 dark:text-gray-300 font-normal">{item.title}</span>
                      </p>
                      <p className="text-[11px] text-gray-400 capitalize">
                        {item.status} • {new Date(item.created_at).toLocaleDateString()}
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

function StatCard({ title, value, icon, trend, trendUp }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
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
  );
}