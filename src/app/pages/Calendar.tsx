import { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, 
  X, Loader2 
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'task' | 'project';
  priority?: 'low' | 'medium' | 'high';
  status?: string;
  projectName?: string;
}

interface ProjectOption {
  id: string;
  name: string;
}

export default function Calendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); // Default Oct 2026
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventPriority, setEventPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch events from both tasks and projects
  const fetchCalendarData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Projects for dropdown and milestones
      const { data: projectData } = await supabase
        .from('projects')
        .select('id, name, due_date, status');

      if (projectData) {
        setProjects(projectData.map(p => ({ id: p.id, name: p.name })));
      }

      // 2. Fetch Tasks with due_dates
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('id, title, due_date, priority, status, project:projects(name)')
        .not('due_date', 'is', null);

      if (taskError) throw taskError;

      const mappedEvents: CalendarEvent[] = [];

      // Add Tasks
      taskData?.forEach((t: any) => {
        if (t.due_date) {
          mappedEvents.push({
            id: t.id,
            title: t.title,
            date: t.due_date.split('T')[0],
            type: 'task',
            priority: t.priority,
            status: t.status,
            projectName: t.project?.name,
          });
        }
      });

      // Add Project Milestones
      projectData?.forEach((p: any) => {
        if (p.due_date) {
          mappedEvents.push({
            id: `proj-${p.id}`,
            title: `🚀 ${p.name} (Launch)`,
            date: p.due_date.split('T')[0],
            type: 'project',
            status: p.status,
          });
        }
      });

      setEvents(mappedEvents);
    } catch (err) {
      console.error('Error fetching calendar data:', err);
      toast.error('Failed to load deadlines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();

    // Realtime listener
    const channel = supabase
      .channel('calendar_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => fetchCalendarData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchCalendarData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Calendar Math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const openAddModal = (prefillDate?: string) => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  setEventDate(prefillDate ?? todayStr);
  setIsModalOpen(true);
};

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate || !user) return;

    try {
      setSubmitting(true);
      const { error } = await supabase.from('tasks').insert({
        title: eventTitle.trim(),
        due_date: new Date(eventDate).toISOString(),
        priority: eventPriority,
        project_id: selectedProjectId || null,
        assigned_to: user.id,
        status: 'todo',
      });

      if (error) throw error;

      toast.success('Deadline scheduled successfully');
      setIsModalOpen(false);
      setEventTitle('');
      setSelectedProjectId('');
      fetchCalendarData();
    } catch (err) {
      toast.error('Failed to add deadline');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityStyle = (priority?: string, type?: string) => {
    if (type === 'project') {
      return 'bg-purple-950/60 text-purple-300 border-purple-800';
    }
    switch (priority) {
      case 'high': return 'bg-red-950/60 text-red-400 border-red-900/60';
      case 'medium': return 'bg-amber-950/60 text-amber-300 border-amber-900/60';
      default: return 'bg-blue-950/60 text-blue-300 border-blue-900/60';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400">
            <CalendarIcon size={24} />
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {monthNames[month]} {year}
            </h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">View and manage your upcoming deadlines.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#151b28] border border-gray-800 rounded-xl p-1 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1 text-xs font-bold text-gray-200 hover:text-white transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <button
            onClick={() => openAddModal()}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus size={16} /> Add Event
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-[#0f1422] rounded-3xl border border-gray-800/80 shadow-2xl overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-800 text-center py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-[#131929]">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Calendar Body */}
        {loading ? (
          <div className="p-24 flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-500" size={36} />
          </div>
        ) : (
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-gray-800/80 border-b border-gray-800">
            {/* Empty Offset Days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[120px] bg-[#0c101c]/40" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = events.filter(e => e.date === dateString);

              const today = new Date();
              const isToday = 
                today.getDate() === day &&
                today.getMonth() === month &&
                today.getFullYear() === year;

              return (
                <div
                  key={day}
                  onClick={() => openAddModal(dateString)}
                  className="min-h-[120px] p-2 flex flex-col justify-between hover:bg-[#151c2e]/60 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                        isToday
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-gray-300 group-hover:text-white'
                      }`}
                    >
                      {day}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-gray-500 font-medium">
                        {dayEvents.length} {dayEvents.length === 1 ? 'task' : 'tasks'}
                      </span>
                    )}
                  </div>

                  {/* Render Event Chips */}
                  <div className="space-y-1.5 my-1 flex-1 overflow-y-auto max-h-[85px] custom-scrollbar">
                    {dayEvents.map(evt => (
                      <div
                        key={evt.id}
                        onClick={(e) => e.stopPropagation()}
                        className={`px-2 py-1 rounded-lg text-[10px] font-semibold truncate border ${getPriorityStyle(evt.priority, evt.type)} shadow-xs`}
                        title={`${evt.title} (${evt.projectName || 'Task'})`}
                      >
                        {evt.title}
                      </div>
                    ))}
                  </div>

                  <div className="text-[10px] text-transparent group-hover:text-indigo-400 font-medium transition-colors">
                    + Add
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Deadline Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#121826] rounded-3xl p-6 max-w-md w-full border border-gray-800 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-gray-800">
              <h3 className="font-bold text-sm text-white">Schedule Task Deadline</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Beta Release 1.4"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-800 bg-[#0c101c] text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Assign to Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-800 bg-[#0c101c] text-white outline-none focus:border-indigo-500"
                >
                  <option value="">No Project (General)</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Target Date</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-800 bg-[#0c101c] text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Priority</label>
                  <select
                    value={eventPriority}
                    onChange={(e) => setEventPriority(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-800 bg-[#0c101c] text-white outline-none focus:border-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Deadline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}