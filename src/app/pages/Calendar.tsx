import { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, 
  X, Loader2, ListTodo, BriefcaseBusiness
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

type CalendarPriority = 'low' | 'medium' | 'high';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'task' | 'project';
  priority?: CalendarPriority;
  status?: string;
  projectName?: string;
  projectId?: string | null;
}

interface ProjectOption {
  id: string;
  name: string;
}

export default function Calendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'all' | 'task' | 'project'>('all');
  const [projectFilter, setProjectFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventPriority, setEventPriority] = useState<CalendarPriority>('medium');
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
        .select('id, title, due_date, priority, status, project_id, project:projects(name)')
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
            projectId: t.project_id,
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
            projectId: p.id,
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
  const visibleEvents = events.filter((event) =>
    (typeFilter === 'all' || event.type === typeFilter) &&
    (!projectFilter || event.projectId === projectFilter)
  );
  const eventsByDate = new Map<string, CalendarEvent[]>();
  visibleEvents.forEach((event) => {
    const dateEvents = eventsByDate.get(event.date) || [];
    dateEvents.push(event);
    eventsByDate.set(event.date, dateEvents);
  });

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
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
    }
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900/60';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/60';
      default: return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900/60';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <CalendarIcon size={24} />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {monthNames[month]} {year}
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">View and manage your upcoming deadlines.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white dark:bg-[#151b28] border border-gray-200 dark:border-gray-800 rounded-xl p-1 shadow-sm">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="min-h-9 min-w-9 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={handleToday}
              aria-label="Go to current month"
              className="min-h-9 px-3 py-1 text-xs font-bold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="min-h-9 min-w-9 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
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

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex flex-1 items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
          Event type
          <select
            aria-label="Filter calendar by event type"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)}
            className="min-h-10 flex-1 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-gray-800 dark:bg-[#151b28] dark:text-gray-100"
          >
            <option value="all">All events</option>
            <option value="task">Tasks</option>
            <option value="project">Project milestones</option>
          </select>
        </label>
        <label className="flex flex-1 items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
          Project
          <select
            aria-label="Filter calendar by project"
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
            className="min-h-10 flex-1 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-gray-800 dark:bg-[#151b28] dark:text-gray-100"
          >
            <option value="">All projects</option>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
        </label>
      </div>

      {/* Compact agenda for small screens */}
      <section className="md:hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[#0f1422]" aria-labelledby="calendar-agenda-heading">
        <h2 id="calendar-agenda-heading" className="border-b border-gray-200 px-4 py-3 text-sm font-bold text-gray-900 dark:border-gray-800 dark:text-white">
          {monthNames[month]} agenda
        </h2>
        {loading ? (
          <div className="flex items-center justify-center p-10" aria-label="Loading calendar events"><Loader2 className="animate-spin text-indigo-500" size={24} /></div>
        ) : visibleEvents.filter((event) => event.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No events match these filters this month.</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {Array.from({ length: daysInMonth }, (_, index) => {
              const date = new Date(year, month, index + 1);
              const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`;
              const dayEvents = eventsByDate.get(dateString) || [];
              if (!dayEvents.length) return null;
              return (
                <div key={dateString} className="flex gap-3 p-3">
                  <time dateTime={dateString} className="w-16 shrink-0 pt-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
                    {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </time>
                  <div className="min-w-0 flex-1 space-y-2">
                    {dayEvents.map((event) => (
                      <article key={event.id} className={`rounded-lg border px-3 py-2 text-xs ${getPriorityStyle(event.priority, event.type)}`}>
                        <div className="flex items-start gap-2">
                          {event.type === 'project' ? <BriefcaseBusiness size={14} aria-hidden="true" /> : <ListTodo size={14} aria-hidden="true" />}
                          <div className="min-w-0">
                            <h3 className="font-semibold">{event.title}</h3>
                            {event.projectName && <p className="mt-0.5 truncate opacity-80">{event.projectName}</p>}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Calendar Grid Container */}
      <div className="hidden md:block overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800/80 dark:bg-[#0f1422]">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-200 text-center py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:bg-[#131929]">
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
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-gray-200 border-b border-gray-200 dark:divide-gray-800/80 dark:border-gray-800">
            {/* Empty Offset Days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[120px] bg-gray-50/70 dark:bg-[#0c101c]/40" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = eventsByDate.get(dateString) || [];

              const today = new Date();
              const isToday = 
                today.getDate() === day &&
                today.getMonth() === month &&
                today.getFullYear() === year;

              return (
                <button
                  type="button"
                  key={day}
                  aria-label={`Add event on ${new Date(year, month, day).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}${dayEvents.length ? `, ${dayEvents.length} events` : ''}`}
                  onClick={() => openAddModal(dateString)}
                  className="min-h-[120px] w-full p-2 flex flex-col justify-between text-left hover:bg-gray-50 dark:hover:bg-[#151c2e]/60 transition-colors group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                        isToday
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
                      }`}
                    >
                      {day}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-gray-500 font-medium">
                        {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                      </span>
                    )}
                  </div>

                  {/* Render Event Chips */}
                  <div className="space-y-1.5 my-1 flex-1 overflow-y-auto max-h-[85px] custom-scrollbar">
                    {dayEvents.map(evt => (
                      <div
                        key={evt.id}
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
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Deadline Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121826] rounded-3xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-800 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Schedule Task Deadline</h3>
              <button type="button" aria-label="Close schedule task dialog" onClick={() => setIsModalOpen(false)} className="min-h-9 min-w-9 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Beta Release 1.4"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-800 dark:bg-[#0c101c] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Assign to Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-800 dark:bg-[#0c101c] dark:text-white"
                >
                  <option value="">No Project (General)</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Target Date</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-800 dark:bg-[#0c101c] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Priority</label>
                  <select
                    value={eventPriority}
                    onChange={(e) => setEventPriority(e.target.value as CalendarPriority)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-800 dark:bg-[#0c101c] dark:text-white"
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
                  className="min-h-10 px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="min-h-10 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all disabled:opacity-50"
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