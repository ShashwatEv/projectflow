// REPLACE your imports with this:
import { useState, useEffect, useRef } from 'react'; // Added useRef
import { 
  Play, Pause, Clock, Calendar as CalendarIcon, MoreVertical, 
  Plus, CheckCircle2, X, Save, Timer, Trash2, Edit2 // Added Trash2, Edit2
} from 'lucide-react';

// --- Types ---
type TimeEntry = {
  id: string;
  date: string;
  project: string;
  task: string;
  durationSeconds: number;
  status: 'Approved' | 'Pending';
};

export default function Timesheets() {
  // --- State ---
  const [entries, setEntries] = useState<TimeEntry[]>([
    { id: '1', date: new Date().toLocaleDateString(), project: 'Website Redesign', task: 'Homepage Hero Section', durationSeconds: 16200, status: 'Approved' }, // 4h 30m
    { id: '2', date: new Date().toLocaleDateString(), project: 'Mobile App', task: 'Auth Flow', durationSeconds: 8100, status: 'Approved' }, // 2h 15m
  ]);
  
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentSessionSeconds, setCurrentSessionSeconds] = useState(0);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'stop' | 'manual'>('stop');
  const [formData, setFormData] = useState({ project: 'Internal', task: '', hours: '0', minutes: '0' });
  // --- Dropdown Menu Logic (New) ---
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
        setEntries(entries.filter(e => e.id !== id));
        setActiveMenuId(null);
    }
  };

  const handleEdit = (id: string) => {
    // For now, we'll just alert. You can later connect this to your isModalOpen logic.
    alert(`Edit functionality for ID: ${id}`);
    setActiveMenuId(null);
  };

  // --- Timer Logic ---
  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setCurrentSessionSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // --- Helpers ---
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    // Show seconds only if actively timing, otherwise H:M is usually enough for timesheets
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatDurationText = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const getTotalSeconds = () => {
    return entries.reduce((acc, curr) => acc + curr.durationSeconds, 0) + (isTimerRunning ? currentSessionSeconds : 0);
  };

  // --- Handlers ---
  const handleStartStop = () => {
    if (isTimerRunning) {
      // STOPPING: Pause and Open Modal
      setIsTimerRunning(false);
      setModalMode('stop');
      setFormData({ ...formData, hours: '0', minutes: '0' }); // Reset manual inputs
      setIsModalOpen(true);
    } else {
      // STARTING
      setIsTimerRunning(true);
    }
  };

  const handleManualEntry = () => {
    setModalMode('manual');
    setIsTimerRunning(false);
    setFormData({ project: 'Internal', task: '', hours: '1', minutes: '0' });
    setIsModalOpen(true);
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    
    let duration = 0;
    if (modalMode === 'stop') {
      duration = currentSessionSeconds;
    } else {
      duration = (parseInt(formData.hours) * 3600) + (parseInt(formData.minutes) * 60);
    }

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      project: formData.project,
      task: formData.task || 'Untitled Task',
      durationSeconds: duration,
      status: 'Pending'
    };

    setEntries([newEntry, ...entries]);
    
    // Cleanup
    setCurrentSessionSeconds(0);
    setIsModalOpen(false);
    setFormData({ project: 'Internal', task: '', hours: '0', minutes: '0' });
  };

  const handleDiscard = () => {
    setIsModalOpen(false);
    setCurrentSessionSeconds(0); // Discard the tracked time
  };

  // Calculate Progress for "40h Goal"
  const totalSecs = getTotalSeconds();
  const progressPercent = Math.min((totalSecs / (40 * 3600)) * 100, 100);

  return (
    <div className="p-8 max-w-6xl mx-auto relative min-h-full">
       
       {/* --- Header & Timer Widget --- */}
       <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
           <div>
               <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Timesheets</h1>
               <p className="text-gray-500 dark:text-gray-400 mt-1">Track your hours and manage logs.</p>
           </div>
           
           <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
               <div className="px-4 border-r border-gray-100 dark:border-gray-700">
                   <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase mb-0.5">Total This Week</p>
                   <div className="flex items-baseline gap-2">
                     <p className="text-xl font-bold text-gray-900 dark:text-white font-mono">{formatDurationText(totalSecs)}</p>
                     <span className="text-xs text-gray-400">/ 40h</span>
                   </div>
                   {/* Mini Progress Bar */}
                   <div className="w-24 h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-1">
                      <div className="h-1 bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                   </div>
               </div>
               
               {/* Live Timer Display */}
               {isTimerRunning && (
                 <div className="px-2 animate-pulse">
                    <p className="text-xs text-emerald-500 font-bold uppercase mb-0.5">Recording</p>
                    <p className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatTime(currentSessionSeconds)}</p>
                 </div>
               )}

               <button 
                   onClick={handleStartStop}
                   className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-all shadow-md active:scale-95 ${
                     isTimerRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
                   }`}
               >
                   {isTimerRunning ? <Pause size={20} className="fill-white" /> : <Play size={20} className="fill-white" />}
                   {isTimerRunning ? 'Stop' : 'Start Timer'}
               </button>
           </div>
       </div>

       {/* --- Main Table Area --- */}
       <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
           
           {/* Table Toolbar */}
           <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 dark:bg-gray-900/50">
               <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                   <CalendarIcon size={18} />
                   <span className="font-medium">{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - This Week</span>
               </div>
               <button 
                 onClick={handleManualEntry}
                 className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-3 py-1.5 rounded-lg transition-colors"
               >
                   <Plus size={16} /> Log Manual Entry
               </button>
           </div>

           {/* Entries Table */}
           <div className="overflow-x-auto">
             <table className="w-full text-left">
                 <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium text-sm border-b border-gray-200 dark:border-gray-700">
                     <tr>
                         <th className="px-6 py-4">Date</th>
                         <th className="px-6 py-4">Project</th>
                         <th className="px-6 py-4 w-1/3">Description</th>
                         <th className="px-6 py-4">Duration</th>
                         <th className="px-6 py-4">Status</th>
                         <th className="px-6 py-4"></th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                     {entries.length === 0 ? (
                       <tr>
                         <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                            <Clock size={48} className="mx-auto mb-3 opacity-20" />
                            <p>No time entries yet. Start the timer or log manually.</p>
                         </td>
                       </tr>
                     ) : (
                       entries.map((entry) => (
                         <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                             <td className="px-6 py-4 text-gray-900 dark:text-white font-medium whitespace-nowrap">{entry.date}</td>
                             <td className="px-6 py-4">
                                 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                     <div className={`w-1.5 h-1.5 rounded-full ${entry.project.includes('Internal') ? 'bg-gray-400' : 'bg-indigo-500'}`}></div>
                                     {entry.project}
                                 </span>
                             </td>
                             <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">{entry.task}</td>
                             <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-white">{formatDurationText(entry.durationSeconds)}</td>
                             <td className="px-6 py-4">
                                 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                     entry.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                                 }`}>
                                     {entry.status === 'Approved' ? <CheckCircle2 size={12} /> : <Timer size={12} />}
                                     {entry.status}
                                 </span>
                             </td>
                             {/* REPLACED TD BLOCK */}
                             <td className="px-6 py-4 text-right relative">
                                 <button 
                                     onClick={(e) => {
                                         e.stopPropagation();
                                         setActiveMenuId(activeMenuId === entry.id ? null : entry.id);
                                     }}
                                     className={`p-2 rounded-lg transition-colors ${activeMenuId === entry.id ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                 >
                                     <MoreVertical size={18} />
                                 </button>

                                 {/* Dropdown Menu Popup */}
                                 {activeMenuId === entry.id && (
                                     <div ref={menuRef} className="absolute right-8 top-8 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                         <button onClick={() => handleEdit(entry.id)} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                                             <Edit2 size={14} /> Edit
                                         </button>
                                         <div className="h-px bg-gray-100 dark:bg-gray-700 my-0"></div>
                                         <button onClick={() => handleDelete(entry.id)} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                                             <Trash2 size={14} /> Delete
                                         </button>
                                     </div>
                                 )}
                             </td>
                         </tr>
                       ))
                     )}
                 </tbody>
             </table>
           </div>
       </div>

       {/* --- SAVE ENTRY MODAL --- */}
       {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {modalMode === 'stop' ? 'Save Time Entry' : 'Log Manual Time'}
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                      <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSaveEntry} className="space-y-4">
                    {/* Time Display (Read-only if stopping timer) */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl flex flex-col items-center justify-center mb-4 border border-gray-100 dark:border-gray-700">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Duration</span>
                        {modalMode === 'stop' ? (
                          <span className="text-3xl font-mono font-bold text-indigo-600 dark:text-indigo-400">{formatTime(currentSessionSeconds)}</span>
                        ) : (
                          <div className="flex items-center gap-2">
                             <div className="flex flex-col items-center">
                               <input 
                                 type="number" 
                                 min="0"
                                 value={formData.hours}
                                 onChange={e => setFormData({...formData, hours: e.target.value})}
                                 className="w-16 text-center text-2xl font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1"
                               />
                               <span className="text-[10px] text-gray-400 mt-1">HOURS</span>
                             </div>
                             <span className="text-2xl font-bold text-gray-300">:</span>
                             <div className="flex flex-col items-center">
                               <input 
                                 type="number" 
                                 min="0" 
                                 max="59"
                                 value={formData.minutes}
                                 onChange={e => setFormData({...formData, minutes: e.target.value})}
                                 className="w-16 text-center text-2xl font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1"
                               />
                               <span className="text-[10px] text-gray-400 mt-1">MINS</span>
                             </div>
                          </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Project</label>
                        <select 
                          value={formData.project} 
                          onChange={e => setFormData({...formData, project: e.target.value})}
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                        >
                            <option>Internal</option>
                            <option>Website Redesign</option>
                            <option>Mobile App</option>
                            <option>API Integration</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                        <textarea 
                          rows={3}
                          value={formData.task}
                          onChange={e => setFormData({...formData, task: e.target.value})}
                          placeholder="What were you working on?"
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
                          required
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        {modalMode === 'stop' && (
                          <button type="button" onClick={handleDiscard} className="flex-1 px-4 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-xl font-medium transition-colors">
                            Discard
                          </button>
                        )}
                        <button type="submit" className="flex-[2] px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2">
                           <Save size={18} /> Save Entry
                        </button>
                    </div>
                </form>
            </div>
         </div>
       )}
    </div>
  );
}