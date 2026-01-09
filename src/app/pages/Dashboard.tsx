import { ArrowUpRight, Clock, CheckCircle2, MoreHorizontal } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back, Alex. Here's what's happening today.</p>
      </div>

      {/* 1. Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
         <StatsCard label="Total Revenue" value="$45,231" trend="+20.1% from last month" color="text-emerald-600" />
         <StatsCard label="Active Projects" value="12" trend="+2 new this week" color="text-indigo-600" />
         <StatsCard label="Pending Tasks" value="4" trend="Urgent items" color="text-orange-600" />
         <StatsCard label="Team Velocity" value="92%" trend="+4% vs average" color="text-blue-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. Recent Activity Feed (Takes up 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={20} /></button>
            </div>
            
            <div className="space-y-6">
                <ActivityItem 
                    user="Sarah Chen" 
                    action="completed the task" 
                    target="Homepage Hero Section" 
                    time="2 hours ago"
                    icon={<CheckCircle2 size={18} className="text-emerald-600" />}
                    bg="bg-emerald-100"
                />
                <ActivityItem 
                    user="Mike Ross" 
                    action="commented on" 
                    target="Mobile App Navigation" 
                    time="4 hours ago"
                    icon={<div className="h-2 w-2 rounded-full bg-blue-600" />}
                    bg="bg-blue-100"
                />
                <ActivityItem 
                    user="You" 
                    action="uploaded 3 files to" 
                    target="Design Assets" 
                    time="5 hours ago"
                    icon={<ArrowUpRight size={18} className="text-indigo-600" />}
                    bg="bg-indigo-100"
                />
                <ActivityItem 
                    user="System" 
                    action="deployed build" 
                    target="v2.4.0-stable" 
                    time="Yesterday"
                    icon={<Clock size={18} className="text-purple-600" />}
                    bg="bg-purple-100"
                />
            </div>
        </div>

        {/* 3. Project Status List (Takes up 1 column) */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Active Projects</h3>
            <div className="space-y-6">
                <ProjectSummary name="Website Redesign" progress={75} color="bg-indigo-600" due="2 days left" />
                <ProjectSummary name="Mobile App V2" progress={45} color="bg-emerald-500" due="2 weeks left" />
                <ProjectSummary name="API Integration" progress={20} color="bg-orange-500" due="1 month left" />
                <ProjectSummary name="Q3 Marketing" progress={90} color="bg-purple-500" due="Completed" />
            </div>
            <button className="w-full mt-6 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                View All Projects
            </button>
        </div>

      </div>
    </div>
  );
}

// --- Helper Components ---

function StatsCard({ label, value, trend, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="text-sm font-medium text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-900 mb-2">{value}</div>
      <div className={`text-xs font-medium ${color}`}>{trend}</div>
    </div>
  );
}

function ActivityItem({ user, action, target, time, icon, bg }: any) {
    return (
        <div className="flex gap-4">
            <div className={`mt-1 h-8 w-8 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-900">
                    <span className="font-semibold">{user}</span> {action} <span className="font-medium text-indigo-600">{target}</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{time}</p>
            </div>
        </div>
    );
}

function ProjectSummary({ name, progress, color, due }: any) {
    return (
        <div>
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h4 className="text-sm font-semibold text-gray-900">{name}</h4>
                    <span className="text-xs text-gray-500">{due}</span>
                </div>
                <span className="text-xs font-bold text-gray-700">{progress}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
}