import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  Download,
  Activity
} from 'lucide-react';

// --- Types ---
type TimeRange = '7d' | '30d' | '90d';

interface AnalyticsData {
  tasks: { total: number; trend: number };
  hours: { total: number; trend: number };
  productivity: { score: number; trend: number };
  // We use simple numbers for the line chart (0-100 scale for simplicity)
  graphData: number[];
  labels: string[];
  projectProgress: { name: string; progress: number; color: string }[];
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [isLoading, setIsLoading] = useState(false);
  
  // Default Data
  const [data, setData] = useState<AnalyticsData>({
    tasks: { total: 128, trend: 12 },
    hours: { total: 42, trend: 5 },
    productivity: { score: 94, trend: 2 },
    graphData: [30, 45, 35, 60, 50, 75, 65], // 7 Points for 7 Days
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    projectProgress: [
        { name: 'Website Redesign', progress: 75, color: 'bg-indigo-500' },
        { name: 'Mobile App', progress: 45, color: 'bg-emerald-500' },
        { name: 'Marketing', progress: 30, color: 'bg-orange-500' },
    ]
  });

  // Simulator: Change data when Time Range changes
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
        if (timeRange === '7d') {
            setData(prev => ({
                ...prev,
                tasks: { total: 128, trend: 12 },
                graphData: [30, 50, 40, 70, 50, 80, 60],
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            }));
        } else if (timeRange === '30d') {
            setData(prev => ({
                ...prev,
                tasks: { total: 540, trend: -4 },
                graphData: [40, 30, 60, 45, 70, 55, 85, 60, 75, 90], // More points
                labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10']
            }));
        } else {
             setData(prev => ({
                ...prev,
                tasks: { total: 2400, trend: 25 },
                graphData: [20, 40, 30, 50, 60, 80, 70, 90, 85, 95, 80, 100],
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            }));
        }
        setIsLoading(false);
    }, 600);
  }, [timeRange]);

  return (
    <div className="p-8 max-w-7xl mx-auto dark:text-gray-100">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Performance Analytics</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track your team's velocity and completion rates.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 flex shadow-sm">
                <FilterButton label="7 Days" active={timeRange === '7d'} onClick={() => setTimeRange('7d')} />
                <FilterButton label="30 Days" active={timeRange === '30d'} onClick={() => setTimeRange('30d')} />
                <FilterButton label="90 Days" active={timeRange === '90d'} onClick={() => setTimeRange('90d')} />
            </div>
            <button className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors">
                <Download size={20} />
            </button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatBox 
            label="Tasks Completed" 
            value={data.tasks.total} 
            trend={data.tasks.trend} 
            icon={<Activity size={24} className="text-white" />} 
            color="bg-indigo-600" 
            isLoading={isLoading}
        />
        <StatBox 
            label="Hours Logged" 
            value={`${data.hours.total}h`} 
            trend={data.hours.trend} 
            icon={<Clock size={24} className="text-white" />} 
            color="bg-emerald-600" 
            isLoading={isLoading}
        />
        <StatBox 
            label="Productivity Score" 
            value={`${data.productivity.score}%`} 
            trend={data.productivity.trend} 
            icon={<TrendingUp size={24} className="text-white" />} 
            color="bg-orange-500" 
            isLoading={isLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- ACTIVE GRAPH (Smooth Area Chart) --- */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Activity Trend</h3>
            <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Performance
                </span>
            </div>
          </div>
          
          {/* Chart Container */}
          <div className="h-72 w-full relative">
             {isLoading ? (
                 <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                 </div>
             ) : (
                 <SmoothLineChart data={data.graphData} labels={data.labels} />
             )}
          </div>
        </div>

        {/* Project Progress */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col transition-all">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-6">Project Status</h3>
          
          <div className="space-y-6 flex-1">
            {data.projectProgress.map((project, i) => (
                <div key={i}>
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{project.name}</span>
                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">{project.progress}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                            className={`h-full ${project.color} transition-all duration-1000 ease-out`} 
                            style={{ width: isLoading ? '0%' : `${project.progress}%` }}
                        ></div>
                    </div>
                </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Team Distribution</h4>
            <div className="flex items-center gap-4">
                {/* CSS Only Donut Chart */}
                <div className="relative w-16 h-16 rounded-full bg-indigo-100 dark:bg-gray-700" style={{
                    background: `conic-gradient(#6366f1 0% 65%, #10b981 65% 85%, #f97316 85% 100%)`
                }}>
                    <div className="absolute inset-2 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <Users size={16} className="text-gray-400" />
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Engineering (65%)
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Design (20%)
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div> Product (15%)
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/// --- REFINED CHART COMPONENT (Small Font & Neat Tooltips) ---
function SmoothLineChart({ data, labels }: { data: number[], labels: string[] }) {
    const height = 100;
    const width = 100;
    // Add 20% headroom so the peak doesn't hit the very top
    const maxVal = Math.max(...data) * 1.2; 
    
    // Map data to SVG coordinates
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - (val / maxVal) * height;
        return [x, y];
    });

    // Generate Path Command with Tighter Curves (Smoothing 0.15)
    const pathData = points.reduce((acc, point, i, a) => {
        if (i === 0) return `M ${point[0]},${point[1]}`;
        
        const prev = a[i - 1];
        // Reduced smoothing to 0.15 to prevent "loops"
        const smoothing = 0.15; 
        
        const lineX = point[0] - prev[0];
        const lineY = point[1] - prev[1];
        
        const cp1x = prev[0] + lineX * smoothing;
        const cp1y = prev[1];
        
        const cp2x = point[0] - lineX * smoothing;
        const cp2y = point[1];
        
        return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${point[0]},${point[1]}`;
    }, "");

    // Close the area for the gradient fill
    const areaPath = `${pathData} L ${width},${height} L 0,${height} Z`;

    return (
        <div className="w-full h-full relative group select-none">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Subtle Grid Lines */}
                {[0, 25, 50, 75, 100].map(y => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="currentColor" strokeOpacity="0.05" strokeWidth="0.5" className="text-gray-500 dark:text-gray-400" />
                ))}

                {/* Fill Area */}
                <path d={areaPath} fill="url(#chartGradient)" className="animate-in fade-in duration-1000" />

                {/* Main Line Stroke (Thinner) */}
                <path 
                    d={pathData} 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-indigo-600 dark:text-indigo-400 drop-shadow-sm path-draw"
                />
                
                {/* Interactive Dots & Tooltips */}
                {points.map((p, i) => (
                    <g key={i} className="group/dot">
                        {/* Invisible large hover target (Hitbox) */}
                        <circle cx={p[0]} cy={p[1]} r="6" fill="transparent" className="cursor-pointer" />
                        
                        {/* The visible dot (Small & Sharp) */}
                        <circle 
                            cx={p[0]} cy={p[1]} r="2" 
                            className="fill-indigo-600 dark:fill-indigo-400 stroke-white dark:stroke-gray-800 stroke-[1.5px] opacity-0 group-hover/dot:opacity-100 transition-all duration-200 pointer-events-none"
                        />

                        {/* Refined Tooltip (Small Font) */}
                        <foreignObject x={p[0] - 20} y={p[1] - 30} width="40" height="30" className="overflow-visible opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200 pointer-events-none">
                             <div className="flex flex-col items-center justify-end h-full">
                                 {/* Tooltip Bubble */}
                                 <div className="bg-gray-900 dark:bg-gray-700 text-white text-[10px] font-bold py-0.5 px-2 rounded shadow-md leading-none">
                                    {data[i]}
                                 </div>
                                 {/* Tiny Triangle Pointer */}
                                 <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[3px] border-t-gray-900 dark:border-t-gray-700"></div>
                             </div>
                        </foreignObject>
                    </g>
                ))}
            </svg>

            {/* X-Axis Labels */}
            <div className="absolute bottom-0 left-0 w-full flex justify-between text-[9px] font-medium text-gray-400 dark:text-gray-500 transform translate-y-4 px-1">
                {labels.map((l, i) => (
                    <span key={i}>{l}</span>
                ))}
            </div>

            <style>{`
                .path-draw {
                    stroke-dasharray: 1000;
                    stroke-dashoffset: 1000;
                    animation: draw 1.5s ease-out forwards;
                }
                @keyframes draw {
                    to { stroke-dashoffset: 0; }
                }
            `}</style>
        </div>
    );
}

// --- Sub Components ---

function FilterButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                active 
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
        >
            {label}
        </button>
    );
}

function StatBox({ label, value, trend, icon, color, isLoading }: any) {
  const isPositive = trend > 0;
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20`}>
             <div className={`p-2 rounded-lg ${color} text-white shadow-sm`}>
                {icon}
             </div>
        </div>
        
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400' : 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'} px-2 py-1 rounded-full`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
        </div>
      </div>
      
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{label}</p>
        <h2 className={`text-3xl font-bold text-gray-900 dark:text-white transition-opacity duration-500 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
            {value}
        </h2>
      </div>
    </div>
  );
}