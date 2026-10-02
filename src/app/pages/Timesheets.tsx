import { useState, useEffect, useRef } from 'react';
import { 
  Play, Square, Plus, Calendar, Clock, 
  Trash2, MoreVertical, X, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

interface TimeEntry {
  id: string;
  date: string;
  project_id: string | null;
  description: string;
  duration_minutes: number;
  status: 'pending' | 'approved' | 'rejected';
  project?: {
    id: string;
    name: string;
  };
}

interface ProjectOption {
  id: string;
  name: string;
}

export default function Timesheets() {
  const { user } = useAuth();

  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual Entry Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [entryDescription, setEntryDescription] = useState('');
  const [entryHours, setEntryHours] = useState('1');
  const [entryMinutes, setEntryMinutes] = useState('0');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  // Live Timer
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch projects list for dropdowns
  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');
      if (!error && data) setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  // Fetch timesheet entries for current user
  const fetchEntries = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('timesheets')
        .select('*, project:projects(id, name)')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setEntries(data as TimeEntry[]);
    } catch (err: any) {
      console.error('Error fetching timesheets:', err);
      toast.error('Failed to load timesheet entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchEntries();

    const channel = supabase
      .channel(`timesheets_${user?.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'timesheets', filter: `user_id=eq.${user?.id}` },
        () => fetchEntries()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [user?.id]);

  // Live Timer controls
  const handleToggleTimer = () => {
    if (!isTimerRunning) {
      setIsTimerRunning(true);
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
      toast.info('Timer started');
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsTimerRunning(false);

      const elapsedMinutes = Math.max(1, Math.round(timerSeconds / 60));
      // Pre-fill modal with tracked elapsed duration
      setEntryHours(String(Math.floor(elapsedMinutes / 60)));
      setEntryMinutes(String(elapsedMinutes % 60));
      setTimerSeconds(0);
      setIsModalOpen(true);
    }
  };

  const formatTimerClock = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format minutes into "4h 30m"
  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  // Calculate current week's total minutes
  const calculateTotalMinutesThisWeek = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const diffToMonday = (currentDay === 0 ? -6 : 1) - currentDay;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    return entries
      .filter(e => new Date(e.date) >= startOfWeek)
      .reduce((sum, e) => sum + (e.duration_minutes || 0), 0);
  };

  const weeklyMinutes = calculateTotalMinutesThisWeek();
  const weeklyHours = Math.floor(weeklyMinutes / 60);
  const weeklyRemainderMins = weeklyMinutes % 60;
  const weeklyProgressPercent = Math.min(100, Math.round((weeklyMinutes / (40 * 60)) * 100));

  // Submit new manual entry
  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const totalMins = (parseInt(entryHours || '0') * 60) + parseInt(entryMinutes || '0');
    if (totalMins <= 0) {
      toast.error('Please enter a duration greater than 0 minutes');
      return;
    }
    if (!entryDescription.trim()) {
      toast.error('Please enter a description');
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase.from('timesheets').insert({
        user_id: user.id,
        project_id: selectedProjectId || null,
        description: entryDescription.trim(),
        duration_minutes: totalMins,
        date: entryDate,
        status: 'approved',
      });

      if (error) throw error;

      toast.success('Time entry logged successfully');
      setIsModalOpen(false);
      setEntryDescription('');
      setEntryHours('1');
      setEntryMinutes('0');
      fetchEntries();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to log time entry');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete an entry
  const handleDeleteEntry = async (id: string) => {
    if (!window.confirm('Delete this time entry?')) return;
    try {
      const { error } = await supabase.from('timesheets').delete().eq('id', id);
      if (error) throw error;
      setEntries(prev => prev.filter(e => e.id !== id));
      toast.success('Time entry removed');
    } catch (err) {
      toast.error('Failed to delete entry');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Timesheets</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track your hours and manage logs.
          </p>
        </div>

        {/* Weekly Progress Bar & Live Timer */}
        <div className="flex items-center gap-4 bg-white dark:bg-gray-800/80 p-3 rounded-2xl border border-gray-200 dark:border-gray-700/80 shadow-sm">
          <div className="min-w-[150px] px-2">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total this week</div>
            <div className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
              {weeklyHours}h {weeklyRemainderMins}m <span className="text-gray-400 font-normal">/ 40h</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${weeklyProgressPercent}%` }} 
              />
            </div>
          </div>

          <button
            onClick={handleToggleTimer}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 ${
              isTimerRunning 
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-red-500/20' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
            }`}
          >
            {isTimerRunning ? (
              <>
                <Square size={14} className="fill-white" />
                <span>Stop ({formatTimerClock(timerSeconds)})</span>
              </>
            ) : (
              <>
                <Play size={14} className="fill-white" />
                <span>Start Timer</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-gray-800/80 rounded-3xl border border-gray-200 dark:border-gray-700/80 shadow-sm overflow-hidden">
        {/* Table Subheader */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
            <Calendar size={15} className="text-indigo-600 dark:text-indigo-400" />
            <span>Activity Log</span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            <Plus size={15} /> Log Manual Entry
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700/60 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-900/30">
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Project</th>
                <th className="py-3.5 px-6">Description</th>
                <th className="py-3.5 px-6">Duration</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400">
                    <Loader2 className="animate-spin text-indigo-600 mx-auto" size={24} />
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400 text-xs">
                    No time entries logged yet. Click "Start Timer" or "Log Manual Entry" above.
                  </td>
                </tr>
              ) : (
                entries.map(entry => (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {entry.project?.name ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          {entry.project.name}
                        </span>
                      ) : (
                        <span className="text-gray-400">General</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300 font-medium max-w-xs truncate">
                      {entry.description}
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                      {formatDuration(entry.duration_minutes)}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 capitalize">
                        <CheckCircle2 size={11} /> {entry.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg transition-colors"
                        title="Delete log"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Log Time Entry</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-indigo-500"
                >
                  <option value="">No Project (General Work)</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Homepage Hero Section"
                  value={entryDescription}
                  onChange={(e) => setEntryDescription(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Hours</label>
                  <input
                    type="number"
                    min="0"
                    value={entryHours}
                    onChange={(e) => setEntryHours(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Minutes</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={entryMinutes}
                    onChange={(e) => setEntryMinutes(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}