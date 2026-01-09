import { useState, useEffect, useRef } from 'react';
import { 
  Zap, Plus, Slack, Mail, CheckCircle2, 
  MoreVertical, Trash2, Play, X, Loader2, Save,
  Github, Clock, AlertTriangle 
} from 'lucide-react';

// --- Types ---
type Rule = {
  id: number;
  name: string;
  trigger: string;
  action: string;
  active: boolean;
  iconType: 'slack' | 'mail' | 'task' | 'github' | 'time' | 'alert' | 'default';
  lastRun?: string;
};

export default function Automations() {
  // --- State with 3 NEW Rules Added ---
  const [rules, setRules] = useState<Rule[]>([
    { id: 1, name: 'Auto-Archive Done Tasks', trigger: 'Status changed to "Done"', action: 'Archive after 7 days', active: true, iconType: 'task', lastRun: '2 hours ago' },
    { id: 2, name: 'Notify Slack on High Priority', trigger: 'New High Priority Issue', action: 'Send message to #general', active: true, iconType: 'slack', lastRun: 'Just now' },
    { id: 3, name: 'Welcome Email', trigger: 'New User Joined', action: 'Send "Onboarding" email', active: false, iconType: 'mail' },
    
    // --- NEW CARDS ---
    { id: 4, name: 'Sync GitHub PRs', trigger: 'Pull Request Merged', action: 'Move Task to "Deployed"', active: true, iconType: 'github', lastRun: '1 day ago' },
    { id: 5, name: 'Timesheet Reminder', trigger: 'Every Friday at 5 PM', action: 'Send Email to All Staff', active: true, iconType: 'time', lastRun: '3 days ago' },
    { id: 6, name: 'Escalate Overdue Tasks', trigger: 'Due Date Passed > 48h', action: 'Mark Critical & Notify Manager', active: false, iconType: 'alert' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [runningId, setRunningId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({ name: '', trigger: '', action: '', iconType: 'default' });

  // --- Handlers ---

  const handleToggle = (id: number) => {
    setLoadingId(id);
    setTimeout(() => {
        setRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
        setLoadingId(null);
    }, 600);
  };

  const handleDelete = (id: number) => {
    if (confirm('Delete this automation rule?')) {
        setRules(rules.filter(r => r.id !== id));
    }
  };

  const handleRunNow = (id: number) => {
    setRunningId(id);
    setTimeout(() => {
        setRunningId(null);
        setRules(rules.map(r => r.id === id ? { ...r, lastRun: 'Just now' } : r));
        alert('Automation ran successfully!');
    }, 1500);
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    const newRule: Rule = {
        id: Date.now(),
        name: formData.name,
        trigger: formData.trigger,
        action: formData.action,
        active: true,
        iconType: formData.iconType as any,
        lastRun: 'Never'
    };
    setRules([...rules, newRule]);
    setIsModalOpen(false);
    setFormData({ name: '', trigger: '', action: '', iconType: 'default' });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
       
       {/* Header */}
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
           <div>
               <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                   <Zap className="text-yellow-500 fill-yellow-500" /> Automations
               </h1>
               <p className="text-gray-500 dark:text-gray-400 mt-2">Streamline your workflow with "If This Then That" rules.</p>
           </div>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
           >
               <Plus size={20} /> New Rule
           </button>
       </div>

       {/* Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
           {rules.map((rule) => (
               <AutomationCard 
                 key={rule.id} 
                 rule={rule} 
                 onToggle={() => handleToggle(rule.id)}
                 onDelete={() => handleDelete(rule.id)}
                 onRun={() => handleRunNow(rule.id)}
                 isLoading={loadingId === rule.id}
                 isRunning={runningId === rule.id}
               />
           ))}
       </div>

       {/* Create Modal */}
       {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Automation</h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                
                <form onSubmit={handleSaveRule} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rule Name</label>
                        <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Weekly Report" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trigger (IF)</label>
                        <input required value={formData.trigger} onChange={e => setFormData({...formData, trigger: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Task is Overdue" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Action (THEN)</label>
                        <input required value={formData.action} onChange={e => setFormData({...formData, action: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Email Manager" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon</label>
                        <select value={formData.iconType} onChange={e => setFormData({...formData, iconType: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="default">Default</option>
                            <option value="slack">Slack</option>
                            <option value="mail">Email</option>
                            <option value="task">Task</option>
                            <option value="github">GitHub</option>
                            <option value="time">Clock/Time</option>
                            <option value="alert">Alert</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 mt-4">
                        <Save size={18} /> Create Rule
                    </button>
                </form>
            </div>
         </div>
       )}
    </div>
  );
}

// --- Sub-Component: Rule Card with Dropdown ---
function AutomationCard({ rule, onToggle, onDelete, onRun, isLoading, isRunning }: any) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Click outside to close menu
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getIcon = (type: string) => {
        switch(type) {
            case 'slack': return <Slack className="text-purple-500" />;
            case 'mail': return <Mail className="text-blue-500" />;
            case 'task': return <CheckCircle2 className="text-emerald-500" />;
            case 'github': return <Github className="text-gray-900 dark:text-white" />;
            case 'time': return <Clock className="text-orange-500" />;
            case 'alert': return <AlertTriangle className="text-red-500" />;
            default: return <Zap className="text-yellow-500" />;
        }
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl relative ${rule.active ? 'border-indigo-100 dark:border-gray-700' : 'border-gray-100 dark:border-gray-800 opacity-80 grayscale-[0.5]'}`}>
            
            {/* Top Row */}
            <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl shadow-sm">
                    {getIcon(rule.iconType)}
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Toggle Switch */}
                    <button 
                        onClick={onToggle}
                        disabled={isLoading}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 flex items-center ${rule.active ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'} ${isLoading ? 'cursor-wait opacity-70' : ''}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${rule.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>

                    {/* Dropdown Menu */}
                    <div className="relative" ref={menuRef}>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <MoreVertical size={20} />
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <button onClick={() => { onRun(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200">
                                    <Play size={14} /> Run Now
                                </button>
                                <button onClick={() => { onDelete(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2">
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 line-clamp-1" title={rule.name}>{rule.name}</h3>
            
            {/* Logic Block */}
            <div className="space-y-3 relative">
                <div className="flex items-center gap-3 text-sm p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700 group cursor-default">
                    <span className="font-mono text-[10px] font-bold text-gray-400 uppercase bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded">IF</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium truncate">{rule.trigger}</span>
                </div>
                
                <div className="absolute left-6 top-[38px] w-0.5 h-4 bg-gray-200 dark:bg-gray-700 z-0"></div>
                
                <div className="flex items-center gap-3 text-sm p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800 group cursor-default relative z-10">
                    <span className="font-mono text-[10px] font-bold text-indigo-500 uppercase bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 px-1.5 py-0.5 rounded">THEN</span>
                    <span className="text-indigo-900 dark:text-indigo-300 font-medium truncate">{rule.action}</span>
                </div>
            </div>

            {/* Footer Status */}
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${rule.active ? 'text-emerald-500' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${rule.active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    {rule.active ? 'Active' : 'Paused'}
                </span>
                
                {isRunning ? (
                    <div className="flex items-center gap-2 text-xs text-indigo-600 font-medium animate-pulse">
                        <Loader2 size={12} className="animate-spin" /> Running...
                    </div>
                ) : (
                    <span className="text-xs text-gray-400 font-medium">
                        Last run: {rule.lastRun || 'Never'}
                    </span>
                )}
            </div>
        </div>
    );
}