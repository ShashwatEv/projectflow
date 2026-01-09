import { useState } from 'react';
import { 
  CheckCircle2, Circle, Clock, Tag, Trash2, Plus, 
  Filter, Flag, ArrowUpDown, ChevronLeft, ChevronRight, X 
} from 'lucide-react';

export default function MyTasks() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [newTaskInput, setNewTaskInput] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  
  // --- BULK ACTIONS STATE ---
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);

  // --- CALENDAR STATE (Fully Dynamic) ---
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [tasks, setTasks] = useState([
    { id: 1, title: "Review Pull Request #402", project: "Website Redesign", due: "Today", tag: "Review", completed: false, priority: 3 },
    { id: 2, title: "Update User Documentation", project: "Mobile App", due: "Tomorrow", tag: "Docs", completed: false, priority: 1 },
    { id: 3, title: "Fix Navigation Bug", project: "Website Redesign", due: "Jan 12", tag: "Bug", completed: true, priority: 2 },
    { id: 4, title: "Weekly Team Sync", project: "Internal", due: "Jan 15", tag: "Meeting", completed: false, priority: 1 },
  ]);

  const [tags] = useState([
      { name: 'Review', color: 'bg-purple-500' },
      { name: 'Docs', color: 'bg-blue-500' },
      { name: 'Bug', color: 'bg-red-500' },
      { name: 'Meeting', color: 'bg-emerald-500' },
  ]);

  // --- CALENDAR LOGIC ---
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear();
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const startDay = getFirstDayOfMonth(currentMonth); // 0 = Sunday
    const days = [];

    // Empty slots for previous month
    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }

    // Actual days
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const dateToCheck = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
        const isToday = isSameDay(dateToCheck, today);
        const isSelected = selectedDate && isSameDay(dateToCheck, selectedDate);

        days.push(
            <button 
                key={i} 
                onClick={() => setSelectedDate(dateToCheck)}
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 
                    ${isSelected 
                        ? 'bg-indigo-600 text-white shadow-md scale-110' 
                        : isToday 
                            ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 font-bold' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
            >
                {i}
            </button>
        );
    }
    return days;
  };

  // --- TASK HANDLERS ---
  const toggleTaskComplete = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const toggleTaskSelection = (id: number) => {
    setSelectedTasks(prev => 
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const deleteSelected = () => {
    setTasks(tasks.filter(t => !selectedTasks.includes(t.id)));
    setSelectedTasks([]);
  };

  const markSelectedComplete = () => {
    setTasks(tasks.map(t => selectedTasks.includes(t.id) ? { ...t, completed: true } : t));
    setSelectedTasks([]);
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    const newTask = {
      id: Date.now(),
      title: newTaskInput,
      project: "Inbox",
      due: "Today",
      tag: "General",
      completed: false,
      priority: 0
    };
    setTasks([newTask, ...tasks]);
    setNewTaskInput('');
  };

  const getPriorityColor = (p: number) => {
      switch(p) {
          case 3: return "text-red-500 fill-red-500/10";
          case 2: return "text-orange-500 fill-orange-500/10";
          case 1: return "text-blue-500 fill-blue-500/10";
          default: return "text-gray-300 dark:text-gray-600";
      }
  };

  // Filter Tasks
  const processedTasks = tasks
    .filter(t => {
      // In a real app, compare t.due (Date) with selectedDate
      if (selectedDate) return true; 
      if (filter === 'pending') return !t.completed;
      if (filter === 'completed') return t.completed;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') return b.priority - a.priority;
      return 0;
    });

  return (
    <div className="flex h-full">
        {/* MAIN TASKS AREA */}
        <div className="flex-1 p-8 overflow-y-auto flex flex-col h-full relative">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
                    {selectedDate && (
                        <p className="text-sm text-indigo-600 mt-1 flex items-center gap-1 cursor-pointer hover:underline" onClick={() => setSelectedDate(null)}>
                            Showing tasks for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} <X size={12} />
                        </p>
                    )}
                </div>
                
                <div className="flex gap-2 items-center">
                    <button onClick={() => setSortBy(sortBy === 'date' ? 'priority' : 'date')} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 mr-4 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <ArrowUpDown size={14} />
                        Sort by {sortBy === 'date' ? 'Date' : 'Priority'}
                    </button>
                    <FilterBtn label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
                    <FilterBtn label="Pending" active={filter === 'pending'} onClick={() => setFilter('pending')} />
                    <FilterBtn label="Done" active={filter === 'completed'} onClick={() => setFilter('completed')} />
                </div>
            </div>

            {/* Add Task Input */}
            <form onSubmit={addTask} className="mb-6 relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Plus className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                </div>
                <input 
                    type="text" 
                    value={newTaskInput}
                    onChange={(e) => setNewTaskInput(e.target.value)}
                    placeholder="Add a new task..." 
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 rounded-xl shadow-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-all"
                />
            </form>
            
            {/* Task List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1 mb-12">
                {processedTasks.map((task) => (
                    <div 
                        key={task.id} 
                        className={`flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 transition-colors group animate-in slide-in-from-bottom-2 duration-300 ${
                            selectedTasks.includes(task.id) ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                        onClick={() => toggleTaskSelection(task.id)}
                    >
                        <div className="flex items-center gap-4 flex-1">
                            <div onClick={(e) => e.stopPropagation()}>
                                <input 
                                    type="checkbox" 
                                    checked={selectedTasks.includes(task.id)}
                                    onChange={() => toggleTaskSelection(task.id)}
                                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                            </div>
                            
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleTaskComplete(task.id); }}
                                className={`shrink-0 transition-all duration-200 ${task.completed ? 'text-emerald-500' : 'text-gray-300 hover:text-indigo-500'}`}
                            >
                                {task.completed ? <CheckCircle2 size={24} className="fill-emerald-50" /> : <Circle size={24} />}
                            </button>
                            
                            <div className="min-w-0">
                                <h3 className={`font-medium text-gray-900 dark:text-white truncate transition-all ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                                    {task.title}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">{task.project}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 sm:gap-6 pl-4">
                            <button className={`transition-colors ${getPriorityColor(task.priority)}`}>
                                <Flag size={18} />
                            </button>
                            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                                <Tag size={14} /> <span>{task.tag}</span>
                            </div>
                            <div className={`flex items-center gap-1.5 text-sm font-medium px-2 py-1 rounded-full ${task.completed ? 'text-gray-400 bg-gray-100 dark:bg-gray-700' : 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'}`}>
                                <Clock size={14} /> <span className="whitespace-nowrap">{task.due}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- BULK ACTIONS BAR --- */}
            {selectedTasks.length > 0 && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-4 fade-in duration-300 z-10">
                    <span className="font-medium text-sm">{selectedTasks.length} tasks selected</span>
                    <div className="h-4 w-px bg-gray-700"></div>
                    <button onClick={markSelectedComplete} className="text-sm font-medium hover:text-emerald-400 transition-colors flex items-center gap-2">
                        <CheckCircle2 size={16} /> Mark Complete
                    </button>
                    <button onClick={deleteSelected} className="text-sm font-medium hover:text-red-400 transition-colors flex items-center gap-2">
                        <Trash2 size={16} /> Delete
                    </button>
                    <button onClick={() => setSelectedTasks([])} className="ml-2 bg-gray-800 p-1 rounded-full hover:bg-gray-700">
                        <X size={14} />
                    </button>
                </div>
            )}
        </div>

        {/* SIDEBAR: MINI CALENDAR & TAGS */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-800 p-6 hidden xl:block bg-gray-50 dark:bg-gray-900/50">
            {/* Calendar Widget */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900 dark:text-white capitalize">
                        {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="flex gap-1">
                        <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"><ChevronLeft size={16} /></button>
                        <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"><ChevronRight size={16} /></button>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-2">
                    <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-sm">
                    {renderCalendarDays()}
                </div>
            </div>

            {/* Tags Widget */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900 dark:text-white">Tags</h3>
                    <button className="p-1 text-gray-400 hover:text-indigo-600 rounded"><Plus size={16} /></button>
                </div>
                <div className="space-y-2">
                    {tags.map((tag) => (
                        <div key={tag.name} className="flex items-center justify-between p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors group">
                             <div className="flex items-center gap-2">
                                 <div className={`w-2 h-2 rounded-full ${tag.color}`}></div>
                                 <span className="text-sm text-gray-700 dark:text-gray-300">{tag.name}</span>
                             </div>
                             <span className="text-xs text-gray-400">4</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
}

function FilterBtn({ label, active, onClick }: any) {
    return (
        <button 
            onClick={onClick}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                active 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
        >
            {label}
        </button>
    )
}