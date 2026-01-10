import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface CalendarTask {
  id: string;
  title: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  status: string;
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Tasks on Load
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      // Fetch all tasks that have a due date
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, due_date, priority, status')
        .not('due_date', 'is', null);

      if (error) throw error;
      if (data) setTasks(data);
    } catch (error) {
      console.error('Error fetching calendar tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Calendar Logic ---
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sunday

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getTasksForDay = (day: number) => {
    return tasks.filter(task => {
        const taskDate = new Date(task.due_date);
        return (
            taskDate.getDate() === day &&
            taskDate.getMonth() === currentDate.getMonth() &&
            taskDate.getFullYear() === currentDate.getFullYear()
        );
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  return (
    <div className="p-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <CalendarIcon className="text-indigo-600" /> 
            {monthName} {year}
          </h1>
          <p className="text-gray-500">View and manage your upcoming deadlines.</p>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1 shadow-sm">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                    <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
                </button>
                <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
                    Today
                </button>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                    <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
                </button>
            </div>
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-md transition-colors">
                <Plus size={18} /> Add Event
            </button>
        </div>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : (
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                {/* Empty slots for previous month days */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="border-b border-r border-gray-100 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-900/20"></div>
                ))}

                {/* Actual Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dayTasks = getTasksForDay(day);
                    const isToday = 
                        day === new Date().getDate() && 
                        currentDate.getMonth() === new Date().getMonth() && 
                        currentDate.getFullYear() === new Date().getFullYear();

                    return (
                        <div key={day} className={`min-h-[100px] border-b border-r border-gray-100 dark:border-gray-700/50 p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/20 group relative`}>
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {day}
                                </span>
                                {dayTasks.length > 0 && (
                                    <span className="text-[10px] text-gray-400 font-medium">{dayTasks.length} tasks</span>
                                )}
                            </div>
                            
                            <div className="space-y-1">
                                {dayTasks.map(task => (
                                    <div 
                                        key={task.id} 
                                        className={`text-[10px] px-2 py-1 rounded border truncate font-medium cursor-pointer ${getPriorityColor(task.priority)}`}
                                        title={task.title}
                                    >
                                        {task.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      )}
    </div>
  );
}