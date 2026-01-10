import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Loader2, CheckCircle2, Circle, AlertTriangle, ListTodo, 
  TrendingUp, TrendingDown 
} from 'lucide-react';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);

  // Derived Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const pendingTasks = tasks.filter(t => t.status !== 'done').length;
  const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  useEffect(() => {
    fetchData();

    // ⚡ REAL-TIME LISTENER
    // This makes the charts animate instantly when ANYONE changes a task
    const subscription = supabase
      .channel('analytics_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchData(); // Re-fetch data on any change (Insert, Update, Delete)
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchData = async () => {
    const { data } = await supabase.from('tasks').select('*');
    if (data) setTasks(data);
    setLoading(false);
  };

  // --- Prepare Chart Data ---

  // 1. Status Data (Donut Chart)
  const statusCounts = tasks.reduce((acc: any, task) => {
    const status = task.status || 'todo';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusData = [
    { name: 'To Do', value: statusCounts.todo || 0, color: '#94a3b8' },       // Slate 400
    { name: 'In Progress', value: statusCounts.inProgress || 0, color: '#6366f1' }, // Indigo 500
    { name: 'Review', value: statusCounts.review || 0, color: '#f59e0b' },    // Amber 500
    { name: 'Done', value: statusCounts.done || 0, color: '#10b981' },        // Emerald 500
  ].filter(item => item.value > 0); // Hide empty slices

  // 2. Priority Data (Bar Chart)
  const priorityCounts = tasks.reduce((acc: any, task) => {
    const priority = task.priority || 'low';
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});

  const priorityData = [
    { name: 'Low', count: priorityCounts.low || 0 },
    { name: 'Medium', count: priorityCounts.medium || 0 },
    { name: 'High', count: priorityCounts.high || 0 },
  ];

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
           <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time insights into your team's performance.</p>
        </div>
        <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Completion Rate</span>
            <div className="flex items-center gap-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {completionRate}%
                {completionRate >= 50 ? <TrendingUp size={24} className="text-emerald-500"/> : <TrendingDown size={24} className="text-amber-500"/>}
            </div>
        </div>
      </div>

      {/* --- KPI Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Tasks" 
          value={totalTasks} 
          icon={<ListTodo size={24} className="text-blue-600" />} 
          bg="bg-blue-50 dark:bg-blue-900/20"
        />
        <KPICard 
          title="Completed" 
          value={completedTasks} 
          icon={<CheckCircle2 size={24} className="text-emerald-600" />} 
          bg="bg-emerald-50 dark:bg-emerald-900/20"
        />
        <KPICard 
          title="In Progress" 
          value={pendingTasks} 
          icon={<Circle size={24} className="text-indigo-600" />} 
          bg="bg-indigo-50 dark:bg-indigo-900/20"
        />
        <KPICard 
          title="High Priority" 
          value={highPriorityTasks} 
          icon={<AlertTriangle size={24} className="text-rose-600" />} 
          bg="bg-rose-50 dark:bg-rose-900/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- Chart 1: Task Status (Donut) --- */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
          <h3 className="font-bold text-gray-800 dark:text-white mb-6">Task Status Distribution</h3>
          <div className="flex-1 min-h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{totalTasks}</span>
                <span className="text-xs text-gray-500 uppercase font-medium">Tasks</span>
            </div>
          </div>

          {/* Custom Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
             {statusData.map(item => (
                 <div key={item.name} className="flex items-center gap-2 text-sm">
                     <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                     <span className="text-gray-600 dark:text-gray-300 font-medium">{item.name}</span>
                     <span className="text-gray-400">({item.value})</span>
                 </div>
             ))}
          </div>
        </div>

        {/* --- Chart 2: Priority Breakdown (Bar) --- */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
          <h3 className="font-bold text-gray-800 dark:text-white mb-6">Workload by Priority</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#374151" opacity={0.1} />
                <XAxis type="number" hide />
                <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fill: '#6b7280', fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false}
                />
                <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                    {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                            entry.name === 'High' ? '#e11d48' : // Rose 600
                            entry.name === 'Medium' ? '#f59e0b' : // Amber 500
                            '#6366f1' // Indigo 500
                        } />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            High priority tasks require immediate attention.
          </p>
        </div>
      </div>
    </div>
  );
}

// Simple Card Component
function KPICard({ title, value, icon, bg }: any) {
    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-xl ${bg}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
}