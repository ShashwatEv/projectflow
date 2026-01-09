import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, Calendar as CalendarIcon, MoreHorizontal } from 'lucide-react';

// Define event structure
interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  type: 'meeting' | 'deadline' | 'review';
  color: string;
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // Default to Jan 2026
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Mock Events State
  const [events, setEvents] = useState<CalendarEvent[]>([
    { 
      id: 1, 
      title: 'Design System Review', 
      date: new Date(2026, 0, 12), 
      type: 'review', 
      color: 'bg-purple-100 text-purple-700 border-purple-200' 
    },
    { 
      id: 2, 
      title: 'Sprint Deadline', 
      date: new Date(2026, 0, 15), 
      type: 'deadline', 
      color: 'bg-red-100 text-red-700 border-red-200' 
    },
    { 
      id: 3, 
      title: 'Team Sync', 
      date: new Date(2026, 0, 5), 
      type: 'meeting', 
      color: 'bg-blue-100 text-blue-700 border-blue-200' 
    },
    { 
        id: 4, 
        title: 'Client Demo', 
        date: new Date(2026, 0, 28), 
        type: 'meeting', 
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200' 
      },
  ]);

  // --- Calendar Logic Helpers ---

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear();
  };

  const handleAddEvent = () => {
    const title = prompt("Enter event title:");
    if (title) {
        const newEvent: CalendarEvent = {
            id: Date.now(),
            title,
            date: selectedDate, // Use the currently selected date
            type: 'meeting',
            color: 'bg-indigo-100 text-indigo-700 border-indigo-200'
        };
        setEvents([...events, newEvent]);
    }
  };

  // --- Grid Generation ---
  
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  
  // Create array for empty slots before the 1st of the month
  const blanks = Array(firstDay).fill(null);
  // Create array for actual days
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="p-8 h-full flex flex-col">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                {monthNames[currentDate.getMonth()]} 
                <span className="text-gray-400 font-normal">{currentDate.getFullYear()}</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage your schedule and deadlines.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-50 rounded-md text-gray-600 transition-colors">
                    <ChevronLeft size={20} />
                </button>
                <div className="w-px bg-gray-200 mx-1"></div>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-50 rounded-md text-gray-600 transition-colors">
                    <ChevronRight size={20} />
                </button>
            </div>
            <button 
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm"
            >
                Today
            </button>
            <button 
                onClick={handleAddEvent}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all"
            >
                <Plus size={18} />
                Add Event
            </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden">
        
        {/* Days Header (Sun, Mon...) */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* The Days Grid */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          
          {/* Render Blank Slots */}
          {blanks.map((_, i) => (
            <div key={`blank-${i}`} className="bg-gray-50/30 border-r border-b border-gray-100 min-h-[120px]"></div>
          ))}

          {/* Render Actual Days */}
          {days.map((day) => {
             // Construct the actual date object for this cell
             const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
             const isToday = isSameDay(cellDate, new Date());
             const isSelected = isSameDay(cellDate, selectedDate);
             
             // Find events for this specific day
             const dayEvents = events.filter(e => isSameDay(e.date, cellDate));

             return (
                <div 
                    key={day} 
                    onClick={() => setSelectedDate(cellDate)}
                    className={`
                        relative border-r border-b border-gray-100 p-2 min-h-[120px] transition-all cursor-pointer group
                        ${isSelected ? 'bg-indigo-50/50 ring-2 ring-inset ring-indigo-500/20' : 'hover:bg-gray-50'}
                        ${isToday ? 'bg-gray-50' : ''}
                    `}
                >
                    {/* Date Number */}
                    <div className="flex justify-between items-start mb-2">
                        <span className={`
                            text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full transition-colors
                            ${isToday ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-700'}
                            ${isSelected && !isToday ? 'text-indigo-700 font-bold' : ''}
                        `}>
                            {day}
                        </span>
                        {/* Add Button on Hover */}
                        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded text-gray-400 transition-opacity">
                            <Plus size={14} />
                        </button>
                    </div>
                    
                    {/* Events List */}
                    <div className="space-y-1.5">
                        {dayEvents.map((event) => (
                            <div 
                                key={event.id} 
                                className={`text-[10px] px-2 py-1 rounded border truncate font-medium ${event.color} cursor-pointer hover:opacity-80 transition-opacity`}
                                title={event.title}
                            >
                                {event.title}
                            </div>
                        ))}
                    </div>
                </div>
             );
          })}
        </div>
      </div>
    </div>
  );
}