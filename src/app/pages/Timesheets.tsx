import { useState, useEffect, useRef } from 'react';
import { 
  Play, Square, Plus, Calendar, Clock, 
  Trash2, X, Loader2, CheckCircle2, Search,
  Briefcase, TrendingUp, Sparkles, Filter
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { toast } from 'sonner';

interface TimeEntry {
  id: string;
  date: string;
  project_id: string | null;
  task_id?: string | null;
  description: string;
  duration_minutes: number;
  hours?: number;
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
  const theme = useAccentTheme();

  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');

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

  // Fetch timesheet entries for current user & normalize hours/minutes
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
      if (data) {
        const normalized = data.map((d: any) => ({
          ...d,
          // Harmonize duration whether saved as hours or duration_minutes
          duration_minutes: d.duration_minutes ?? Math.round((d.hours || 0) * 60)
        }));
        setEntries(normalized as TimeEntry[]);
      }
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
      .channel(`timesheets_live_${user?.id}`)
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
      toast.info('Workspace timer started');
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsTimerRunning(false);

      const elapsedMinutes = Math.max(1, Math.round(timerSeconds / 60));
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

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  // Weekly calculations
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
  const weeklyHours = (weeklyMinutes / 60).toFixed(1);
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
      const hoursDec = parseFloat((totalMins / 60).toFixed(2));

      const { error } = await supabase.from('timesheets').insert({
        user_id: user.id,
        project_id: selectedProjectId || null,
        description: entryDescription.trim(),
        duration_minutes: totalMins,
        hours: hoursDec,
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
      window.dispatchEvent(new Event('active-timer-started'));
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
    } catch {
      toast.error('Failed to delete entry');
    }
  };

  const filteredEntries = entries.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.project?.name && e.project.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesProject = projectFilter === 'all' || e.project_id === projectFilter;
    return matchesSearch && matchesProject;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-2xl ${theme.bgSubtle} ${theme.textAccent} border ${theme.borderAccent}/30 shadow-xs`}>
              <Clock size={24} />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Timesheets</h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Track engineering sessions, measure billable velocity, and monitor sprint targets.
          </p>
        </div>

        {/* Global Live Session Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleTimer}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md transition-all active:scale-95 ${
              isTimerRunning 
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse shadow-rose-500/20' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
            }`}
          >
            {isTimerRunning ? (
              <>
                <Square size={14} className="fill-white" />
                <span>Stop Timer ({formatTimerClock(timerSeconds)})</span>
              </>
            ) : (
              <>
                <Play size={14} className="fill-white" />
                <span>Start Session Timer</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl ${theme.btnPrimary} font-bold text-xs shadow-md transition-all active:scale-95`}
          >
            <Plus size={15} />
            <span>Log Time</span>
          </button>
        </div>
      </div>

      {/* KPI Productivity Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Weekly Output</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{weeklyHours} hrs</h3>
            <div className="w-36 bg-gray-100 dark:bg-[#0d1117] rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className={`h-full ${theme.progressBar} transition-all duration-500`}
                style={{ width: `${weeklyProgressPercent}%` }} 
              />
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 border border-indigo-200 dark:border-indigo-800/40">
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Logged</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{entries.length} Sessions</h3>
            <p className="text-[10px] text-gray-400 mt-1">Across all linked repositories</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 border border-emerald-200 dark:border-emerald-800/40">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Projects Active</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{projects.length} Workspaces</h3>
            <p className="text-[10px] text-gray-400 mt-1">Syncing with task boards</p>
          </div>
          <div className={`p-3 rounded-2xl ${theme.bgSubtle} ${theme.textAccent} border ${theme.borderAccent}/30`}>
            <Briefcase size={22} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search timesheets by description or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 outline-none ${theme.ringAccent} transition-all shadow-xs`}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 rounded-2xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-[#161b22] rounded-3xl border border-gray-200 dark:border-gray-800/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800/80 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-[#0d1117]/50">
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Project</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6">Duration</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-400">
                    <Loader2 className={`animate-spin ${theme.textAccent} mx-auto`} size={26} />
                    <span className="text-xs mt-2 block">Syncing logged timesheets...</span>
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-400 text-xs">
                    No time entries found. Start the session timer or log a manual entry above.
                  </td>
                </tr>
              ) : (
                filteredEntries.map(entry => (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                    <td className="py-4 px-6 font-mono text-gray-900 dark:text-gray-200 whitespace-nowrap">
                      {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {entry.project?.name ? (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold ${theme.bgSubtle} ${theme.textAccent} border ${theme.borderAccent}/30`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${theme.accent}`} />
                          {entry.project.name}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[11px] font-mono">Workspace General</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300 font-medium max-w-sm truncate">
                      {entry.description}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-gray-900 dark:text-white whitespace-nowrap">
                      {formatDuration(entry.duration_minutes)}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 capitalize">
                        <CheckCircle2 size={11} /> {entry.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg transition-colors opacity-70 group-hover:opacity-100"
                        title="Delete log"
                      >
                        <Trash2 size={14} />
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161b22] rounded-3xl p-6 md:p-7 max-w-md w-full border border-gray-200 dark:border-gray-800 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">Log Timesheet Entry</h3>
                <p className="text-xs text-gray-400 mt-0.5">Record completed work duration to project boards.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Target Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">General Work (No Project)</option>
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
                  placeholder="e.g. Optimized Monaco terminal layout & resolved RLS policies"
                  value={entryDescription}
                  onChange={(e) => setEntryDescription(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white outline-none ${theme.ringAccent}`}
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white outline-none font-mono"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 rounded-xl ${theme.btnPrimary} font-bold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50`}
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