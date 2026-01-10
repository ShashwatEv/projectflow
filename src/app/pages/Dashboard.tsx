import { useEffect, useState } from 'react';
import { 
  Users, FolderKanban, CheckSquare, Activity, 
  ArrowUpRight, ArrowDownRight, Clock 
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient'; // <--- Real Data

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalUsers: 0,
    totalTasks: 0,
    completedTasks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // 1. Get Project Count
        const { count: projectCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true });

        // 2. Get User Count
        const { count: userCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        // 3. Get Task Counts
        const { data: tasks } = await supabase
          .from('tasks')
          .select('status');

        const total = tasks?.length || 0;
        const completed = tasks?.filter(t => t.status === 'done').length || 0;

        setStats({
          totalProjects: projectCount || 0,
          totalUsers: userCount || 0,
          totalTasks: total,
          completedTasks: completed
        });
        
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-gray-500 dark:text-gray-400">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Active Projects" 
          value={loading ? "..." : stats.totalProjects} 
          icon={<FolderKanban className="text-indigo-600" size={24} />}
          trend="+2.5%" 
          trendUp={true}
        />
        <StatCard 
          title="Team Members" 
          value={loading ? "..." : stats.totalUsers} 
          icon={<Users className="text-emerald-600" size={24} />}
          trend="+12%" 
          trendUp={true}
        />
        <StatCard 
          title="Total Tasks" 
          value={loading ? "..." : stats.totalTasks} 
          icon={<CheckSquare className="text-blue-600" size={24} />}
          trend="+5" 
          trendUp={true}
        />
        <StatCard 
          title="Completion Rate" 
          value={loading ? "..." : `${stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%`} 
          icon={<Activity className="text-purple-600" size={24} />}
          trend="+4%" 
          trendUp={true}
        />
      </div>

      {/* Recent Activity Placeholder (You can expand this later) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600"><Clock size={14}/></div>
                    <div>
                        <p className="text-gray-900 dark:text-white font-medium">System Update</p>
                        <p className="text-gray-500">Dashboard stats are now connected to Supabase.</p>
                    </div>
                    <span className="ml-auto text-xs text-gray-400">Just now</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, trendUp }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-red-50 text-red-600'}`}>
          {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trend}
        </div>
      </div>
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}