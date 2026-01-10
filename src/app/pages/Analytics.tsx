import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Loader2 } from 'lucide-react';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [priorityData, setPriorityData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('priority, status');

      if (tasks) {
        // 1. Process Status Data (for Pie Chart)
        const statusCounts = tasks.reduce((acc: any, task) => {
          acc[task.status] = (acc[task.status] || 0) + 1;
          return acc;
        }, {});

        const pData = [
          { name: 'To Do', value: statusCounts.todo || 0, color: '#94a3b8' },
          { name: 'In Progress', value: statusCounts.inProgress || 0, color: '#3b82f6' },
          { name: 'Review', value: statusCounts.review || 0, color: '#eab308' },
          { name: 'Done', value: statusCounts.done || 0, color: '#22c55e' },
        ];
        setStatusData(pData);

        // 2. Process Priority Data (for Bar Chart)
        const priorityCounts = tasks.reduce((acc: any, task) => {
          acc[task.priority] = (acc[task.priority] || 0) + 1;
          return acc;
        }, {});

        const sData = [
          { name: 'Low', count: priorityCounts.low || 0 },
          { name: 'Medium', count: priorityCounts.medium || 0 },
          { name: 'High', count: priorityCounts.high || 0 },
        ];
        setPriorityData(sData);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Analytics Overview</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Status Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-4">Task Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs mt-4">
             {statusData.map(item => (
                 <div key={item.name} className="flex items-center gap-1">
                     <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                     <span className="dark:text-gray-300">{item.name} ({item.value})</span>
                 </div>
             ))}
          </div>
        </div>

        {/* Task Priority Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-4">Tasks by Priority</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}