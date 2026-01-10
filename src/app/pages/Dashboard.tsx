import { useEffect, useState } from 'react';
import { 
  Users, FolderKanban, CheckSquare, Activity, 
  ArrowUpRight, ArrowDownRight, PlusCircle, CheckCircle2
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient'; 
import CreateProjectModal from '../components/CreateProjectModal'; // Import the Modal

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
    totalUsers: 0,
    totalTasks: 0,
    completedTasks: 0
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for the Create Project Modal
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Define fetchData outside useEffect so we can refresh data after creating a project
  const fetchData = async () => {
    try {
      // 1. Get Project Count
      const { count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

      // 2. Get User Count
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // 3. Get Task Stats
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

      // 4. Get Recent Activity (Last 5 created tasks)
      const { data: recentTasks } = await supabase
        .from('tasks')
        .select('id, title, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentTasks) {
          const activity: ActivityItem[] = recentTasks.map(t => ({
              id: t.id,
              title: t.title,
              status: t.status,
              created_at: t.created_at,
              type: 'task'
          }));
          setRecentActivity(activity);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial Fetch
  useEffect(() => {
    fetchData();
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

      {/* Activity & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Real Recent Activity */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
            
            {loading ? (
                <div className="space-y-4">
                    {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></div>)}
                </div>
            ) : recentActivity.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No recent activity found.</div>
            ) : (
                <div className="space-y-4">
                    {recentActivity.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 text-sm group cursor-default">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                item.status === 'done' 
                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' 
                                : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30'
                            }`}>
                                {item.status === 'done' ? <CheckCircle2 size={14}/> : <PlusCircle size={14}/>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-900 dark:text-white font-medium truncate">
                                    {item.status === 'done' ? 'Completed task:' : 'New task created:'} <span className="text-gray-600 dark:text-gray-300">{item.title}</span>
                                </p>
                                <p className="text-xs text-gray-500 capitalize">{item.status} • {new Date(item.created_at).toLocaleDateString()}</p>
                            </div>
                            <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                View
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Quick Actions Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl text-white shadow-lg flex flex-col justify-between">
            <div>
                <h3 className="font-bold text-xl mb-2">Ready to work?</h3>
                <p className="text-indigo-100 text-sm mb-6">Create a new project or invite your team members to get started.</p>
            </div>
            <div className="flex gap-3">
                <button 
                  onClick={() => setIsProjectModalOpen(true)}
                  className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors"
                >
                    + New Project
                </button>
                <button className="bg-indigo-500/50 hover:bg-indigo-500/70 text-white px-4 py-2 rounded-lg text-sm font-bold backdrop-blur-sm transition-colors">
                    Invite Team
                </button>
            </div>
        </div>
      </div>

      {/* Include the Modal at the bottom */}
      <CreateProjectModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)}
        onProjectCreated={() => {
           fetchData(); // Refresh the stats when a new project is made!
        }}
      />
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