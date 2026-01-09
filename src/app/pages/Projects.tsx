import { useState } from 'react';
import { ModernKanbanBoard } from '../components/ModernKanbanBoard';
import { 
  Plus, Filter, Search, X, Calendar, User, LayoutGrid, 
  List as ListIcon, ChevronRight, ChevronDown, 
  Clock, CheckCircle2, AlertCircle
} from 'lucide-react';

export default function Projects() {
  const [viewMode, setViewMode] = useState<'board' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  
  // --- STATE FOR FEATURES ---
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState<'none' | 'assignee' | 'priority'>('none');
  const [selectedIssue, setSelectedIssue] = useState<any>(null);

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  return (
    <div className="flex h-full relative overflow-hidden bg-gray-50 dark:bg-gray-900/50">
      
      {/* MAIN CONTENT AREA */}
      <div className={`flex-1 flex flex-col p-8 h-full transition-all duration-300 ease-in-out ${selectedIssue ? 'mr-96' : ''}`}>
        
        {/* Header Section */}
        <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Workspaces</span>
              <span className="text-gray-300 dark:text-gray-600">/</span>
              <span className="font-medium text-gray-900 dark:text-white">Website Redesign</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Sprint Board</h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
              {/* View Toggle */}
              <div className="bg-white dark:bg-gray-800 p-1 rounded-xl flex items-center border border-gray-200 dark:border-gray-700 shadow-sm">
                  <button onClick={() => setViewMode('board')} className={`p-2 rounded-lg transition-all ${viewMode === 'board' ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'}`}><LayoutGrid size={18} /></button>
                  <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'}`}><ListIcon size={18} /></button>
              </div>

              {/* Search */}
              <div className="relative group">
                  <Search className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input 
                      type="text" 
                      placeholder="Search issues..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full sm:w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm text-gray-900 dark:text-white transition-all shadow-sm"
                  />
              </div>
              
              <button className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 dark:shadow-none active:scale-95">
                  <Plus size={18} />
                  <span className="hidden sm:inline">New Issue</span>
              </button>
          </div>
        </div>

        {/* --- CONTROLS BAR (Filters & Grouping) --- */}
        <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
            {/* Quick Filters */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">Quick Filters:</span>
                <FilterChip label="My Issues" active={activeFilters.includes('my_issues')} onClick={() => toggleFilter('my_issues')} />
                <FilterChip label="High Priority" active={activeFilters.includes('high_priority')} onClick={() => toggleFilter('high_priority')} />
                <FilterChip label="Recently Updated" active={activeFilters.includes('recent')} onClick={() => toggleFilter('recent')} />
            </div>
            
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block"></div>

            {/* Swimlane / Group By Toggle */}
            <div className="flex items-center gap-3 group">
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Group By:</span>
                 <div className="relative">
                    <select 
                        value={groupBy}
                        onChange={(e: any) => setGroupBy(e.target.value)}
                        className="text-sm bg-transparent border-none outline-none font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 cursor-pointer appearance-none pr-6"
                    >
                        <option value="none">None</option>
                        <option value="assignee">Assignee</option>
                        <option value="priority">Priority</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-0 top-1 text-gray-400 pointer-events-none group-hover:text-indigo-600" />
                 </div>
            </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto pr-1">
           {viewMode === 'board' ? (
               <ModernKanbanBoard />
           ) : (
               <ListViewTable 
                  groupBy={groupBy} 
                  onIssueClick={setSelectedIssue} 
                  filters={activeFilters}
               />
           )}
        </div>
      </div>

      {/* --- SLIDE-OVER ISSUE DETAILS --- */}
      <div 
        className={`fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl transform transition-transform duration-300 ease-bezier z-50 ${selectedIssue ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
         {selectedIssue && (
             <div className="h-full flex flex-col">
                 {/* Panel Header */}
                 <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30 backdrop-blur-sm">
                     <div className="flex items-center gap-2 text-sm text-gray-500">
                         <span className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">{selectedIssue.id}</span>
                         <span className="text-gray-300 dark:text-gray-700">|</span>
                         <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide ${
                            selectedIssue.status === 'Done' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                         }`}>
                            {selectedIssue.status}
                         </span>
                     </div>
                     <button onClick={() => setSelectedIssue(null)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                         <X size={20} />
                     </button>
                 </div>

                 {/* Panel Body */}
                 <div className="flex-1 overflow-y-auto p-6 space-y-8">
                     <div>
                         <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-snug">{selectedIssue.title}</h2>
                         <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                            User cannot navigate to the settings page from the profile dropdown on mobile devices. Needs immediate investigation.
                         </p>
                     </div>

                     <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                         <div>
                             <span className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Assignee</span>
                             <div className="flex items-center gap-2">
                                 <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] text-white font-bold shadow-sm">
                                     {selectedIssue.assignee.charAt(0)}
                                 </div>
                                 <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{selectedIssue.assignee}</span>
                             </div>
                         </div>
                         <div>
                             <span className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Priority</span>
                             <div className="flex items-center gap-1.5">
                                 <AlertCircle size={16} className={selectedIssue.priority === 'High' ? 'text-red-500' : 'text-blue-500'} />
                                 <span className={`text-sm font-medium ${selectedIssue.priority === 'High' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                     {selectedIssue.priority}
                                 </span>
                             </div>
                         </div>
                     </div>

                     {/* Activity Feed */}
                     <div>
                         <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                            <Clock size={16} /> Activity History
                         </h3>
                         <div className="relative pl-4 border-l-2 border-gray-100 dark:border-gray-800 space-y-6">
                             <div className="relative">
                                 <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-gray-900"></div>
                                 <p className="text-sm text-gray-600 dark:text-gray-300">
                                     <span className="font-medium text-gray-900 dark:text-white">Alex Morgan</span> changed status to <span className="font-medium text-indigo-600">In Progress</span>
                                 </p>
                                 <span className="text-xs text-gray-400 mt-1 block">2 hours ago</span>
                             </div>
                             <div className="relative">
                                 <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-700 ring-4 ring-white dark:ring-gray-900"></div>
                                 <p className="text-sm text-gray-600 dark:text-gray-300">
                                     Created by <span className="font-medium text-gray-900 dark:text-white">Sarah Chen</span>
                                 </p>
                                 <span className="text-xs text-gray-400 mt-1 block">Yesterday</span>
                             </div>
                         </div>
                     </div>
                 </div>
                 
                 {/* Footer Actions */}
                 <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex gap-3">
                     <button className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-md shadow-indigo-200 dark:shadow-none">Mark Complete</button>
                     <button className="px-6 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 rounded-xl text-sm font-medium transition-colors">Edit</button>
                 </div>
             </div>
         )}
      </div>

    </div>
  );
}

// --- SUB COMPONENTS ---

function FilterChip({ label, active, onClick }: any) {
    return (
        <button 
            onClick={onClick}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-200 ${
                active 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400 shadow-sm' 
                : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600'
            }`}
        >
            {label}
        </button>
    )
}

function ListViewTable({ groupBy, onIssueClick, filters }: any) {
    const issues = [
        { id: "PRO-102", title: "Redesign Homepage Header", status: "In Progress", assignee: "Sarah Chen", priority: "High", due: "Jan 24" },
        { id: "PRO-103", title: "Fix Mobile Menu Glitch", status: "Backlog", assignee: "Alex Morgan", priority: "Medium", due: "Jan 28" },
        { id: "PRO-104", title: "Update API Documentation", status: "Done", assignee: "Unassigned", priority: "Low", due: "Jan 20" },
        { id: "PRO-105", title: "User Dashboard Analytics", status: "In Progress", assignee: "Sarah Chen", priority: "High", due: "Feb 01" },
        { id: "PRO-106", title: "Implement SSO Login", status: "Backlog", assignee: "Alex Morgan", priority: "High", due: "Feb 05" },
    ];

    // Filter Logic
    const filteredIssues = issues.filter(issue => {
        if (filters.includes('high_priority') && issue.priority !== 'High') return false;
        if (filters.includes('my_issues') && issue.assignee !== 'Sarah Chen') return false; 
        return true;
    });

    // Grouping Logic
    const groups = groupBy === 'none' 
        ? { 'All Issues': filteredIssues } 
        : filteredIssues.reduce((acc: any, issue) => {
            const key = issue[groupBy as keyof typeof issue] || 'Unassigned';
            if (!acc[key]) acc[key] = [];
            acc[key].push(issue);
            return acc;
        }, {});

    return (
        <div className="space-y-8 pb-20">
            {Object.entries(groups).map(([groupName, groupIssues]: [string, any]) => (
                <div key={groupName} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {groupBy !== 'none' && (
                        <div className="px-6 py-3 bg-gray-50/80 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 backdrop-blur-sm">
                             <div className="p-1 bg-white dark:bg-gray-700 rounded shadow-sm">
                                <ChevronDown size={14} className="text-gray-500" />
                             </div>
                             <span className="font-bold text-sm text-gray-900 dark:text-white">{groupName}</span>
                             <span className="text-xs font-medium text-gray-500 bg-gray-200 dark:bg-gray-900 px-2 py-0.5 rounded-full">{groupIssues.length}</span>
                        </div>
                    )}
                    
                    <table className="w-full text-sm text-left">
                        {groupBy === 'none' && (
                             <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-medium">
                                <tr>
                                    <th className="px-6 py-4 w-24">Key</th>
                                    <th className="px-6 py-4 w-1/3">Title</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Assignee</th>
                                    <th className="px-6 py-4">Priority</th>
                                    <th className="px-6 py-4">Due Date</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                        )}
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                            {groupIssues.map((issue: any) => (
                                <tr 
                                    key={issue.id} 
                                    onClick={() => onIssueClick(issue)}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{issue.id}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{issue.title}</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={issue.status} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                                                {issue.assignee.charAt(0)}
                                            </div>
                                            <span className="text-gray-700 dark:text-gray-300">{issue.assignee}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold ${
                                            issue.priority === 'High' ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' : 
                                            issue.priority === 'Medium' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 
                                            'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                        }`}>
                                            {issue.priority === 'High' && <AlertCircle size={12} />}
                                            {issue.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{issue.due}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 inline-block text-gray-400 group-hover:text-indigo-600 transition-colors">
                                            <ChevronRight size={16} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'Done') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30"><CheckCircle2 size={12} className="mr-1"/> Done</span>;
    if (status === 'In Progress') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse"></div> In Progress</span>;
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">Backlog</span>;
}